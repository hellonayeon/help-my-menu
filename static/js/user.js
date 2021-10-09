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
}

function updateProfile() {
    updateCondition()
    // 프로필 변경
    let username = $('#change-username').val()
    let file = $('#change-file')[0].files[0]
    let introduce = $("#change-introduce").val()
    let form_data = new FormData()
    form_data.append("username_give", username)
    form_data.append("file_give", file)
    form_data.append("introduce_give", introduce)
    console.log(username, file, introduce, form_data)

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

<!--FIXME 로그인화면과 조건 상이하여 함수 하나 더 생성했음. -->
function isUserNickname(asValue) {
    var regExp = /[가-힣a-zA-Z0-9_.]{3,10}$/;
    return regExp.test(asValue);
}