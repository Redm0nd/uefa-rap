import boto3

s3 = boto3.client('s3')
bucket_name = 'uefa-rap'
base_prefix_lower = 'uefa2023-2/resource/medias/clips/'
base_prefix_upper = 'UEFA2023-2/Resource/medias/clips/'

def move_clips():
    for letter in map(chr, range(ord('A'), ord('N')+1)):
        if letter == 'I':  # Skip 'I'
            continue

        source_prefix = f"{base_prefix_lower}{letter.lower()}/"
        dest_prefix = f"{base_prefix_upper}{letter}/"

        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix)

        while response:
            for content in response.get('Contents', []):
                file_key = content['Key']
                new_key = dest_prefix + file_key.split('/')[-1]

                # Copy the object to the new location
                s3.copy_object(Bucket=bucket_name, CopySource={'Bucket': bucket_name, 'Key': file_key}, Key=new_key)
                print(f'Copied {file_key} to {new_key}')

                # Delete the original object, if needed
                s3.delete_object(Bucket=bucket_name, Key=file_key)
                print(f'Deleted {file_key}')

            # Check if there are more objects to fetch
            if response['IsTruncated']:
                response = s3.list_objects_v2(Bucket=bucket_name, Prefix=source_prefix, ContinuationToken=response['NextContinuationToken'])
            else:
                response = None

move_clips()
