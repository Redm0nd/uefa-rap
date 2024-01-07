import boto3
import os
import argparse
import hashlib

def calculate_md5(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def file_changed(s3, bucket, s3_path, local_path):
    try:
        s3_object = s3.get_object(Bucket=bucket, Key=s3_path)
        s3_md5 = s3_object['ETag'].strip('"')
        local_md5 = calculate_md5(local_path)
        return s3_md5 != local_md5
    except s3.exceptions.NoSuchKey:
        return True

def upload_files(path, s3, bucket, dry_run=False):
    for root, dirs, files in os.walk(path):
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            local_path = os.path.join(root, file)
            s3_path = os.path.relpath(local_path, path)
            if dry_run:
                if file_changed(s3, bucket, s3_path, local_path):
                    print(f"Dry run: File {local_path} will be uploaded/updated in s3://{bucket}/{s3_path}")
                else:
                    print(f"Dry run: File {local_path} is unchanged in s3://{bucket}/{s3_path}")
            else:
                if file_changed(s3, bucket, s3_path, local_path):
                    s3.upload_file(local_path, bucket, s3_path)
                    print(f"Uploaded/Updated file {local_path} to s3://{bucket}/{s3_path}")
                else:
                    print(f"Skipped unchanged file {local_path}")

# Parse arguments
parser = argparse.ArgumentParser()
parser.add_argument('--dry-run', action='store_true', help='Perform a dry run')
args = parser.parse_args()

s3 = boto3.client('s3')
bucket_name = 'uefa-rap'

upload_files('.', s3, bucket_name, dry_run=args.dry_run)
