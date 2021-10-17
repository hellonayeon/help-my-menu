import requests
import boto3
import os
from pymongo import MongoClient

# 실행 시키신 후에 저장된 S3로 가셔서 recipe_image 폴더의 메타데이터(image/jpg)와 퍼블릭을 설정해주셔야 합니다.

client = MongoClient(os.environ['MONGO_DB_PATH'])
db = client.dbname

data = db.collection.find({}, {"IMG_URL":1, "_id":0})

# [1] Open API 서버에서 제공하는 이미지 가져오기
# [2] S3에 저장하기
for i in data :
    url = i['IMG_URL'] # img URL만 뽑아옴

    r = requests.get(url, stream=True)
    session = boto3.Session()
    s3 = session.resource('s3')

    bucket_name = os.environ["BUCKET_NAME"] # 버킷이름
    file_name = url.split("/")[-1]          # 파일이름
    key = f'folder1/{file_name}'       # 폴더명/파일이름

    bucket = s3.Bucket(bucket_name)
    bucket.upload_fileobj(r.raw, key)

# [3] S3에 저장한 이미지 객체 URL로 데이터베이스 내용 변경해주기
for i in data:
    origin_url = i['IMG_URL']

    fname = origin_url.split('/')[-1]
    new_url = f'{os.environ["BUCKET_ENDPOINT"]}/folder1/{fname}'

    db.collection.update_one({"IMG_URL": origin_url}, {"$set": {"IMG_URL": new_url}})
