import json
import boto3
import tempfile
import os
import zipfile
from urllib.parse import unquote_plus

# Initialize AWS clients
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda function to prepare thumbnail processing batches
    Groups thumbnails into manageable batches for parallel processing
    """
    
    try:
        # Get input from previous step
        source_bucket = event['source_bucket']
        source_key = event['source_key']
        content_structure = event['content_structure']
        processing_id = event['processing_id']
        
        print(f"Preparing thumbnail batches from: s3://{source_bucket}/{source_key}")
        
        # Download ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(source_bucket, source_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Create thumbnail batches
        thumbnail_batches = create_thumbnail_batches(temp_zip_path, content_structure)
        
        # Clean up
        os.unlink(temp_zip_path)
        
        return {
            'statusCode': 200,
            'source_bucket': source_bucket,
            'source_key': source_key,
            'content_structure': content_structure,
            'processing_id': processing_id,
            'thumbnail_batches': thumbnail_batches,
            'total_batches': len(thumbnail_batches),
            'total_thumbnails': sum(len(batch['thumbnails']) for batch in thumbnail_batches)
        }
        
    except Exception as e:
        print(f"Error in thumbnail batch preparation: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'message': 'Thumbnail batch preparation failed'
        }

def create_thumbnail_batches(zip_path, content_structure):
    """
    Create batches of thumbnails for parallel processing
    Each batch contains 15-20 thumbnails (GIF to PNG is faster than video processing)
    """
    
    BATCH_SIZE = 15  # Process 15 thumbnails per Lambda execution
    thumbnail_batches = []
    
    # Find all thumbnail files in the ZIP
    all_thumbnails = []
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        file_list = zip_ref.namelist()
        
        for file_path in file_list:
            if file_path.startswith('Resource/medias/th/') and file_path.endswith('.gif'):
                filename = file_path.split('/')[-1]  # e.g., A1.gif
                category_letter = extract_category_from_filename(filename)
                
                if category_letter:
                    thumbnail_info = {
                        'filename': filename,
                        'path': file_path,
                        'category': category_letter,
                        'id': extract_id_from_filename(filename)
                    }
                    all_thumbnails.append(thumbnail_info)
    
    print(f"Total thumbnails to process: {len(all_thumbnails)}")
    
    # Create batches
    for i in range(0, len(all_thumbnails), BATCH_SIZE):
        batch_thumbnails = all_thumbnails[i:i + BATCH_SIZE]
        
        batch = {
            'batch_id': f"thumbnail_batch_{i//BATCH_SIZE + 1}",
            'source_bucket': '',  # Will be filled by Step Functions
            'source_key': '',     # Will be filled by Step Functions
            'processing_id': '',  # Will be filled by Step Functions
            'thumbnails': batch_thumbnails,
            'batch_size': len(batch_thumbnails)
        }
        
        thumbnail_batches.append(batch)
    
    print(f"Created {len(thumbnail_batches)} thumbnail processing batches")
    return thumbnail_batches

def extract_category_from_filename(filename):
    """
    Extract category letter from filename
    E.g., 'A15.gif' -> 'A', 'H3.gif' -> 'H'
    """
    import re
    match = re.search(r'^([A-N])\d+', filename)
    return match.group(1) if match else None

def extract_id_from_filename(filename):
    """
    Extract numeric ID from filename
    E.g., 'A15.gif' -> 15, 'B3.gif' -> 3
    """
    import re
    match = re.search(r'[A-N](\d+)', filename)
    return int(match.group(1)) if match else 0
