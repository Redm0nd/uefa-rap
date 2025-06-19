import json
import boto3
import tempfile
import os
import time
import zipfile
from urllib.parse import unquote_plus

# Initialize AWS clients
s3_client = boto3.client('s3')
cloudfront_client = boto3.client('cloudfront')

def lambda_handler(event, context):
    """
    Lambda function to deploy processed content to website
    Generates app-clips.json and uploads all content to S3
    """
    
    try:
        # Get input from Step Functions
        source_bucket = event['source_bucket']
        source_key = event['source_key']
        content_structure = event['content_structure']
        processing_id = event['processing_id']
        
        # Get environment variables
        website_bucket = os.environ['WEBSITE_BUCKET']
        cloudfront_distribution_id = os.environ['CLOUDFRONT_DISTRIBUTION_ID']
        base_url = os.environ['BASE_URL']  # e.g., https://dev.uefa-rap.com
        
        print(f"Deploying content to: s3://{website_bucket}")
        
        # Download ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(source_bucket, source_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Deploy content
        deployment_result = deploy_content_to_website(
            temp_zip_path, 
            content_structure, 
            website_bucket, 
            base_url
        )
        
        # Invalidate CloudFront cache
        invalidation_result = invalidate_cloudfront_cache(cloudfront_distribution_id)
        
        # Clean up
        os.unlink(temp_zip_path)
        
        return {
            'statusCode': 200,
            'source_bucket': source_bucket,
            'source_key': source_key,
            'website_bucket': website_bucket,
            'processing_id': processing_id,
            'deployment_results': deployment_result,
            'invalidation_id': invalidation_result.get('Invalidation', {}).get('Id'),
            'website_url': base_url
        }
        
    except Exception as e:
        print(f"Error in content deployment: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'message': 'Content deployment failed'
        }

def deploy_content_to_website(zip_path, content_structure, website_bucket, base_url):
    """
    Deploy all content to website S3 bucket
    """
    
    deployment_stats = {
        'files_uploaded': 0,
        'videos_uploaded': 0,
        'images_uploaded': 0,
        'thumbnails_generated': 0,
        'json_generated': True
    }
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        
        # Extract and upload media files
        for category in content_structure['categories']:
            category_letter = category['letter']
            
            # Upload videos
            for video in category.get('videos', []):
                try:
                    # Extract video from ZIP
                    video_data = zip_ref.read(video['path'])
                    
                    # Upload to S3 (files are directly in clips folder)
                    s3_key = f"UEFA2025-1/Resource/medias/clips/{video['filename']}"
                    s3_client.put_object(
                        Bucket=website_bucket,
                        Key=s3_key,
                        Body=video_data,
                        ContentType='video/mp4'
                    )
                    
                    deployment_stats['files_uploaded'] += 1
                    deployment_stats['videos_uploaded'] += 1
                    
                except Exception as e:
                    print(f"Error uploading video {video['path']}: {str(e)}")
            
            # Upload decision images
            for decision in category.get('decisions', []):
                try:
                    # Extract image from ZIP
                    image_data = zip_ref.read(decision['path'])
                    
                    # Upload to S3 (files are directly in decisions folder)
                    s3_key = f"UEFA2025-1/Resource/medias/images/decisions/{decision['filename']}"
                    
                    s3_client.put_object(
                        Bucket=website_bucket,
                        Key=s3_key,
                        Body=image_data,
                        ContentType='image/png'
                    )
                    
                    deployment_stats['files_uploaded'] += 1
                    deployment_stats['images_uploaded'] += 1
                    
                except Exception as e:
                    print(f"Error uploading decision image {decision['path']}: {str(e)}")
            
            # Upload explanation images
            for explanation in category.get('explanations', []):
                try:
                    # Extract image from ZIP
                    image_data = zip_ref.read(explanation['path'])
                    
                    # Upload to S3 (files are directly in explanations folder)
                    s3_key = f"UEFA2025-1/Resource/medias/images/explanations/{explanation['filename']}"
                    
                    s3_client.put_object(
                        Bucket=website_bucket,
                        Key=s3_key,
                        Body=image_data,
                        ContentType='image/png'
                    )
                    
                    deployment_stats['files_uploaded'] += 1
                    deployment_stats['images_uploaded'] += 1
                    
                except Exception as e:
                    print(f"Error uploading explanation image {explanation['path']}: {str(e)}")
    
    # Generate and upload app-clips.json
    app_clips_json = generate_app_clips_json(content_structure, base_url)
    
    try:
        s3_client.put_object(
            Bucket=website_bucket,
            Key='app-clips.json',
            Body=json.dumps(app_clips_json, indent=2),
            ContentType='application/json',
            CacheControl='no-cache'  # Ensure fresh data
        )
        
        deployment_stats['files_uploaded'] += 1
        print("app-clips.json uploaded successfully")
        
    except Exception as e:
        print(f"Error uploading app-clips.json: {str(e)}")
        deployment_stats['json_generated'] = False
    
    return deployment_stats

