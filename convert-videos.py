import subprocess
import boto3
import os

s3 = boto3.client('s3')
bucket_name = 'uefa-rap'
base_prefix = 'UEFA2024-1/Resource/medias/clips/'

def get_directories(prefix):
    directories = set()
    result = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix, Delimiter='/')
    for content in result.get('CommonPrefixes', []):
        directories.add(content['Prefix'])
    return directories

def convert_video(file_name, source_prefix):
    local_input_path = '/tmp/' + file_name
    local_output_path = '/tmp/converted_' + file_name
    s3.download_file(bucket_name, source_prefix + file_name, local_input_path)
    subprocess.call(['ffmpeg', '-i', local_input_path, '-vcodec', 'h264', '-acodec', 'aac', '-movflags', 'faststart', local_output_path])
    os.remove(local_input_path)
    return local_output_path

def upload_to_s3(file_path, file_name, dest_prefix):
    s3.upload_file(
        file_path,
        bucket_name,
        dest_prefix + file_name,
        ExtraArgs={'ContentType': 'video/mp4'}
    )
    os.remove(file_path)

def process_videos(source_prefix, dest_prefix):
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix)
    if 'Contents' in response:
        for file in response['Contents']:
            file_key = file['Key']
            file_name = file_key.split('/')[-1]
            if file_name and file_name.endswith('.mp4'):
                print(f'Processing {file_name}...')
                output_file_path = convert_video(file_name, source_prefix)
                upload_to_s3(output_file_path, file_name, dest_prefix)

directories = get_directories(base_prefix)
for dir_prefix in directories:
    source_prefix = dir_prefix
    dest_prefix = dir_prefix 
    process_videos(source_prefix, dest_prefix)
