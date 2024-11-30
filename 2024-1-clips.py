import os
import boto3
import argparse
from pathlib import Path
import shutil

# Initialize S3 client
s3 = boto3.client('s3')
bucket_name = 'uefa-rap'
base_prefix = 'UEFA2024-1/Resource/medias/clips/'

# Local paths
local_clips_dir = '/Users/dylanredmond/Downloads/UEFA2024-1/Resource/medias/clips/'
temp_dir = '/tmp/uefa_clips/'

def get_unique_prefixes(local_clips_dir):
    """
    Identify unique prefixes from filenames in the clips directory.
    """
    prefixes = set()
    for file_name in os.listdir(local_clips_dir):
        if file_name.endswith('.mp4'):  # Only process video files
            prefix = file_name[0].upper()  # Get the first character as the prefix
            prefixes.add(prefix)
    return prefixes

def organize_clips(local_clips_dir, temp_dir, dry_run=False):
    """
    Organize clips into subfolders based on their prefix.
    """
    if not dry_run and os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)  # Clean up temp directory if it exists
    if not dry_run:
        os.makedirs(temp_dir, exist_ok=True)

    # Dynamically get unique prefixes
    prefixes = get_unique_prefixes(local_clips_dir)

    # Process each prefix
    for prefix in prefixes:
        folder_path = os.path.join(temp_dir, prefix)
        if dry_run:
            print(f"[DRY RUN] Would create folder: {folder_path}")
        else:
            os.makedirs(folder_path, exist_ok=True)  # Create folder if it doesn't exist

    # Move files into their respective folders
    for file_name in os.listdir(local_clips_dir):
        if file_name.endswith('.mp4'):  # Only process video files
            prefix = file_name[0].upper()
            source_path = os.path.join(local_clips_dir, file_name)
            destination_path = os.path.join(temp_dir, prefix, file_name)
            if dry_run:
                print(f"[DRY RUN] Would move {source_path} to {destination_path}")
            else:
                shutil.copy2(source_path, destination_path)
                print(f"Moved {file_name} to {destination_path}")

    if dry_run:
        print("[DRY RUN] Organization step completed. No changes made.")
    else:
        print(f"Clips organized in {temp_dir}")

def upload_to_s3(temp_dir, base_prefix, dry_run=False):
    """
    Upload organized content to S3 with the correct folder structure.
    """
    for root, _, files in os.walk(temp_dir):
        for file_name in files:
            local_file_path = os.path.join(root, file_name)
            s3_key = os.path.relpath(local_file_path, temp_dir)  # Generate S3 key
            s3_key = f"{base_prefix}{s3_key}"  # Prepend base prefix for S3 path

            if dry_run:
                print(f"[DRY RUN] Would upload {file_name} to {s3_key}")
            else:
                print(f"Uploading {file_name} to {s3_key}...")
                s3.upload_file(local_file_path, bucket_name, s3_key)
    if dry_run:
        print("[DRY RUN] Upload step completed. No files uploaded.")
    else:
        print("All files uploaded to S3.")

def main(dry_run):
    """
    Main workflow: organize clips and upload to S3.
    """
    organize_clips(local_clips_dir, temp_dir, dry_run)
    upload_to_s3(temp_dir, base_prefix, dry_run)

if __name__ == "__main__":
    # Add argument parser for dry run
    parser = argparse.ArgumentParser(description="Organize and upload UEFA clips to S3.")
    parser.add_argument("--dry-run", action="store_true", help="Perform a dry run without making changes or uploading files.")
    args = parser.parse_args()

    main(dry_run=args.dry_run)
