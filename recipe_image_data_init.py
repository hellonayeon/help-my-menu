import requests
import boto3
import os
from pymongo import MongoClient

# 실행 시키신 후에 저장된 S3로 가셔서 recipe_image 폴더의 메타데이터(image/jpg)와 퍼블릭을 설정해주셔야 합니다.

client = MongoClient(os.environ['MONGO_DB_PATH'])
db = client.dbrecipe

data = db.recipe_basic.find({}, {"IMG_URL":1, "_id":0})

for i in data :
    url = i['IMG_URL'] # img URL만 뽑아옴
    
    r = requests.get(url, stream=True)
    session = boto3.Session()
    s3 = session.resource('s3')

    bucket_name = os.environ["BUCKET_NAME"] # 버킷이름
    file_name = url.split("/")[-1]          # 파일이름
    key = f'recipe_image/{file_name}'       # 폴더명/파일이름

    bucket = s3.Bucket(bucket_name)
    bucket.upload_fileobj(r.raw, key)