def generate_app_clips_json(content_structure, base_url):
    """
    Generate the complete app-clips.json structure from processed content
    """
    
    # Start with the dictionary structure (categories with their decision options)
    app_clips = {
        "dictionary": {}
    }
    
    # Add dictionary entries from OCR results
    for category in content_structure['categories']:
        if category.get('type') == 'dictionary' and category.get('dictionary_options'):
            category_letter = category['letter']
            
            # Create empty dictionary for this category
            app_clips["dictionary"][category_letter] = {}
            
            # Add each extracted option with empty value
            for option in category['dictionary_options']:
                app_clips["dictionary"][category_letter][option] = ""
    
    # Add category content
    for category in content_structure['categories']:
        category_letter = category['letter']
        
        # Determine category info
        category_info = get_category_info(category_letter)
        
        app_clips[category_letter] = {
            "letter": category_letter,
            "category": category_info['name'],
            "dictionary": category.get('type') == 'dictionary',
            "translation": category.get('type') == 'translation',
            "content": []
        }
        
        # Generate content entries
        content_entries = generate_content_entries(category, base_url)
        app_clips[category_letter]["content"] = content_entries
    
    return app_clips

def generate_content_entries(category, base_url):
    """
    Generate content entries for a category
    """
    
    content_entries = []
    category_letter = category['letter']
    
    # Get all video IDs and sort them
    video_ids = sorted(set(v['id'] for v in category.get('videos', [])))
    
    for video_id in video_ids:
        # Find matching video
        video = next((v for v in category.get('videos', []) if v['id'] == video_id), None)
        
        if video:
            entry = {
                "id": video_id - 1,  # 0-based indexing for the app
                "video": f"{base_url}/UEFA2025-1/Resource/medias/clips/{video['filename']}",
                "thumbnail": f"{base_url}/UEFA2025-1/Resource/medias/th/{video['filename'].replace('.mp4', '.png')}"
            }
            
            # Add decision or explanation image (files are directly in folders)
            if category.get('type') == 'dictionary':
                entry["decision"] = f"{base_url}/UEFA2025-1/Resource/medias/images/decisions/{category_letter}{video_id}.png"
            elif category.get('type') == 'translation':
                entry["decision"] = f"{base_url}/UEFA2025-1/Resource/medias/images/explanations/{category_letter}{video_id}.png"
            
            content_entries.append(entry)
    
    return content_entries

def get_category_info(category_letter):
    """
    Get category name and type information
    """
    
    category_names = {
        'A': {'name': 'Challenges', 'type': 'dictionary'},
        'B': {'name': 'DOGSO-SPA', 'type': 'dictionary'},
        'C': {'name': 'Handball', 'type': 'dictionary'},
        'D': {'name': 'Holding', 'type': 'dictionary'},
        'E': {'name': 'Illegal Use of the Arms', 'type': 'dictionary'},
        'F': {'name': 'Penalty Area Decisions', 'type': 'dictionary'},
        'G': {'name': 'Simulation', 'type': 'dictionary'},
        'H': {'name': 'Advantage', 'type': 'translation'},
        'J': {'name': 'Control', 'type': 'translation'},
        'K': {'name': 'Dissent', 'type': 'translation'},
        'L': {'name': 'Offside', 'type': 'dictionary'},
        'M': {'name': 'Teamwork', 'type': 'translation'},
        'N': {'name': 'Laws of the Game', 'type': 'translation'}
    }
    
    return category_names.get(category_letter, {'name': 'Unknown', 'type': 'unknown'})

def invalidate_cloudfront_cache(distribution_id):
    """
    Invalidate CloudFront cache to ensure fresh content
    """
    
    try:
        response = cloudfront_client.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ['/*']
                },
                'CallerReference': f"uefa-deployment-{int(time.time())}"
            }
        )
        
        print(f"CloudFront invalidation created: {response['Invalidation']['Id']}")
        return response
        
    except Exception as e:
        print(f"Error creating CloudFront invalidation: {str(e)}")
        return {'error': str(e)}
