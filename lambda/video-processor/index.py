import json
import boto3
import tempfile
import os
import subprocess
import zipfile
from urllib.parse import unquote_plus

# Initialize AWS clients
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda function to process a batch of videos with ffmpeg
    Converts videos to mobile-friendly format (h264/aac)
    """
    
    try:
        # Get batch input from Step Functions Map state
        batch_id = event.get('batch_id', 'unknown_batch')
        videos = event.get('videos', [])
        source_bucket = event.get('source_bucket')
        source_key = event.get('source_key')
        processing_id = event.get('processing_id')
        
        print(f"Processing video batch {batch_id} with {len(videos)} videos")
        
        # Download ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(source_bucket, source_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Process only the videos in this batch
        processed_videos = process_video_batch_from_zip(temp_zip_path, videos)
        
        # Clean up
        os.unlink(temp_zip_path)
        
        return {
            'statusCode': 200,
            'batch_id': batch_id,
            'videos_processed': len(processed_videos),
            'processed_videos': processed_videos,
            'processing_summary': {
                'successful': len([v for v in processed_videos if v.get('success', False)]),
                'failed': len([v for v in processed_videos if not v.get('success', False)])
            }
        }
        
    except Exception as e:
        print(f"Error in video batch processing: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'message': f'Video batch processing failed for batch {event.get("batch_id", "unknown")}'
        }

def process_video_batch_from_zip(zip_path, video_batch):
    """
    Process a specific batch of videos from ZIP file using ffmpeg
    """
    
    processed_videos = []
    website_bucket = os.environ.get('WEBSITE_BUCKET')
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for video in video_batch:
            video_result = {
                'filename': video['filename'],
                'category': video['category'],
                'success': False,
                'error': None
            }
            
            try:
                print(f"Processing video: {video['filename']} (Category {video['category']})")
                
                # Extract video from ZIP
                video_data = zip_ref.read(video['path'])
                
                # Process video with ffmpeg
                processed_video_data = convert_video_mobile_friendly(
                    video_data, 
                    video['filename']
                )
                
                if processed_video_data:
                    # Upload processed video to website S3 bucket
                    s3_key = f"UEFA2025-1/Resource/medias/clips/{video['filename']}"
                    s3_client.put_object(
                        Bucket=website_bucket,
                        Key=s3_key,
                        Body=processed_video_data,
                        ContentType='video/mp4',
                        ContentDisposition='inline'
                    )
                    
                    video_result['success'] = True
                    print(f"✅ Processed and uploaded: {video['filename']}")
                else:
                    video_result['error'] = "FFmpeg processing failed"
                    print(f"❌ Failed to process: {video['filename']}")
                
            except Exception as e:
                video_result['error'] = str(e)
                print(f"❌ Error processing video {video['filename']}: {str(e)}")
            
            processed_videos.append(video_result)
    
    return processed_videos

def convert_video_mobile_friendly(video_data, filename):
    """
    Convert video to mobile-friendly format using ffmpeg
    Based on your convert-videos.py script
    """
    
    try:
        # Create temporary files
        input_path = f"/tmp/input_{filename}"
        output_path = f"/tmp/output_{filename}"
        
        # Write input video data
        with open(input_path, 'wb') as f:
            f.write(video_data)
        
        # FFmpeg command based on your script
        # -vcodec h264: H.264 video codec (widely supported)
        # -acodec aac: AAC audio codec (widely supported)
        # -movflags faststart: Optimize for streaming/web playback
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vcodec', 'h264',
            '-acodec', 'aac', 
            '-movflags', 'faststart',
            '-y',  # Overwrite output file
            output_path
        ]
        
        # Run ffmpeg
        result = subprocess.run(
            ffmpeg_cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0:
            # Read processed video
            with open(output_path, 'rb') as f:
                processed_data = f.read()
            
            # Clean up temp files
            os.remove(input_path)
            os.remove(output_path)
            
            return processed_data
        else:
            print(f"FFmpeg error: {result.stderr}")
            return None
            
    except subprocess.TimeoutExpired:
        print(f"FFmpeg timeout for {filename}")
        return None
    except Exception as e:
        print(f"Video conversion error for {filename}: {str(e)}")
        return None
    finally:
        # Clean up temp files if they exist
        for temp_file in [input_path, output_path]:
            if os.path.exists(temp_file):
                os.remove(temp_file)
