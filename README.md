# UEFA RAP

## Introduction
Site to view UEFA RAP content outside of Mulppy in web browser, works on desktop & mobile. 

## Background
This project is hosted fully on AWS. Content is stored in S3 and served via CloudFront CDN with DNS provided by Route53.

- Project Link: [https://github.com/Redm0nd/uefa-rap](https://github.com/Redm0nd/uefa-rap)
- Site URL: [https://uefa-rap.com/](https://uefa-rap.com/)

## Updates
Original 2023-1 clips are available at uefa-rap.com
- 2023:2 content is available at [https://2023-2.uefa-rap.com/](https://2023-2.uefa-rap.com/)
- 2023:1 content is available at [https://2023-1.uefa-rap.com/](https://2023-1.uefa-rap.com/)

## Deployment
Uses a custom [S3 Sync](https://github.com/Redm0nd/uefa-rap/actions/workflows/s3-sync.yml) GitHub Action: 
- On a PR is opened this performs a dry-run of a sync of the changed content to the Bucket (Changes can be reviewed here)
- Once a PR is merged the Action runs again and actually pushes the code to the Bucket.

The code for this can be found in the [.github](https://github.com/Redm0nd/uefa-rap/tree/main/.github) directory. 

## ToDo
Some clips won't play on iOS due to video encoding - need to reupload with new encoding 