/* 댓글 리스트 요청 함수 */
function getComment(recipeId, userId, myId) {
    $.ajax({
        type: "GET",
        url: `/recipe/comment?recipe-id=${recipeId}&user-id=${userId}`,
        success: function (response) {
            makeComment(response, userId, myId)
        }
    })
}

/* 작성한 댓글을 댓글 리스트에 출력하는 함수 */
function makeComment(comments, userId, myId) {
    // 댓글 리스트 다시 출력
    $('#comment-list').empty()

    comments.forEach(function (comment, idx, arr) {
        let commentHtml = `<div class="container">
                                <div class="row justify-content-between">
                                <div class="col-4">
                                    <div class="row">
                                        <div class="col-6">
                                            <a href="/user/${comment["USER_ID"]}">
                                                <img src="${comment["PROFILE_PIC_REAL"]}" alt="Avatar" style="border-radius: 50%; width: 80px; height: 80px">
                                            </a>
                                        </div>
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
        if(myId == comment["USER_ID"]) {
            let commentUpdateBtnHTML = `<button class="comment-update-btn" 
                                         onclick="makeCommentUpdateDiv(${comment["RECIPE_ID"]}, '${comment["_id"]}', '${comment["USER_ID"]}', '${comment["TEXT"]}', '${comment["IMG_SRC"]}', '${myId}')">수정
                                        </button> &nbsp; &nbsp;
                                        <button class="comment-delete-btn" onclick="deleteComment(${comment["RECIPE_ID"]}, '${comment["_id"]}', '${comment["USER_ID"]}', '${myId}')">삭제</button>`
            $(`#comment-control-btn-div-${idx}`).append(commentUpdateBtnHTML)
        }

        // 이미지가 있는 경우 댓글 내용에 이미지 출력
        if (comment["IMG_SRC"] != "") {
            let imgHtml = `<div class="col-12" id="comment-image-content-${comment["_id"]}">
                                <img src="${comment["IMG_SRC"]}" style="width: 250px; height: 200px; border-radius: 10px;"> &nbsp; &nbsp;
                           </div>`
            $(`#comment-content-${idx}`).append(imgHtml)
        }

        let txtHtml = `<div class="col-12"><br>${comment["TEXT"]}</div>`
        $(`#comment-content-${idx}`).append(txtHtml)
    })
}

function makeCommentUpdateDiv(recipeId, commentId, userId, text, imgSrc, myId) {
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
                                            <label class="custom-file-label" for="file" id="comment-update-img-src-label-${commentId}" style="display:inline-block; overflow: hidden; text-overflow: ellipsis;">사진을 선택하세요</label>
                                        </div>
                                        <button type="button" class="btn btn-primary" style="margin-left: 10px"
                                                onclick="$('comment-update-file-${commentId}').val(''); $('#comment-update-img-src-label-${commentId}').text('사진을 선택하세요')">사진 업로드 취소
                                        </button>
                                    </div>
                                </div>
                                <div class="row justify-content-end" id="comment-update-btn-box">
                                    <div class="col-3" id="comment-upload-btn-div">
                                        <button type="button" class="btn btn-primary"
                                                onclick="$('#comment-update-box-${commentId}').empty()">취소
                                        </button>
                                        &nbsp; &nbsp;
                                        <button type="button" class="btn btn-primary"
                                                onclick="updateComment(${recipeId}, '${commentId}', '${userId}', '${myId}')">수정
                                        </button>
                                    </div>
                                </div>`

    $(`#comment-update-box-${commentId}`).append(commentUpdateDivHtml)
    $(`#comment-update-textarea-${commentId}`).val(text)
    if(imgSrc != "") {
        $(`#comment-image-content-${commentId}`).append(`<i class="fa fa-trash-o" aria-hidden="true" onclick="deleteCommentImage('${commentId}')" style="color: lightcoral; float: bottom;"></i>`)
    }

    $(`#comment-update-file-${commentId}`).change(function() {
        let selectedImgSrc = $(`#comment-update-file-${commentId}`)[0].files[0]["name"]
        $(`#comment-update-img-src-label-${commentId}`).text(selectedImgSrc)
    })
}

/* 댓글 저장 요청 함수 */
function saveComment(recipeId, userId, myId) {
    let text = $('#comment-textarea').val();
    let img = $('#comment-file')[0].files[0]; // 파일 업로드하지 않았을 경우 undefined

    if(text == "" && img == undefined) {
        alert("내용을 입력하세요!")
        return
    }

    let formData = new FormData()
    formData.append("recipe_id", recipeId)
    formData.append("text", text)

    if(img != undefined) {
        formData.append("img", img)
    }

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
                $('#comment-file').val("") // not .empty()
                $('#comment-img-src-label').text("사진을 선택하세요")
                $('#comment-textarea').val("")
                getComment(recipeId, userId, myId)
            }
        }
    })
}

function deleteComment(recipeId, commentId, userId, myId) {
    $.ajax({
        type: "DELETE",
        url: "/recipe/comment",
        data: {"comment_id": commentId},
        success: function (response) {
            if (response["result"] == "success") {
                alert(response["msg"])
                // 댓글 다시 출력: 삭제된 댓글 반영
                getComment(recipeId, userId, myId)
            }
        }
    })
}

function updateComment(recipeId, commentId, userId, myId) {
    let text = $(`#comment-update-textarea-${commentId}`).val();
    let img = $(`#comment-update-file-${commentId}`)[0].files[0]; // 파일 업로드하지 않았을 경우 undefined

    if(text == "" && img == undefined) {
        alert("내용을 입력하세요!")
        return
    }

    let formData = new FormData()
    formData.append("comment_id", commentId)
    formData.append("text", text)

    if(img != undefined) {
        formData.append("img", img)
    }

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
                $(`#comment-update-file-${commentId}`).val("") // file input delete .val("") not .empty()
                $(`#comment-update-img-src-label-${commentId}`).text("사진을 선택하세요")
                $(`#comment-update-textarea-${commentId}`).val("")
                // 댓글 수정 영역 컴포넌트들 지우기
                $(`#comment-update-box-${commentId}`).empty()

                alert(response['msg'])
                getComment(recipeId, userId, myId)
            }
        }
    })
}

function deleteCommentImage(commentId) {
    $.ajax({
        type: "DELETE",
        url: "/recipe/comment/image",
        data: {"comment_id": commentId},
        success: function(response) {
            alert(response["msg"])
            window.location.reload()
        }
    })
}