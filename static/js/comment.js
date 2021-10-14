let isUpdateBtnClicked = false

/* 댓글 리스트 요청 함수 */
function getComment(recipeId, userId) {
    $.ajax({
        type: "GET",
        url: `/recipe/comment?recipe-id=${recipeId}&user-id=${userId}`,
        success: function (response) {
            makeComment(response, userId)
        }
    })
}

/* 작성한 댓글을 댓글 리스트에 출력하는 함수 */
function makeComment(comments, userId) {
    // 댓글 리스트 다시 출력
    $('#comment-list').empty()

    comments.forEach(function (comment, idx, arr) {
        let commentHtml = `<div class="container">
                                <div class="row justify-content-between">
                                <div class="col-4">
                                    <div class="row">
                                        <div class="col-6"><a href="/user/${comment["USER_ID"]}"><img src="/static/${comment["PROFILE_PIC_REAL"]}" alt="Avatar" style="border-radius: 50%; width: 80px; height: 80px"></a></div>
                                        <div class="col-6 comment-profile">
                                        <div class="row"><span>${comment["USERNAME"]}</span></div>
                                        <div class="row"><span>${comment["DATE"]}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-2" id="comment-control-btn-div-${idx}">
                                    <!-- Dynamic contents -->
                                </div>
                             </div>
                             <br>
                             <div class="row comment-content" id="comment-content-${idx}">
                                <!-- Dynamic contents -->
                             </div>
                             <div id="comment-update-box-${comment["_id"]}"></div>
                             </div>
                             <hr>`
        $('#comment-list').append(commentHtml)

        // 사용자에 따라 선택적으로 '수정' / '삭제' 버튼 생성
        if(userId == comment["USER_ID"]) {
            let commentUpdateBtnHTML = `<button class="comment-update-btn" 
                                         onclick="makeCommentUpdateDiv(${comment["RECIPE_ID"]}, '${comment["_id"]}', '${comment["USER_ID"]}', '${comment["TEXT"]}', '${comment["IMG_SRC"]}')">수정
                                        </button> &nbsp; &nbsp;
                                        <button class="comment-delete-btn" onclick="deleteComment(${comment["RECIPE_ID"]}, '${comment["_id"]}', '${comment["USER_ID"]}')">삭제</button>`
            $(`#comment-control-btn-div-${idx}`).append(commentUpdateBtnHTML)
        }

        // 이미지가 있는 경우 댓글 내용에 이미지 출력
        if (comment["IMG_SRC"] != "") {
            let imgHtml = `<div class="col-12"><img src="../static/comment-images/${comment["IMG_SRC"]}" style="width: 250px; height: 200px"></div>`
            $(`#comment-content-${idx}`).append(imgHtml)
        }

        let txtHtml = `<div class="col-12">${comment["TEXT"]}</div>`
        $(`#comment-content-${idx}`).append(txtHtml)
    })
}

function makeCommentUpdateDiv(recipeId, commentId, userId, text, imgSrc) {
    // 수정을 연속적으로 누르는 경우 처리
    $(`#comment-update-box-${commentId}`).empty()

    let commentUpdateDivHtml = `<br><br><div class="row">
                                    <div class="col form-floating">
                                        <textarea class="form-control" placeholder="댓글을 작성하세요" id="comment-update-textarea-${commentId}">

                                        </textarea>
                                    </div>
                                </div>
                                <div class="row comment-img-upload-box justify-content-end" id="comment-update-img-upload-box">
                                    <div class="col-10 input-group mb-3">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">사진 업로드</span>
                                        </div>
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input" id="comment-update-file-${commentId}">
                                            <label class="custom-file-label" for="file" id="comment-update-img-src-label-${commentId}">사진을 선택하세요</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="row justify-content-end" id="comment-update-btn-box">
                                    <div class="col-3" id="comment-upload-btn-div">
                                        <button type="button" class="btn btn-primary"
                                                onclick="$('#comment-update-box-${commentId}').empty()">취소
                                        </button>
                                        &nbsp; &nbsp;
                                        <button type="button" class="btn btn-primary"
                                                onclick="updateComment(${recipeId}, '${commentId}', '${userId}')">수정
                                        </button>
                                    </div>
                                </div>`

    $(`#comment-update-box-${commentId}`).append(commentUpdateDivHtml)
    $(`#comment-update-textarea-${commentId}`).val(text)
    if(imgSrc != "") {
        $(`#comment-update-img-src-label-${commentId}`).text(imgSrc)
    }

    $(`#comment-update-file-${commentId}`).change(function() {
        let selectedImgSrc = $(`#comment-update-file-${commentId}`)[0].files[0]["name"]
        $(`#comment-update-img-src-label-${commentId}`).text(selectedImgSrc)

        // console.log($(`#comment-update-file-${commentId}`)[0].files[0])
        // console.log(selectedImgSrc)
    })
}

/* 댓글 저장 요청 함수 */
function saveComment(recipeId, userId) {
    let text = $('#comment-textarea').val();
    let imgSrc = $('#comment-file')[0].files[0]; // 파일 업로드하지 않았을 경우 undefined
    // console.log($('#comment-file'))

    if(text == "" && imgSrc == undefined) {
        alert("내용을 입력하세요!")
        return
    }

    let formData = new FormData()
    formData.append("recipe_id", recipeId)
    formData.append("text", text)
    formData.append("img_src", imgSrc)

    $.ajax({
        type: "POST",
        url: "/recipe/comment",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response['result'] == "success") {
                // 업로드된 파일, 댓글내용 지우기
                $('#comment-file').empty()
                $('#comment-img-src-label').empty()
                $('#comment-textarea').val("")

                getComment(recipeId, userId)
            }
        }
    })
}

function deleteComment(recipeId, commentId, userId) {
    $.ajax({
        type: "DELETE",
        url: "/recipe/comment",
        data: {"comment_id": commentId},
        success: function (response) {
            if (response["result"] == "success") {
                // 댓글 다시 출력: 삭제된 댓글 반영
                getComment(recipeId, userId)
            }
        }
    })
}

function updateComment(recipeId, commentId, userId) {
    let text = $(`#comment-update-textarea-${commentId}`).val();
    let imgSrc = $(`#comment-update-file-${commentId}`)[0].files[0]; // 파일 업로드하지 않았을 경우 undefined

    if(text == "" && imgSrc == undefined) {
        alert("내용을 입력하세요!")
        return
    }

    let formData = new FormData()
    formData.append("comment_id", commentId)
    formData.append("text", text)
    formData.append("img_src", imgSrc)

    $.ajax({
        type: "PUT",
        url: "/recipe/comment",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response['result'] == "success") {
                // 업로드된 파일, 댓글내용 지우기
                $(`#comment-update-file-${commentId}`).empty()
                $(`#comment-update-img-src-label-${commentId}`).empty()
                $(`#comment-update-textarea-${commentId}`).val("")


                // 댓글 수정 영역 컴포넌트들 지우기
                $(`#comment-update-box-${commentId}`).empty()

                getComment(recipeId, userId)
            }
        }
    })
}