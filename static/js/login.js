function signIn() {
    let email = $("#input-email").val()
    let password = $("#input-password").val()
    console.log(email, password)

    if (email == "") {
        $("#help-email-login").text("아이디를 입력해주세요.")
        $("#input-email").focus()
        return;
    } else {
        $("#help-email-login").text("")
    }

    if (password == "") {
        $("#help-password-login").text("비밀번호를 입력해주세요.")
        $("#input-password").focus()
        return;
    } else {
        $("#help-password-login").text("")
    }
    $.ajax({
        type: "POST",
        url: "/sign_in",
        data: {
            email: email,
            password: password
        },
        success: function (response) {
            if (response['result'] == 'success') {
                $.cookie('mytoken', response['token'], {path: '/'});
                window.location.replace("/")
            } else {
                alert(response['msg'])
            }
        }
    });
}

function toggleSignUpAndIn() {
    $("#login").toggleClass("is-hidden")
    $("#signup").toggleClass("is-hidden")
}

let check = []

function signUp() {
    let username = $("#username").val();
    let email = $("#email").val();
    let password = $("#password").val();
    let repassword = $("#repassword").val();
    console.log(username, email, password, repassword)

    if (username == "") {
        alert("닉네임을 입력해주세요.\n닉네임은 4-10자의 영문, 숫자, 일부 특수문자(._-)만 입력 가능합니다.")
        return;
    } else if (username.length < 4 || username.length > 10 || !isNickname(username)) {
        alert("닉네임을 확인해주세요.\n닉네임은 4-10자의 영문, 숫자, 일부 특수문자(._-)만 입력 가능합니다.")
        return;
    }

    if (email == "") {
        alert("이메일을 입력해주세요.")
        return;
    } else if (!isEmail(email)) {
        alert("이메일이 유효하지 않습니다.\n올바른 이메일인지 확인해주세요.")
        return;
    }

    checkDupNicknameAndEmail();

    if (password == "") {
        alert("비밀번호를 설정해주세요.")
        return;
    } else if (!isPassword(password)) {
        alert("비밀번호의 형식을 확인해주세요.\n비밀번호는 8-20자의 영문과 숫자 필수 포함, 특수문자(!@#$%^&*)만 사용 가능합니다.")
        return;
    }

    if (repassword == "") {
        alert("비밀번호를 설정해주세요.")
        return;
    } else if (repassword != password) {
        alert("비밀번호가 일치하지 않습니다.")
        return;
    }

    if (check[0] == 1) {
        alert("이미 존재하는 닉네임입니다.")
        return;
    } else if (check[1] == 1) {
        alert("이미 존재하는 이메일입니다.")
        return;
    }

    $.ajax({
        type: "POST",
        url: "/sign_up/save",
        data: {
            username_give: username,
            email_give: email,
            password_give: password
        },
        success: function (response) {
            alert("회원가입을 축하드립니다!")
            window.location.replace("/")
        }
    });
}

function isNickname(asValue) {
    var regExp = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{4,10}$/;
    return regExp.test(asValue);
}

function isEmail(asValue) {
    var regExp = regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    return regExp.test(asValue);
}

function isPassword(asValue) {
    var regExp = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,20}$/;
    return regExp.test(asValue);
}

function checkDupNicknameAndEmail() {
    let username = $("#username").val();
    let email = $("#email").val();
    $.ajax({
        type: "POST",
        url: "/sign_up/check_dup",
        async: false,
        data: {
            username_give: username,
            email_give: email
        },
        success: function (response) {
            check = []
            if (response["usernameExists"]) {
                check.push(1)
            } else {
                check.push(0)
            }
            if (response["emailExists"]) {
                check.push(1)
            } else {
                check.push(0)
            }
        }
    });
}