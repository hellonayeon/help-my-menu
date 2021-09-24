from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

from pymongo import MongoClient
client = MongoClient('localhost', 27017)
db = client.dbrecipe

@app.route('/')
def home():
    return render_template('index.html')

# 레시피 상세정보 API
@app.route('/recipe/detail', methods=['GET'])
def get_recipe_detail():
    recipe_id = int(request.args.get("recipe_id"))

    # 레시피 정보
    projection = {"RECIPE_NM_KO": True, "SUMRY": True, "NATION_NM": True,
                  "COOKING_TIME": True, "QNT": True, "IMG_URL": True, "_id": False}
    info = db.recipe_basic.find_one({"RECIPE_ID": recipe_id}, projection)
    print(info)

    # 상세정보(조리과정)
    projection = {"COOKING_NO": True, "COOKING_DC": True, "_id": False}
    detail = list(db.recipe_number.find({"RECIPE_ID": recipe_id}, projection))

    return jsonify({"info":info, "detail": detail})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)