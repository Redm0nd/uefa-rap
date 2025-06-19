import json
import boto3
import tempfile
import os
import zipfile
import io
from urllib.parse import unquote_plus
from PIL import Image

# Initialize AWS clients
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda function to process a batch of thumbnails
    Converts GIF thumbnails to PNG and uploads them
    Based on your create-pngs.py script
    """
    
    try:
        # Get batch input from Step Functions Map state
        batch_id = event.get('batch_id', 'unknown_batch')
        thumbnails = event.get('thumbnails', [])
        source_bucket = event.get('source_bucket')
        source_key = event.get('source_key')
        processing_id = event.get('processing_id')
        
        print(f"Processing thumbnail batch {batch_id} with {len(thumbnails)} thumbnails")
        
        # Download ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(source_bucket, source_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Process only the thumbnails in this batch
        processed_thumbnails = process_thumbnail_batch_from_zip(temp_zip_path, thumbnails)
        
        # Clean up
        os.unlink(temp_zip_path)
        
        return {
            'statusCode': 200,
            'batch_id': batch_id,
            'thumbnails_processed': len(processed_thumbnails),
            'processed_thumbnails': processed_thumbnails,
            'processing_summary': {
                'successful': len([t for t in processed_thumbnails if t.get('success', False)]),
                'failed': len([t for t in processed_thumbnails if not t.get('success', False)])
            }
        }
        
    except Exception as e:
        print(f"Error in thumbnail batch processing: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'message': f'Thumbnail batch processing failed for batch {event.get("batch_id", "unknown")}'
        }

def process_thumbnail_batch_from_zip(zip_path, thumbnail_batch):
    """
    Process a specific batch of thumbnails from ZIP file
    Converts GIFs to PNGs and uploads them
    """
    
    processed_thumbnails = []
    website_bucket = os.environ.get('WEBSITE_BUCKET')
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for thumbnail in thumbnail_batch:
            thumbnail_result = {
                'filename': thumbnail['filename'],
                'category': thumbnail['category'],
                'success': False,
                'error': None
            }
            
            try:
                print(f"Processing thumbnail: {thumbnail['filename']} (Category {thumbnail['category']})")
                
                # Convert GIF to PNG
                png_data = convert_gif_to_png(zip_ref, thumbnail['path'])
                
                if png_data:
                    # Upload PNG to website S3 bucket
                    png_filename = thumbnail['filename'].replace('.gif', '.png')
                    s3_key = f"UEFA2025-1/Resource/medias/th/{png_filename}"
                    
                    s3_client.put_object(
                        Bucket=website_bucket,
                        Key=s3_key,
                        Body=png_data,
                        ContentType='image/png'
                    )
                    
                    thumbnail_result['success'] = True
                    thumbnail_result['output_filename'] = png_filename
                    print(f"✅ Converted and uploaded: {thumbnail['filename']} → {png_filename}")
                else:
                    thumbnail_result['error'] = "GIF to PNG conversion failed"
                    print(f"❌ Failed to convert: {thumbnail['filename']}")
                
            except Exception as e:
                thumbnail_result['error'] = str(e)
                print(f"❌ Error processing thumbnail {thumbnail['filename']}: {str(e)}")
            
            processed_thumbnails.append(thumbnail_result)
    
    return processed_thumbnails

def convert_gif_to_png(zip_ref, gif_path):
    """
    Convert GIF to PNG
    Based on your create-pngs.py script
    """
    
    try:
        # Extract GIF data from ZIP
        gif_data = zip_ref.read(gif_path)
        
        # Open GIF with PIL
        gif_image = Image.open(io.BytesIO(gif_data))
        
        # Convert to PNG
        png_bytes = io.BytesIO()
        gif_image.save(png_bytes, format='PNG')
        png_bytes.seek(0)
        
        return png_bytes.read()
        
    except Exception as e:
        print(f"GIF to PNG conversion error for {gif_path}: {str(e)}")
        return None

def extract_category_from_filename(filename):
    """
    Extract category letter from filename
    E.g., 'A15.gif' -> 'A', 'H3.gif' -> 'H'
    """
    import re
    match = re.search(r'^([A-N])\d+', filename)
    return match.group(1) if match else None
