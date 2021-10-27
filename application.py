import os
from flask import Flask, render_template, jsonify, request, redirect, url_for
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import jwt  # pip install PyJWT
import hashlib
import boto3

# Flask 초기화
application = Flask(__name__)

# MongoDB 초기화
client = MongoClient(os.environ['MONGO_DB_PATH'])
db = client.dbrecipe

@application.route('/')
def home():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])

        return render_template('index.html')
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

# 첫 화면 재료 항목 불러오기
@application.route('/ranking', methods=['GET'])
def get_main_ranking_posting():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]

        best_recipe = []
        like_recipe = list(db.likes.find({}).distinct("RECIPE_ID"))
        for i in range(len(like_recipe)):
            best_recipe.append(db.recipe_basic.find_one({"RECIPE_ID": int(like_recipe[i])}, {'_id': False}))
            best_recipe[i]['LIKES_COUNT'] = db.likes.count_documents({"RECIPE_ID": like_recipe[i]})
            best_recipe[i]['LIKE_BY_ME'] = bool(db.likes.find_one({"RECIPE_ID": like_recipe[i], "USER_ID": _id}))

        best_recipe = sorted(best_recipe, key=lambda k: k['LIKES_COUNT'], reverse=True)[:20]

        return jsonify({'msg': 'success', 'best_recipe': best_recipe})
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

@application.route('/login')
def login():
    msg = request.args.get("msg")
    return render_template('login.html', msg=msg)

@application.route('/user/<_id>')
def user(_id):
    # 사용자의 개인 정보를 볼 수 있는 유저 페이지
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        my_id = payload['user_id']
        # 내 마이페이지면 True, 다른 사람 마이페이지면 False
        is_mypage_user = (_id == my_id)

        user_info = db.users.find_one({'_id': ObjectId(_id)})

        return render_template('user.html', user_info=user_info, is_mypage_user=is_mypage_user, my_id=my_id)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

# @application.route('/login/<>', methods=['GET'])
# def update_profile():
#     # 사용자 프로필 변경 요청 API
#     token_receive = request.cookies.get('mytoken')
#     try:
#         return jsonify({"result": "success", 'msg': '프로필을 업데이트했습니다.'})
#     except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
#         return redirect(url_for("home"))





@application.route('/user', methods=['POST'])
def update_profile():
    # 사용자 프로필 변경 요청 API
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]

        username_receive = request.form["username_give"]
        introduce_receive = request.form["introduce_give"]

        new_doc = {
            "USERNAME": username_receive,
            "PROFILE_INFO": introduce_receive
        }

        if 'file_give' in request.files:
            file_receive = request.files["file_give"]

            filename = secure_filename(file_receive.filename)
            extension = filename.split(".")[-1]
            file_path = f"profile_pics/{_id}.{extension}"

            s3 = boto3.client('s3')
            s3.put_object(
                ACL="public-read-write",
                Bucket=os.environ["BUCKET_NAME"],
                Body=file_receive,
                Key=file_path,
                ContentType=file_receive.content_type
            )

            new_doc["PROFILE_PIC"] = filename
            new_doc["PROFILE_PIC_REAL"] = f'{os.environ["BUCKET_ENDPOINT"]}/{file_path}'

        db.users.update_one({'_id': ObjectId(_id)}, {'$set': new_doc})

        return jsonify({"result": "success", 'msg': '프로필을 업데이트했습니다.'})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@application.route('/user/change-img', methods=['POST'])
def delete_img():
    # 사용자 프로필 이미지 삭제 요청 API
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]
        origin_doc = {
            "PROFILE_PIC": "",
            "PROFILE_PIC_REAL": f'{os.environ["BUCKET_ENDPOINT"]}/profile_pics/profile_placeholder.png'
        }
        user = db.users.find_one({'_id': ObjectId(_id)}, {'_id': False})
        if user["PROFILE_PIC"] == "":
            msg = "이미지가 없습니다.."
        else:
            # profile_pic_real = bucket_endpoint/directory/file
            dir = user["PROFILE_PIC_REAL"].split('/')
            fname = f'{dir[-2]}/{dir[-1]}'

            s3 = boto3.client('s3')
            s3.delete_object(
                Bucket=os.environ["BUCKET_NAME"],
                Key=fname
            )

            db.users.update_one({'_id': ObjectId(_id)}, {'$set': origin_doc})
            msg = "이미지 삭제 완료!."
        return jsonify({"result": "success", 'msg': msg})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@application.route('/user/change-password', methods=['POST'])
