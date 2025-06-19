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
    Lambda function to prepare video processing batches
    Groups videos into manageable batches for parallel processing
    """
    
    try:
        # Get input from Step Functions
        source_bucket = event['source_bucket']
        source_key = event['source_key']
        content_structure = event['content_structure']
        processing_id = event['processing_id']
        
        print(f"Preparing video batches from: s3://{source_bucket}/{source_key}")
        
        # Download ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(source_bucket, source_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Create video batches
        video_batches = create_video_batches(temp_zip_path, content_structure)
        
        # Clean up
        os.unlink(temp_zip_path)
        
        return {
            'statusCode': 200,
            'source_bucket': source_bucket,
            'source_key': source_key,
            'content_structure': content_structure,
            'processing_id': processing_id,
            'video_batches': video_batches,
            'total_batches': len(video_batches),
            'total_videos': sum(len(batch['videos']) for batch in video_batches)
        }
        
    except Exception as e:
        print(f"Error in video batch preparation: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'message': 'Video batch preparation failed'
        }

def create_video_batches(zip_path, content_structure):
    """
    Create batches of videos for parallel processing
    Each batch contains 5-8 videos to stay within Lambda timeout limits
    """
    
    BATCH_SIZE = 6  # Process 6 videos per Lambda execution
    video_batches = []
    
    # Collect all videos from all categories
    all_videos = []
    for category in content_structure['categories']:
        for video in category.get('videos', []):
            video_with_category = video.copy()
            video_with_category['category'] = category['letter']
            all_videos.append(video_with_category)
    
    print(f"Total videos to process: {len(all_videos)}")
    
    # Create batches
    for i in range(0, len(all_videos), BATCH_SIZE):
        batch_videos = all_videos[i:i + BATCH_SIZE]
        
        batch = {
            'batch_id': f"video_batch_{i//BATCH_SIZE + 1}",
            'source_bucket': '',  # Will be filled by Step Functions
            'source_key': '',     # Will be filled by Step Functions
            'processing_id': '',  # Will be filled by Step Functions
            'videos': batch_videos,
            'batch_size': len(batch_videos)
        }
        
        video_batches.append(batch)
    
    print(f"Created {len(video_batches)} video processing batches")
    return video_batches
