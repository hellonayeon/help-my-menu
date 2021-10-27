const USER_RECIPE = "USER_RECIPE"
const USER_COMMENT = "USER_COMMENT"
const USER_LIKED = "USER_LIKED"

$(document).ready(function () {
    let url = window.location.href
    let id = url.split('/').at(-1)
    makeUpMypage(id)
    }
);


function makeUpMypage(id) {
    $.ajax({
        type: "GET",
        url: `/mypage/${id}`,
        data: {},
        success : function(response) {
            let user_info = response['user_info']
            let is_mypage_user = response['is_mypage_user']
            let my_id = response['my_id']
            let temphtml = ``
            temphtml += `    
            <!-- 사용자 정보 표시 start -->
            <section class="user-info">
                <div class="thumbnail-area">
                    <img src="${user_info['PROFILE_PIC_REAL']}" alt="..."
                         style="border-radius: 50px;">`
            if (is_mypage_user) {
                temphtml += `<button type="button" class="btn btn-secondary img-button" data-toggle="modal" data-target="#exampleModal"
                            data-whatever="@mdo">
                        프로필 변경
                    </button>
                    <button onclick="deleteImg()" type="button" class="btn btn-outline-secondary img-button">이미지 삭제</button>`
            }

            temphtml +=`</div>
                <div class="info-area">
                    <div class="main-name">
                        <h2>
                            ${user_info['USERNAME']}
                            <span style="font-size: 15px; margin-left: 10px;">(${user_info['_id']})</span>
                            <span style="font-size: 15px; margin-left: 10px;">${user_info['EMAIL']}</span>
        
                        </h2>
                    </div>
                    <div class="main-intro" id="user-introduce">
                        <p>${user_info['PROFILE_INFO']}</p>
                    </div>
                </div>
            </section>
            <!-- 사용자 정보 표시 end -->`
            
            if (is_mypage_user) {
                temphtml += `<!-- 프로필 변경 modal start -->
                <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
                     aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">프로필 변경</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div id="input-username" class="form-group">
                                        <label for="change-username" class="col-form-label">닉네임:</label>
                                        <input type="text" class="form-control" value="${user_info['USERNAME']}"
                                               id="change-username">
                                    </div>
                                    <div id="username-condition" class="warning is-safe">
                                    </div>
                                    <div>사진선택:</div>
                                    <div class="input-group mb-3">
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input" id="change-file">
                                            <label class="custom-file-label" for="change-file"></label>
                                        </div>
                                    </div>
            
                                    <div class="form-group">
                                        <label for="change-introduce" class="col-form-label">자기소개:</label>
                                        <textarea class="form-control"
                                                  id="change-introduce">${user_info['PROFILE_INFO']}</textarea>
                                        <div id="intro-condition" class="warning is-safe">
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">취소</button>
                                <button type="button" class="btn btn-primary" data-toggle="modal"
                                        data-target="#passwordModify" data-whatever="@mdo">
                                    비밀번호 변경
                                </button>
                                <button onclick="updateProfile()" type="button" class="btn btn-primary">업데이트</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 프로필 변경 modal end -->
            
                <!-- 비밀번호 변경 modal start -->
                <div class="modal fade" id="passwordModify" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
                     aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">비밀번호 변경</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="form-group">
                                        <label for="input-existing-password" class="col-form-label">기존 비밀번호:</label>
                                        <input type="password" class="form-control" id="input-existing-password">
                                    </div>
                                    <div id="existing-password-condition" class="warning is-safe">
                                    </div>
                                    <div class="form-group">
                                        <label for="input-changing-password" class="col-form-label">새 비밀번호:</label>
                                        <input type="password" class="form-control" id="input-changing-password">
                                    </div>
                                    <div id="changing-password-condition" class="warning is-safe">
                                    </div>
                                    <div class="form-group">
                                        <label for="input-more-password" class="col-form-label">비밀번호 확인:</label>
                                        <input type="password" class="form-control" id="input-more-password">
                                    </div>
                                    <div id="more-password-condition" class="warning is-safe">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">취소</button>
                                <button onclick="changePassword()" type="button" class="btn btn-primary">수정</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 비밀번호 변경 modal end -->`
            }
        
            temphtml += `<!-- 즐겨찾기 & 내가쓴글 태그 start -->
            <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li class="nav-item width-btn">
                    <a class="nav-link active" data-toggle="pill" href="#pills-home" role="tab"
                       onclick="tabControl(USER_RECIPE);">작성한 레시피</a>
                </li>
                <li class="nav-item width-btn">
                    <a class="nav-link" data-toggle="pill" href="#pills-profile" role="tab"
                       onclick="tabControl(USER_COMMENT); getComment(undefined, '${user_info['_id']}', '${my_id}')">댓글</a>
                </li>
                <li class="nav-item width-btn">
                    <a class="nav-link" data-toggle="pill" href="#pills-profile" role="tab"
                       onclick="tabControl(USER_LIKED); postRecipeInfo('likedInMypage', '${user_info['_id']}')">즐겨찾기</a>
                </li>
            </ul>
            <!-- 즐겨찾기 & 내가쓴글 태그 end -->
        
            <!-- 작성한 레시피 리스트 -->
        
            <!-- 댓글 리스트 -->
            <div class="container" id="comment-box" style="display: none">
                <!-- 등록된 댓글 리스트 -->
                <div class="container" id="comment-list"></div>
            </div>
        
            <!-- 즐겨찾기 리스트 -->
            <div class="tab-content" id="liked-box" style="display: none">
                <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                </div>
                <div class="card-deck" id="recipe-liked-mypage-list" class="recipe-liked-mypage-list" role="tabpanel" aria-labelledby="pills-profile-tab">
                </div>
            </div>`
            $('#user-div').append(temphtml)
        }
    })
}


