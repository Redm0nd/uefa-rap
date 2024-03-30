import subprocess
import boto3
import os

s3 = boto3.client('s3')
bucket_name = 'uefa-rap'
source_prefix = 'UEFA2023-2/Resource/medias/clips/F/'
dest_prefix = 'UEFA2023-2/Resource/medias/clips/F/'

def convert_video(file_name):
    local_input_path = '/tmp/' + file_name
    local_output_path = '/tmp/converted_' + file_name
    s3.download_file(bucket_name, source_prefix + file_name, local_input_path)
    # Adjust FFmpeg parameters as needed for iOS compatibility
    subprocess.call(['ffmpeg', '-i', local_input_path, '-vcodec', 'h264', '-acodec', 'aac', '-movflags', 'faststart', local_output_path])
    os.remove(local_input_path)  # Remove downloaded file
    return local_output_path

def upload_to_s3(file_path, file_name):
    s3.upload_file(
        file_path,
        bucket_name,
        dest_prefix + file_name,
        ExtraArgs={'ContentType': 'video/mp4'}  # Set the ContentType here
    )
    os.remove(file_path)  # Clean up local converted file

def process_videos():
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix)
    if 'Contents' in response:
        for file in response['Contents']:
            file_key = file['Key']
            file_name = file_key.split('/')[-1]
            if file_name and file_name.endswith('.mp4'):  # Ensuring it's a video file
                print(f'Processing {file_name}...')
                output_file_path = convert_video(file_name)
                upload_to_s3(output_file_path, file_name)

process_videos()