def change_password():
    # 사용자 비밀번호 변경 요청 API
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]
        existing_password_receive = request.form["existing_password_give"]
        changing_password_receive = request.form["changing_password_give"]
        info = db.users.find_one({'_id': ObjectId(_id)}, {"_id": False})

        existing_password = hashlib.sha256(existing_password_receive.encode('utf-8')).hexdigest()
        changing_password = hashlib.sha256(changing_password_receive.encode('utf-8')).hexdigest()

        if existing_password != info["PASSWORD"]:
            msg = "기존 비밀번호가 다릅니다!"
            status = "실패"
        elif existing_password == changing_password:
            msg = "기존의 비밀번호와 동일합니다!"
            status = "동일"
        else:
            db.users.update_one({'_id': ObjectId(_id)}, {'$set': {"PASSWORD": changing_password}})
            msg = "비밀번호 변경 완료!"
            status = "성공"

        return jsonify({"result": "success", 'msg': msg, 'status': status})
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
        return redirect(url_for("home"))


@application.route('/sign_in', methods=['POST'])
def sign_in():
    # 로그인
    email = request.form['email']
    password = request.form['password']

    pw_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    result = db.users.find_one({'EMAIL': email, 'PASSWORD': pw_hash})

    if result is not None:
        _id = str(result['_id'])
        payload = {
            'user_id': _id,
            'exp': datetime.utcnow() + timedelta(seconds=60 * 60 * 24)  # 로그인 24시간 유지
        }
        token = jwt.encode(payload, os.environ["JWT_SECRET_KEY"], algorithm='HS256')

        return jsonify({'result': 'success', 'token': token})
    # 찾지 못하면
    else:
        return jsonify({'result': 'fail', 'msg': '아이디/비밀번호가 일치하지 않습니다.'})


# 회원가입 정보 저장, 이메일 중복 검사
@application.route('/sign_up/save', methods=['POST'])
def sign_up():
    username_receive = request.form['username_give']
    email_receive = request.form['email_give']
    email_exists = bool(db.users.find_one({"EMAIL": email_receive}))

    if email_exists:
        return jsonify({'result': 'fail:email_exists'})

    password_receive = request.form['password_give']
    password_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()
    doc = {
        "USERNAME": username_receive,  # 사용자 이름 / 프로필에 표시되는 이름
        "EMAIL": email_receive,  # 이메일
        "PASSWORD": password_hash,  # 비밀번호
        "PROFILE_PIC": "",  # 프로필 사진 파일 이름
        "PROFILE_PIC_REAL": f"{os.environ['BUCKET_ENDPOINT']}/profile_pics/profile_placeholder.png",  # 프로필 사진 기본 이미지
        "PROFILE_INFO": ""  # 프로필 한 마디
    }
    db.users.insert_one(doc)
    return jsonify({'result': 'success'})


# 첫 화면 재료 항목 불러오기
@application.route('/ingredient-and-recipe', methods=['GET'])
def ingredient_listing():
    # 중복 제거
    irdnt = list(db.recipe_ingredient.distinct("IRDNT_NM"))
    recipe = list(db.recipe_basic.distinct("RECIPE_NM_KO"))
    return jsonify({'recipe_ingredient': irdnt, 'recipe_name_kor': recipe})


