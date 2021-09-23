import requests
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client.dbrecipe

# 데이터 기본 정보
url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000226_1/1/537"
requests_data = requests.get(url)
data_basic = requests_data.json()
db.recipe_basic.insert_many(data_basic['Grid_20150827000000000226_1']['row'])

for j in range(1,7001,1000):
    url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000227_1/{}/{}".format(j, j+999)
    requests_data = requests.get(url)
    data_ingre = requests_data.json()
    db.recipe_ingredient.insert_many(data_ingre['Grid_20150827000000000227_1']['row'])
    

for k in range(1,4001,1000):
    url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000228_1/{}/{}".format(k, k+999)
    requests_data = requests.get(url)
    data_number = requests_data.json()
    db.recipe_number.insert_many(data_number['Grid_20150827000000000228_1']['row'])