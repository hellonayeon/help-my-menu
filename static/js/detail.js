/* 댓글 리스트 요청 함수 */
function getComment(recipeId) {
    $.ajax({
        type: "GET",
        url: `/recipe/comment?recipe-id=${recipeId}`,
        success: function (response) {
            makeComment(response)
        }
    })
}

/* 댓글 저장 요청 함수 */
function saveComment(recipeId) {
    let nickNm = $('#comment-nick').val();
    let pw = $('#comment-pw').val();
    let text = $('#comment-text-area').val();
    let imgSrc = $('#file')[0].files[0];

    // 아이디 또는 비밀번호, 댓글 내용을 입력 안한 경우
    if (!checkCommentUserInfo(nickNm, pw, text)) return

    let formData = new FormData()
    formData.append("recipe_id", recipeId)
    formData.append("text", text)
    formData.append("img_src", imgSrc)
    formData.append("nick_nm", nickNm)
    formData.append("pw", pw)

    $.ajax({
        type: "POST",
        url: "/recipe/comment",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response['result'] == "success") {
                // 업로드된 파일, 댓글내용, 닉네임, 비밀번호 지우기
                $('#file').val("")
                $('#img-src-label').empty()
                $('#comment-text-area').val("")
                $('#comment-nick').val("")
                $('#comment-pw').val("")

                getComment(recipeId)
            } else {
                // 중복된 닉네임일 경우, 닉네임이랑 비밀번호만 지우기
                $('#comment-nick').val("")
                $('#comment-pw').val("")

                alert(response['msg'])
                return
            }
        }
    })
}

/* 작성한 댓글을 댓글 리스트에 출력하는 함수 */
function makeComment(comments) {
    // 댓글 리스트 다시 출력
    $('#comment-list').empty()

    comments.forEach(function (comment, idx, arr) {
        let commentHtml = `<div class="container">
                                <div class="row justify-content-between">
                                <div class="col-4">
                                    <div class="row">
                                        <div class="col-6"><a href=""><img src="/static/images/chun_sik.png" style="width: 80px; height: 80px"></a></div>
                                        <div class="col-6 comment-profile">
                                        <div class="row"><span>${comment["NICK_NM"]}</span></div>
                                        <div class="row"><span>${comment["DATE"]}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-1">
                                     <button class="comment-delete-btn" onclick="showPasswordDialog(${comment["RECIPE_ID"]}, '${comment["NICK_NM"]}')">삭제</button>
                                </div>
                             </div>
                             <br>
                             <div class="row comment-content" id="comment-content-${idx}">
                                <!-- Dynamic contents -->
                             </div>
                             </div>
                             <hr>`

        $('#comment-list').append(commentHtml)

        // 이미지가 있는 경우 댓글 내용에 이미지 출력
        if (comment["IMG_SRC"] != "") {
            let imgHtml = `<div class="col-12"><img src="../static/images/${comment["IMG_SRC"]}" style="width: 250px; height: 200px"></div>`
            $(`#comment-content-${idx}`).append(imgHtml)
        }

        let txtHtml = `<div class="col-12">${comment["TEXT"]}</div>`
        $(`#comment-content-${idx}`).append(txtHtml)
    })
}

function deleteComment(recipeId, nickNm, pw) {
    $.ajax({
        type: "DELETE",
        url: "/recipe/comment",
        data: {"nick_nm": nickNm, "pw": pw},
        success: function (response) {
            if (response["result"] == "success") {
                // 댓글 다시 출력: 삭제된 댓글 반영
                getComment(recipeId)
            } else {
                alert(response["msg"])
                return
            }
        }
    })
}