import boto3

s3_client = boto3.client('s3')
bucket_name = 'uefa-rap'
prefix = 'UEFA2023-2/Resource/medias/images/explanations/'
dry_run = False  # Set to False to perform the actual move

def move_videos():
    paginator = s3_client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
        for content in page.get('Contents', []):
            key = content['Key']
            if key.endswith('.png') and len(key) > len(prefix):
                letter = key[len(prefix)].upper()
                new_key = f"{prefix}{letter}/{key[len(prefix):]}"
                if dry_run:
                    print(f"[DRY RUN] Would move {key} to {new_key}")
                else:
                    copy_source = {'Bucket': bucket_name, 'Key': key}
                    
                    # Copy the object to the new location
                    s3_client.copy_object(Bucket=bucket_name, CopySource=copy_source, Key=new_key)
                    
                    # Delete the original object
                    s3_client.delete_object(Bucket=bucket_name, Key=key)
                    print(f"Moved {key} to {new_key}")

move_videos()