# "레시피 검색" 버튼 클릭, 좋아요 탭 버튼, 필터 수정 버튼을 클릭 시 실행
@application.route('/recipe/search', methods=['POST', 'GET'])
def make_recipe_list():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]

        ## 결과로 출력할 RECIPE_ID들을 DB에서 가져오는 과정.
        # 만약 POST 방식이면, "필터 수정" 클릭으로 인식.
        if request.method == 'POST':
            data_we_want = []
            recipe_info = request.get_json()
            irdnt_nm = recipe_info['IRDNT_NM']
            nation_nm = recipe_info['NATION_NM']
            level_nm = recipe_info['LEVEL_NM']
            cooking_time = recipe_info['COOKING_TIME']
            recipe_sort = recipe_info["SORTED"]

            level_nm_list = []
            for i in level_nm:
                level_nm_list.append({"LEVEL_NM": i})

            cooking_time_list = []
            for i in cooking_time:
                cooking_time_list.append({"COOKING_TIME": i})

            nation_nm_list = []
            if "서양, 이탈리아" in nation_nm:
                nation_nm_list.append({"NATION_NM": '서양'})
                nation_nm_list.append({"NATION_NM": '이탈리아'})
                nation_nm.remove('서양, 이탈리아')
            for i in nation_nm:
                nation_nm_list.append({"NATION_NM": i})


            selected_by_condition = list(db.recipe_basic.find({"$and": [{"$or": level_nm_list}, {"$or": nation_nm_list}, {"$or": cooking_time_list}]}))
            recipe_ids = set([selected['RECIPE_ID'] for selected in selected_by_condition])

            first_irdnt_ids = list(db.recipe_ingredient.find({"IRDNT_NM": irdnt_nm[0]}, {"_id": False, "RECIPE_ID": True}))
            ingredient_set = set([irdnt['RECIPE_ID'] for irdnt in first_irdnt_ids])
            for i in range(1, len(irdnt_nm)):
                irdnt_ids = list(db.recipe_ingredient.find({"IRDNT_NM": irdnt_nm[i]}, {"_id": False, "RECIPE_ID": True}))
                tmp_set = set([irdnt['RECIPE_ID'] for irdnt in irdnt_ids])
                ingredient_set = ingredient_set & tmp_set
            data_we_want = list(recipe_ids & ingredient_set)

        # 만약 'GET' 방식이면, "레시피 검색 기능" 혹은 "좋아요 탭"을 사용한 것으로 인식
        elif request.method == 'GET':
            recipe_search_name = request.args.get("recipe-search-name")
            user_id = request.args.get("user_id")
            recipe_sort = request.args.get("sort")
            mypage_id = request.args.get("mypage_id")
            # 'GET' 방식이면서, API 통신 url에 recipe_search_name이 존재하면 "레시피 검색 기능"으로 인식
            if recipe_search_name:
                data_we_want = list(db.recipe_basic.find({"RECIPE_NM_KO": {"$regex": recipe_search_name}}).distinct("RECIPE_ID"))
            # 'GET' 방식이면서, API 통신 url에 user_id이 존재하면  "user.html 좋아요 탭"으로 인식
            elif user_id:
                data_we_want = list(db.likes.find({"USER_ID": user_id}).distinct("RECIPE_ID"))
            # 'GET' 방식이면서, API 통신 url에 args가 None이면, "index.html 좋아요 탭"으로 인식
            elif mypage_id:
                data_we_want = list(db.recipe_basic.find({"USER_ID": mypage_id}))
            # 'GET' 방식이면서, API 통신 url에 'mypage_id' args가 Not None이면, "user.html 작성한 탭"으로 인식
            else:
                data_we_want = list(db.likes.find({"USER_ID": _id}).distinct("RECIPE_ID"))

        ## 검색 결과를 출력하기 위해 DB에서 찾은 RECIPE_ID에 해당하는 레시피 상세 정보들을 data_we_get에 저장 후 전송
        if data_we_want:
            projection = {"RECIPE_ID": True, "RECIPE_NM_KO": True, "SUMRY": True, "NATION_NM": True,
                        "COOKING_TIME": True, "QNT": True, "IMG_URL": True, "_id": False}
            data_we_get = []
            for i in range(len(data_we_want)):
                data_we_get.append(db.recipe_basic.find_one({"RECIPE_ID": int(data_we_want[i])}, projection))
                data_we_get[i]['LIKES_COUNT'] = db.likes.count_documents({"RECIPE_ID": data_we_want[i]})
                data_we_get[i]['LIKE_BY_ME'] = bool(db.likes.find_one({"RECIPE_ID": data_we_want[i], "USER_ID": _id}))

            # 레시피 리스트 정렬 후에 데이터를 보냄. default는 추천순으로 정렬
            data_we_get = sorted(data_we_get, key=lambda k: k['LIKES_COUNT'], reverse=True)

            if recipe_sort == None :
                pass
            elif "recommend-sort" in recipe_sort:
                data_we_get = sorted(data_we_get, key=lambda k: k['LIKES_COUNT'], reverse=True)
            elif "name-sort" in recipe_sort:
                data_we_get = sorted(data_we_get, key=lambda k: k['RECIPE_NM_KO'], reverse=False)
            return jsonify({'msg': 'success', "data_we_get": data_we_get})
        else:
            return jsonify({'msg': 'nothing'})

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 레시피 상세정보 API
@application.route('/recipe/detail', methods=['GET'])
def get_recipe_detail():
    recipe_id = int(request.args.get("recipe-id"))
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]

        # 레시피 정보
        projection = {"RECIPE_ID": True, "RECIPE_NM_KO": True, "SUMRY": True, "NATION_NM": True,
                    "COOKING_TIME": True, "QNT": True, "IMG_URL": True, "_id": False}
        recipe_info = db.recipe_basic.find_one({"RECIPE_ID": recipe_id}, projection)

        # 상세정보(조리과정)
        projection = {"COOKING_NO": True, "COOKING_DC": True, "_id": False}
        steps = list(db.recipe_number.find({"RECIPE_ID": recipe_id}, projection))

        # 재료정보
        projection = {"IRDNT_NM": True, "IRDNT_CPCTY": True, "_id": False}
        irdnts = list(db.recipe_ingredient.find({"RECIPE_ID": recipe_id}, projection))

        # 좋아요 정보
        like_info = {}
        like_info['LIKES_COUNT'] = db.likes.count_documents({"RECIPE_ID": recipe_id})
        like_info['LIKE_BY_ME'] = bool(db.likes.find_one({"RECIPE_ID": recipe_id, "USER_ID": _id}))

        return render_template('detail.html',
                               user_id = _id, recipe_info=recipe_info, steps=steps, irdnts=irdnts, like_info=like_info)

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