function tabControl(tab) {
    switch (tab){
        case USER_RECIPE:
            $('#liked-box').hide()
            $('#comment-box').hide()
            // 작성 레시피 출력 영역 show
            break;
        case USER_COMMENT:
            // 작성 레시피 출력 영역 hide
            $('#liked-box').hide()
            $('#comment-box').show()
            break;
        case USER_LIKED:
            // 작성 레시피 출력 영역 hide
            $('#comment-box').hide()
            $('#liked-box').show()
            break;
    }
}


function updateCondition() {
    // 프로필 수정 조건
    let checkname = $('#change-username').val()
    if (checkname == "") {
        $('#username-condition').text("닉네임을 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        $('#input-username').focus()
        return
    }
    if (!isUserNickname(checkname)) {
        $('#username-condition').text("닉네임 형식을 확인해주세요 한글과 영문과 숫자, 일부 특수문자(._-) 사용 가능. 3-10자 길이").removeClass("is-safe").addClass("is-danger")
        $('#input-username').focus()
        return
    }
    if ($('#change-introduce').val().length > 100) {
        $('#intro-condition').text("자기소개를 100자 이내로 입력해주세요.").removeClass("is-safe").addClass("is-danger")
        return
    }
    return "success"
}

function updateProfile() {
    if (updateCondition() != "success") {
        return
    }

    // 프로필 변경
    let username = $('#change-username').val()
    let file = $('#change-file')[0].files[0]
    let introduce = $("#change-introduce").val()
    let form_data = new FormData()
    form_data.append("username_give", username)
    form_data.append("file_give", file)
    form_data.append("introduce_give", introduce)

    $.ajax({
        type: "POST",
        url: "/user",
        data: form_data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response["result"] == "success") {
                alert(response["msg"])
                window.location.reload()

            }
        }
    });
}

// 프로필 이미지 삭제
function deleteImg() {
    $.ajax({
        type: "POST",
        url: "/user/change-img",
        data: {},
        success: function (response) {
            if (response["result"] == "success") {
                alert(response["msg"])
                window.location.reload()
            }
        }
    })
}


// 비밀번호 변경
function changePassword() {
    let existingPassword = $('#input-existing-password').val()
    let changingPassword = $('#input-changing-password').val()
    let morePassword = $('#input-more-password').val()

    // 비밀번호 변경 조건 판단
    if (changingPassword == "") {
        $('#changing-password-condition').text('비밀번호를 입력해주세요.').removeClass("is-safe").addClass("is-danger")
        $('#input-changing-password').focus()
        return;
    } else if (!isPassword(changingPassword)) {
        $('#changing-password-condition').text('비밀번호의 형식을 확인해주세요.\n비밀번호는 8-20자의 영문과 숫자 필수 포함, 특수문자(!@#$%^&*)만 사용 가능합니다.').removeClass("is-safe").addClass("is-danger")
        $('#input-changing-password').focus()
        return;
    }

    if (morePassword == "") {
        $('#more-password-condition').text('비밀번호를 입력해주세요.').removeClass("is-safe").addClass("is-danger")
        $('#input-more-password').focus()
        return;
    } else if (morePassword != changingPassword) {
        $('#changing-password-condition').text('비밀번호가 일치하지 않습니다.').removeClass("is-safe").addClass("is-danger")
        $('#input-more-password').focus()
        return;
    }
    $.ajax({
        type: "POST",
        url: "/user/change-password",
        data: {existing_password_give: existingPassword, changing_password_give: changingPassword},
        success: function (response) {
            if (response["result"] == "success") {
                if (response["status"] == "성공") {
                    alert(response["msg"])
                    logout()
                } else if (response["status"] == "동일") {
                    alert(response["msg"])
                    logout()
                } else {
                    $('#existing-password-condition').text(response["msg"]).removeClass("is-safe").addClass("is-danger")
                    $('#input-existing-password').focus()
                }
            }
        }
    })

}