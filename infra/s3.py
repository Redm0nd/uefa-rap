import boto3
from botocore.exceptions import ClientError

def organize_clips_in_s3(bucket_name, source_prefix, target_prefix, dry_run=False):
    s3 = boto3.client('s3')

    # List all clips in the specified path
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix)
    except ClientError as e:
        print(f"Error listing objects: {e}")
        return

    if 'Contents' in response:
        for item in response['Contents']:
            file_name = item['Key'].split('/')[-1]  # Get the file name, e.g., A1.mp4
            if file_name.endswith('.mp4'):
                letter = file_name[0]  # Get the first letter, e.g., 'A' from 'A1.mp4'
                target_key = f"{target_prefix}{letter}/{file_name}"

                if dry_run:
                    print(f"Dry run: Would copy {file_name} to {target_key}")
                else:
                    # Copy the clip to the new location
                    copy_source = {'Bucket': bucket_name, 'Key': item['Key']}
                    try:
                        s3.copy_object(Bucket=bucket_name, CopySource=copy_source, Key=target_key)
                        print(f"Copied {file_name} to {target_key}")
                    except ClientError as e:
                        print(f"Error copying object: {e}")

def main():
    bucket_name = 'uefa-rap'
    source_prefix = 'UEFA2023-1/Resource/medias/clips/'
    target_prefix = 'clips/'  # New target prefix
    dry_run = False  # Set to False to perform actual operations
    organize_clips_in_s3(bucket_name, source_prefix, target_prefix, dry_run)

if __name__ == "__main__":
    main()
