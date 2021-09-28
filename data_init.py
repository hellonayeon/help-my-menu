import requests
from pymongo import MongoClient
from bson.objectid import ObjectId
import json

client = MongoClient('localhost', 27017)
# client = MongoClient('mongodb://test:test@localhost', 27017) # EC2 업로드용
db = client.dbrecipe

with open('recipe_ingredient_map.json') as file:
  data = json.load(file)
  file.close()

def database_del():
    if db.recipe_basic.estimated_document_count() :
        db.recipe_basic.delete_many({})
        db.recipe_ingredient.delete_many({})
        db.recipe_number.delete_many({})
        db.recipe_ingredient_map.delete_many({})

def database_init():
    # 데이터 기본 정보 537개
    url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000226_1/1/537"
    requests_data = requests.get(url)
    if requests_data.status_code != 200 :
        print("오류 발생, code :", requests_data.status_code)
        return
    data_basic = requests_data.json()
    for i in range(537):
        data_basic['Grid_20150827000000000226_1']['row'][i]["Liked"] = 0
    db.recipe_basic.insert_many(data_basic['Grid_20150827000000000226_1']['row'])


    # 데이터 재료정보 6104개
    for j in range(1,7001,1000):
        url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000227_1/{}/{}".format(j, j+999)
        requests_data = requests.get(url)
        if requests_data.status_code != 200 :
            print("오류 발생, code :", requests_data.status_code)
            return
        data_ingre = requests_data.json()
        db.recipe_ingredient.insert_many(data_ingre['Grid_20150827000000000227_1']['row'])


    # 데이터 과정정보 3022개
    for k in range(1,4001,1000):
        url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000228_1/{}/{}".format(k, k+999)
        requests_data = requests.get(url)
        if requests_data.status_code != 200 :
            print("오류 발생, code :", requests_data.status_code)
            return
        data_number = requests_data.json()
        db.recipe_number.insert_many(data_number['Grid_20150827000000000228_1']['row'])

    print("Success")

# DB 데이터 전처리
def data_preprocessing():
    # DB에 매핑 컬렉션 생성
    db.recipe_ingredient_map.insert_many(data)

    # 재료맵 정보를 바탕으로 중복 데이터 수정: DB 내용 변경
    irdnt_map = list(db.recipe_ingredient_map.find({}))  # 딕셔너리에 대한 리스트

    for irdnt in irdnt_map:
        irdnt_nm = irdnt["IRDNT_NM"]
        new_irdnt_nm = irdnt["NEW_IRDNT_NM"]

        db.recipe_ingredient.update_many({"IRDNT_NM": irdnt_nm}, {"$set": {"IRDNT_NM": new_irdnt_nm}})


database_del()
database_init()
data_preprocessing()