# 댓글 목록 API
@application.route('/recipe/comment', methods=['GET'])
def get_comments():
    # 토큰 유효성 검사
    token_receive = request.cookies.get('mytoken')
    try:
        jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

    # 상세페이지 댓글
    recipe_id = request.args.get("recipe-id")
    # 마이페이지 댓글
    user_id = request.args.get("user-id")

    if recipe_id != "undefined":
        comments = list(db.comment.find({"RECIPE_ID": int(recipe_id)}))

        # 댓글을 작성한 사용자의 '이름' '프로필 사진' 가져와서 각각의 댓글 딕셔너리에 저장
        for comment in comments:
            user = db.users.find_one({"_id": ObjectId(comment["USER_ID"])})
            comment["USERNAME"] = user["USERNAME"]
            comment["PROFILE_PIC_REAL"] = user["PROFILE_PIC_REAL"]
            comment["_id"] = str(comment["_id"])
    else:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        username = user["USERNAME"]
        profile_pic_real = user["PROFILE_PIC_REAL"]

        # 마이페이지 댓글 리스트의 경우 'RECIPE_ID' 제거
        # 댓글 제거 후 모든 댓글 리스트들을 가져올때 'RECIPE_ID'를 URL로 넘겨주면
        # 다른 사람이 쓴 모든 댓글도 출력
        comments = list(db.comment.find({"USER_ID": user_id}, {"RECIPE_ID": False}))
        for comment in comments:
            comment["USERNAME"] = username
            comment["PROFILE_PIC_REAL"] = profile_pic_real
            comment["_id"] = str(comment["_id"])

    return jsonify(comments)


# 댓글 작성 API
@application.route('/recipe/comment', methods=['POST'])
def save_comment():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload['user_id']

        recipe_id = int(request.form["recipe_id"])
        text = request.form["text"]

        fname = ""
        today = datetime.now()
        date = today.strftime('%Y.%m.%d')

        # [DB 처리]
        doc = {
            'RECIPE_ID': recipe_id,
            'TEXT': text,
            'DATE': date,
            'USER_ID': _id
        }

        if len(request.files) != 0:
            file = request.files["img_src"]
            # TODO: 아이폰 heic 확장자 이미지 예외처리 필요
            extension = file.filename.split('.')[-1]

            time = today.strftime('%Y-%m-%d-%H-%M-%S')
            fname = f'comment-images/file-{_id}-{time}.{extension}'

            s3 = boto3.client('s3')
            s3.put_object(
                ACL="public-read-write",
                Bucket=os.environ["BUCKET_NAME"],
                Body=file,
                Key=fname,
                ContentType=file.content_type
            )

            doc['IMG_SRC'] = f'{os.environ["BUCKET_ENDPOINT"]}/{fname}'

        db.comment.insert_one(doc)

        return jsonify({'result': 'success'})

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 댓글 삭제 API
@application.route('/recipe/comment', methods=['DELETE'])
def delete_comment():
    token_receive = request.cookies.get('mytoken')
    try:
        jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))

    comment_id = request.form["comment_id"]
    db.comment.delete_one({"_id": ObjectId(comment_id)})

    return jsonify({'result': 'success'})


