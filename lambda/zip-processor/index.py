import json
import boto3
import zipfile
import tempfile
import os
from urllib.parse import unquote_plus

# Initialize AWS clients
s3_client = boto3.client('s3')
stepfunctions_client = boto3.client('stepfunctions')

def lambda_handler(event, context):
    """
    Lambda function to process UEFA ZIP uploads
    Triggered by S3 upload events
    """
    
    try:
        # Parse S3 event
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        object_key = unquote_plus(event['Records'][0]['s3']['object']['key'])
        
        print(f"Processing ZIP file: s3://{bucket_name}/{object_key}")
        
        # Validate it's a ZIP file
        if not object_key.lower().endswith('.zip'):
            raise ValueError("File is not a ZIP archive")
        
        # Download ZIP file to temporary directory
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(bucket_name, object_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Extract and validate ZIP structure
        extracted_content = extract_and_validate_zip(temp_zip_path)
        
        # Clean up temporary file
        os.unlink(temp_zip_path)
        
        # Prepare data for Step Functions workflow
        workflow_input = {
            'source_bucket': bucket_name,
            'source_key': object_key,
            'content_structure': extracted_content,
            'processing_id': context.aws_request_id,
            'timestamp': context.log_stream_name
        }
        
        # Start the Step Functions workflow
        response = stepfunctions_client.start_execution(
            stateMachineArn=os.environ['STEP_FUNCTION_ARN'],
            name=f"uefa-processing-{context.aws_request_id}",
            input=json.dumps(workflow_input)
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'ZIP processing initiated successfully',
                'execution_arn': response['executionArn'],
                'content_summary': {
                    'categories': len(extracted_content.get('categories', [])),
                    'total_videos': sum(len(cat.get('videos', [])) for cat in extracted_content.get('categories', [])),
                    'total_images': sum(len(cat.get('images', [])) for cat in extracted_content.get('categories', []))
                }
            })
        }
        
    except Exception as e:
        print(f"Error processing ZIP file: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to process ZIP file'
            })
        }

def extract_and_validate_zip(zip_path):
    """
    Extract ZIP file and validate UEFA structure
    Expected structure:
    - Resource/medias/clips/[A-N]/[A-N][1-9].mp4
    - Resource/medias/images/decisions/[A-N]/[A-N][1-9].png  
    - Resource/medias/images/explanations/[A-N]/[A-N][1-9].png
    - Resource/en/[1-16].xml (optional)
    """
    
    content_structure = {
        'categories': [],
        'metadata': {},
        'validation_status': 'pending'
    }
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        file_list = zip_ref.namelist()
        
        # Group files by category
        categories = {}
        
        for file_path in file_list:
            if file_path.startswith('Resource/medias/clips/'):
                # Extract filename from clips (files are directly in clips folder)
                parts = file_path.split('/')
                if len(parts) >= 4:  # Resource/medias/clips/[file]
                    filename = parts[3]
                    
                    if filename.endswith('.mp4'):
                        # Extract category from filename (e.g., A1.mp4 -> A)
                        category = extract_category_from_filename(filename)
                        
                        if category not in categories:
                            categories[category] = {
                                'letter': category,
                                'videos': [],
                                'decisions': [],
                                'explanations': [],
                                'thumbnails': []
                            }
                        
                        categories[category]['videos'].append({
                            'filename': filename,
                            'path': file_path,
                            'id': extract_id_from_filename(filename)
                        })
            
            elif file_path.startswith('Resource/medias/images/decisions/'):
                # Extract decision images (files are directly in decisions folder)
                parts = file_path.split('/')
                if len(parts) >= 5:  # Resource/medias/images/decisions/[file]
                    filename = parts[4]
                    
                    if filename.endswith('.png'):
                        # Extract category from filename (e.g., A1.png -> A)
                        category = extract_category_from_filename(filename)
                        
                        if category not in categories:
                            categories[category] = {
                                'letter': category,
                                'videos': [],
                                'decisions': [],
                                'explanations': [],
                                'thumbnails': []
                            }
                        
                        categories[category]['decisions'].append({
                            'filename': filename,
                            'path': file_path,
                            'id': extract_id_from_filename(filename)
                        })
            
            elif file_path.startswith('Resource/medias/images/explanations/'):
                # Extract explanation images (files are directly in explanations folder)
                parts = file_path.split('/')
                if len(parts) >= 5:  # Resource/medias/images/explanations/[file]
                    filename = parts[4]
                    
                    if filename.endswith('.png'):
                        # Extract category from filename (e.g., H1.png -> H)
                        category = extract_category_from_filename(filename)
                        
                        if category not in categories:
                            categories[category] = {
                                'letter': category,
                                'videos': [],
                                'decisions': [],
                                'explanations': [],
                                'thumbnails': []
                            }
                        
                        categories[category]['explanations'].append({
                            'filename': filename,
                            'path': file_path,
                            'id': extract_id_from_filename(filename)
                        })
        
        # Convert categories dict to list and validate
        for category_letter, category_data in categories.items():
            # Determine category type based on content
            if category_data['decisions']:
                category_data['type'] = 'dictionary'  # Quiz category
            elif category_data['explanations']:
                category_data['type'] = 'translation'  # Educational category
            else:
                category_data['type'] = 'unknown'
            
            # Validate matching videos and images
            video_ids = set(v['id'] for v in category_data['videos'])
            decision_ids = set(d['id'] for d in category_data['decisions'])
            explanation_ids = set(e['id'] for e in category_data['explanations'])
            
            if category_data['type'] == 'dictionary':
                # Quiz categories should have matching videos and decisions
                category_data['validation'] = {
                    'video_count': len(video_ids),
                    'decision_count': len(decision_ids),
                    'matching_pairs': len(video_ids.intersection(decision_ids)),
                    'status': 'valid' if video_ids == decision_ids else 'warning'
                }
            elif category_data['type'] == 'translation':
                # Educational categories should have matching videos and explanations
                category_data['validation'] = {
                    'video_count': len(video_ids),
                    'explanation_count': len(explanation_ids),
                    'matching_pairs': len(video_ids.intersection(explanation_ids)),
                    'status': 'valid' if video_ids == explanation_ids else 'warning'
                }
            
            content_structure['categories'].append(category_data)
    
    # Overall validation
    total_categories = len(content_structure['categories'])
    valid_categories = sum(1 for cat in content_structure['categories'] 
                          if cat.get('validation', {}).get('status') == 'valid')
    
    content_structure['validation_status'] = 'valid' if valid_categories == total_categories else 'warning'
    content_structure['metadata'] = {
        'total_categories': total_categories,
        'valid_categories': valid_categories,
        'processing_timestamp': context.log_stream_name if 'context' in globals() else 'unknown'
    }
    
    return content_structure

def extract_category_from_filename(filename):
    """
    Extract category letter from filename
    E.g., 'A15.mp4' -> 'A', 'H3.png' -> 'H'
    """
    import re
    match = re.search(r'^([A-N])\d+', filename)
    return match.group(1) if match else None

def extract_id_from_filename(filename):
    """
    Extract numeric ID from filename
    E.g., 'A15.mp4' -> 15, 'B3.png' -> 3
    """
    import re
    match = re.search(r'[A-N](\d+)', filename)
    return int(match.group(1)) if match else 0
