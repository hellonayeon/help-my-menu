from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.dbrecipe # DB제출 전 경로 변경할 것!

@app.route('/')
def home():
    return render_template('index.html')

# 전체 레시피 리스트
@app.route('/recipe', methods=['GET'])
def recipe_list():
    recipe_list = list(db.recipe_basic.find({},{'_id':False}))
    return jsonify({'recipe_list':recipe_list})

# 레시피 상세 보기
@app.route('/recipe/code', methods=['GET'])
def detail_recipe():
    recipe_id = int(request.args.get('recipe-id'))
    recipe_number = list(db.recipe_number.find({'RECIPE_ID':recipe_id},{'_id':False}))
    recipe = db.recipe_basic.find_one({'RECIPE_ID':recipe_id}, {"_id": False})
    return jsonify({'recipe_process':recipe_number, 'recipe':recipe})

# 댓글 DB저장
@app.route('/recipe/comment', methods=['POST'])
def recipe_comment():
    user_name = request.form['userName']
    user_comment = request.form['userComment']
    recipe_id = request.form['recipeId']
    doc = {
        'RECIPE_ID' : recipe_id,
        'USER_NM' : user_name,
        'USER_COMT' : user_comment
    }
    db.comment.insert_one(doc)

    return jsonify({'msg':'성공'})

# 댓글 보기
@app.route('/recipe/comment', methods=['GET'])
def comment_list():
    recipe_id = request.args.get('recipe-id')
    recipe_comment = list(db.comment.find({'RECIPE_ID':recipe_id},{'_id':False}))
    print(recipe_comment)
    return jsonify({'recipe_comment':recipe_comment})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)