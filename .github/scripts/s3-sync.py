import boto3
import os

s3 = boto3.client('s3')
bucket_name = 'uefa-rap'

def upload_files(path):
    for root, dirs, files in os.walk(path):
        for file in files:
            local_path = os.path.join(root, file)
            s3_path = os.path.relpath(local_path, path)
            s3.upload_file(local_path, bucket_name, s3_path)

upload_files('.')
