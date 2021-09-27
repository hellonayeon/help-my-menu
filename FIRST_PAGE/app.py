from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

import requests
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
# client = MongoClient('mongodb://test:test@localhost', 27017) # EC2 업로드용
db = client.dbrecipe


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ingredient', methods=['GET'])
def listing():
    recipe_ingredient = list(db.recipe_ingredient.find({},{'_id':False}))
    return jsonify({'all_recipe_ingredient':recipe_ingredient})

@app.route('/ingredient', methods=['POST'])
def database_init():
    # 데이터 기본 정보 537개
    url = "http://211.237.50.150:7080/openapi/636efef2ee651816d34e0aa4bae9f1a0f131cab04e533fef4273222d9bdf56fd/json/Grid_20150827000000000226_1/1/537"
    requests_data = requests.get(url)
    if requests_data.status_code != 200 :
        print("오류 발생, code :", requests_data.status_code)
        return
    data_basic = requests_data.json()
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

        recipe_ingredient = list(db.recipe_ingredient.find({},{'_id':False, 'IRDNT_NM':True}))
        print(recipe_ingredient)


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

database_init()

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)