# 댓글 수정 API
@application.route('/recipe/comment', methods=['PUT'])
def update_comment():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload['user_id']

        comment_id = request.form["comment_id"]
        text = request.form["text"]

        # [업로드 이미지 처리]
        # 클라이언트가 업로드한 파일을 서버에 저장
        fname = ""
        today = datetime.now()
        if len(request.files) != 0:
            file = request.files["img_src"]
            # TODO: 아이폰 heic 확장자 이미지 예외처리 필요
            extension = file.filename.split('.')[-1]

            time = today.strftime('%Y-%m-%d-%H-%M-%S')
            fname = f'comment-images/file-{_id}-{time}.{extension}'

            s3 = boto3.client('s3')
            s3.put_object(
                ACL="public-read-write",
                Bucket=os.environ["BUCKET_NAME"],
                Body=file,
                Key=fname,
                ContentType=file.content_type
            )

        img_src = f'{os.environ["BUCKET_ENDPOINT"]}/{fname}'
        db.comment.update_one({"_id": ObjectId(comment_id)}, {"$set": {"TEXT": text, "IMG_SRC": img_src}})

        return jsonify({'result': 'success'})

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 좋아요 기능
@application.route('/recipe/update_like', methods=['POST'])
@application.route('/user/recipe/update_like', methods=['POST'])
def update_like() :
    token_receive = request.cookies.get('mytoken')
    try :
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]

        recipe_id = int(request.form["recipe_id"])

        doc = {
            "RECIPE_ID": recipe_id,
            "USER_ID": _id
        }

        if db.likes.find_one(doc) :
            db.likes.delete_one(doc)
            action = "unlike"
        else:
            db.likes.insert_one(doc)
            action = "like"

        likes_count = db.likes.count_documents({"RECIPE_ID":recipe_id})
        return jsonify({"action": action, "likes_count":likes_count})

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


@application.route('/recipe/register', methods=['GET'])
def add_recipe_page():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        user_info = db.users.find_one({'_id': ObjectId(payload['user_id'])})

        return render_template("add_recipe.html", user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))


# 레시피 등록 페이지
@application.route('/recipe', methods=['POST'])
def add_recipe():
    token_receive = request.cookies.get('mytoken')
    try:
        payload = jwt.decode(token_receive, os.environ["JWT_SECRET_KEY"], algorithms=['HS256'])
        _id = payload["user_id"]

        # 리스트 데이터
        # 레시피 기본 정보
        # ROW_NUM, RECIPE_ID, RECIPE_NM_KO, SUMRY, NATION_NM, COOKING_TIME, QNT, IMG_URL
        # 사용자가 등록한 레시피에는 USER_ID 저장 필요
        recipe = request.form["recipe_info_give"]["give_basic"]
        recipe_id = int(db.recipe_basic.count())
        recipe["ROW_NUM"] = recipe_id
        recipe["RECIPE_ID"] = recipe_id
        recipe["USER_ID"] = _id

        db.recipe_basic.find_one(recipe)

        # 레시피 재료 정보
        # ROW_NUM, RECIPE_ID, IRDNT_NM, IRDNT_CPCTY("" 빈 값으로)
        recipe_irdnt = request.form["recipe_info_give"]["ingredient_give"]
        # 레시피 재료 수량 정보
        recipe_qnt = request.form["recipe_info_give"]["quantity_give"]

        irdnt_list = []
        for idx in range(len(recipe_irdnt)):
            irdnt = {
                "ROW_NUM": recipe_id,
                "RECIPE_ID": recipe_id,
                "IRDNT_NM": recipe_irdnt[idx],
                "IRDNT_CPCTY": recipe_qnt[idx]
            }
            irdnt_list.append(irdnt)

        db.recipe_ingredient.insert(irdnt_list)

        # 레시피 과정 정보
        recipe_number = request.form["recipe_info_give"]["process_give"]
        number_list = []
        for idx in range(len(recipe_number)):
            number = {
                "ROW_NUM": recipe_id,
                "RECIPE_ID": recipe_id,
                "COOKING_NO": idx+1,
                "COOKING_DC": recipe_number[idx]
            }
            number_list.append(number)

        db.recipe_number.insert(number_list)

        # TODO: 레시피 이미지 S3 업로드
        file = request.files[""]
        print(f'서버로 부터 받은 이미지 파일 이름 {file.filename}')
        fname = f'{os.environ["BUCKET_ENDPOINT"]}/recipe_image/${file.filename}'
        print(f'S3 이미지 파일 이름 {fname}')

        s3 = boto3.client('s3')
        s3.put_object(
            ACL="public-read-write",
            Bucket=os.environ["BUCKET_NAME"],
            Body=file,
            Key=fname,
            ContentType=file.content_type
        )

        return jsonify({'result': 'success'})

    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="로그인 시간이 만료되었습니다."))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="로그인 정보가 존재하지 않습니다."))



if __name__ == '__main__':
    application.debug = True
    application.run()
