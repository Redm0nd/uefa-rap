import boto3
from PIL import Image
import io

s3_client = boto3.client('s3')
bucket_name = 'uefa-rap'
prefix = 'UEFA2023-2/Resource/medias/th/'
dry_run = False  # Set to False to perform the actual conversion and move

def convert_and_move_gifs():
    paginator = s3_client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        for content in page.get('Contents', []):
            key = content['Key']
            if key.endswith('.gif') and len(key) > len(prefix):
                letter = key[len(prefix)].upper()
                new_key = f"{prefix}{letter}/{key[len(prefix):-4]}.png"

                if dry_run:
                    print(f"[DRY RUN] Would convert {key} to {new_key}")
                else:
                    # Download the GIF file
                    gif_obj = s3_client.get_object(Bucket=bucket_name, Key=key)
                    gif = Image.open(io.BytesIO(gif_obj['Body'].read()))

                    # Convert to PNG
                    png_bytes = io.BytesIO()
                    gif.save(png_bytes, format='PNG')
                    png_bytes.seek(0)

                    # Upload the PNG file
                    s3_client.put_object(Bucket=bucket_name, Body=png_bytes, Key=new_key, ContentType='image/png')
                    
                    # Delete the original GIF file
                    s3_client.delete_object(Bucket=bucket_name, Key=key)
                    print(f"Converted and moved {key} to {new_key}")

convert_and_move_gifs()
