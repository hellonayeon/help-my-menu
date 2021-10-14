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
                             </div>
                             <hr>`
        $('#comment-list').append(commentHtml)

        // 사용자에 따라 선택적으로 '수정' / '삭제' 버튼 생성
        if(userId == comment["USER_ID"]) {
            console.log(comment['RECIPE_ID'])
            let commentUpdateBtnHTML = `<button class="comment-update-btn" onclick="updateComment(${comment["RECIPE_ID"]}, ${comment["_id"]}, '${comment["USER_ID"]}')">수정</button> &nbsp; &nbsp;
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

/* 댓글 저장 요청 함수 */
function saveComment(recipeId, userId) {
    let text = $('#comment-text-area').val();
    let imgSrc = $('#file')[0].files[0]; // 파일 업로드하지 않았을 경우 undefined

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
                $('#file').val("")
                $('#img-src-label').empty()
                $('#comment-text-area').val("")

                getComment(recipeId, userId)
            } else {
                // 중복된 닉네임일 경우, 닉네임이랑 비밀번호만 지우기

                alert(response['msg'])
                return
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
            } else {
                alert(response["msg"])
                return
            }
        }
    })
}

function updateComment(recipeId, commentId, userId) {

}