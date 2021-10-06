<!--To do - 안쓰는 전역변수입니다 확인해주세요. -->
let RECIPE_NM

let gIrdntNm = []
let gNationNm = []
let gLevelNm = []
let gCookingTime = []
let gIngreList = []
let gIndex = 1


// 화면 출력 제어 플래그
const recipeListDisplay = "recipeListDisplay"
const recipeDetailDisplay = "recipeDetailDisplay"
const recipeChoiceDisplay = "recipeChoiceDisplay"
const recipeLoadingDisplay = "recipeLoadingDisplay"

$(document).ready(function () {
    ingredientListing();

    // 사진 업로드
    bsCustomFileInput.init()

    // 화면 출력 내용: 초기에는 "재료 선택 화면"으로 설정
    showControl(recipeChoiceDisplay)
});

/* 화면에 보여지는 내용 보이기, 숨기기 */
function showControl(display) {
    switch (display) {
        case recipeChoiceDisplay:
            $("#recipe-choice-container").show()
            $("#recipe-loading-container").hide()
            $("#recipe-detail-container").hide()
            $("#recipe-list-container").hide()
            break
        case recipeLoadingDisplay:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").show()
            $("#recipe-list-container").hide()
            $("#recipe-detail-container").hide()
            break
        case recipeListDisplay:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").hide()
            $("#recipe-list-container").show()
            $("#recipe-detail-container").hide()
            break
        case recipeDetailDisplay:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").hide()
            $("#recipe-list-container").hide()
            $("#recipe-detail-container").show()
            break
    }
}

//첫 화면 재료 선택 데이터 가져오기
function ingredientListing() {
    $.ajax({
        type: "GET",
        url: "/ingredient",
        data: {},
        success: function (response) {
            let recipeIngredient = response['recipe_ingredient']

            for (let i = 0; i < recipeIngredient.length; i++) {
                let ingredient = recipeIngredient[i]
                let tempHtml = `<option value="main">${ingredient}</option>`
                $('#ingre1').append(tempHtml)
            }
        }
    })
}

//검색 자동완성 기능
$(function autoSearch() {
    $.ajax({
        type: "GET",
        url: "/research",
        data: {},
        success: function (response) {
            gIngreList = response["resarch_ingr"]
            searchShow()
        }
    })
});

// 선택한 재료 표시하기 & 선택 재료 데이터 저장
function searchShow() {
    $("#searchInput").autocomplete({
        autoFocus: true,
        source: gIngreList,
        select: function (event, ui) {
            let ingredient = ui.item.value

            if (gIrdntNm.indexOf(ingredient) == -1) {
                let tempHtml = `<input type="button" class="btn btn-outline-primary" id="selected-ingredient-button-${gIndex}" value="" style="margin: auto 5px 3px auto;" onclick="cancleSelectingIngredientAdded(this)"/>`
                $('#selected-ingredient-display-main').append(tempHtml)
                let temp = 'selected-ingredient-button-' + gIndex
                document.getElementById(temp).value = ingredient;
                gIndex += 1;
                gIrdntNm.push(ingredient);
            }
        },
        focus: function (event, ui) {
            return false;
        },
        minLength: 1,
        delay: 100,
        disabled: false
    });
};

function ingredientDisplay(ingredient) {
    if (gIrdntNm.indexOf(ingredient.options[ingredient.selectedIndex].text) == -1) {
        let tempHtml = `<input type="button" class="btn btn-outline-primary" id="selected-ingredient-button-${gIndex}" value="" style="margin: auto 5px 3px auto;" onclick="cancleSelectingIngredientAdded(this)"/>`
        $('#selected-ingredient-display-main').append(tempHtml)
        let temp = 'selected-ingredient-button-' + gIndex
        document.getElementById(temp).value = ingredient.options[ingredient.selectedIndex].text;
        gIndex += 1;
        gIrdntNm.push(document.getElementById(temp).value);

    }
}

// 선택한 재료 취소하기 & 선택 재료 데이터 삭제
function cancleSelectingIngredientAdded(ingredient) {
    forRemoveButton = document.getElementById(ingredient.closest("input").id);
    forRemoveButton.parentNode.removeChild(forRemoveButton);
    idx = gIrdntNm.indexOf(ingredient.closest("input").value)
    gIrdntNm.splice(idx, 1)
}

// "레시피 보기" 버튼 누르기
function selectedRecipeNation() {
    if (gIrdntNm.length < 1) { // 원하는 개수만큼 조건에 맞게 숫자 수정 가능
        alert("재료를 선택해주세요!")
        return 0
    }
    // 식사 유형 데이터 저장
    if (document.getElementById('inputGroupSelect04').value != "바로...") {
        gNationNm.push(document.getElementById('inputGroupSelect04').value)
    } else {
        alert("식사 유형을 선택해주세요.")
        return 0
    }

    // 식사 난이도 데이터 저장
    if ($("input[id='level1']:checked").val() == undefined && $("input[id='level2']:checked").val() == undefined && $("input[id='level3']:checked").val() == undefined) {
        alert("난이도를 선택해주세요.")
        return 0
    } else {
        if ($("input[id='level1']:checked").val() == 'on') {
            gLevelNm.push('초보환영')
        }
        if ($("input[id='level2']:checked").val() == 'on') {
            gLevelNm.push('보통')
        }
        if ($("input[id='level3']:checked").val() == 'on') {
            gLevelNm.push('어려움')
        }
    }

    // 조리시간 데이터 저장
    if ($("input[id='short']:checked").val() == undefined && $("input[id='medium']:checked").val() == undefined && $("input[id='long']:checked").val() == undefined) {
        alert("조리시간을 선택해주세요.")
        return 0
    } else {
        if ($("input[id='short']:checked").val() == 'on') {
            gCookingTime.push('5분', '10분', '15분', '20분', '25분', '30분', '35분', '40분', '50분', '60분')
        }
        if ($("input[id='medium']:checked").val() == 'on') {
            gCookingTime.push('70분', '80분', '90분', '120분')
        }
        if ($("input[id='long']:checked").val() == 'on') {
            gCookingTime.push('140분', '175분', '180분')
        }
    }
    postRecipeInfo();
    showControl(recipeLoadingDisplay);
}

// 레시피 조건 보내기 POST
function postRecipeInfo() {
    var recipeInfo = {"IRDNT_NM": gIrdntNm, "NATION_NM": gNationNm, "LEVEL_NM": gLevelNm, "COOKING_TIME": gCookingTime}
    $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: "/recipe/post",
        dataType: 'json',
        data: JSON.stringify(recipeInfo),
        success: function (response) {
            if (response['msg'] == 'success') {
                getRecipeList();
                showControl(recipeListDisplay);
            } else {
                alert("조건에 해당 되는 레시피가 없습니다.😥")
                showControl(recipeChoiceDisplay);
            }
        }
    })
}

// 선택된 레시피 불러오기
function getRecipeList() {
    $.ajax({
        type: "GET",
        url: "/recipe/get",
        data: {},
        success: function (response) {
            $('#recipe-list').empty();
            let recipe = response['DATA_WE_GET']
            for (let i = 0; i < recipe.length; i++) {
                let recipeUrl = recipe[i]['IMG_URL']
                let recipeName = recipe[i]['RECIPE_NM_KO']
                let recipeDesc = recipe[i]['SUMRY']
                let recipeId = recipe[i]['RECIPE_ID']
                let recipeLiked = recipe[i]['Liked']

                makeRecipeList(recipeId, recipeUrl, recipeName, recipeDesc, recipeLiked)
            }
        }
    })
}

// 레시피 리스트 html
function makeRecipeList(recipeId, recipeUrl, recipeName, recipeDesc, recipeLiked) {
    let tempHtml = `<div  id="recipe${recipeId}" class="card" style="margin-right: 12px; margin-left: 12px; min-width: 200px; max-width: 200px; margin-top: 10px; margin-bottom: 10px;">                                
                        <img class="card-img-top img-fix" src="${recipeUrl}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipeName}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipeDesc}</p>
                            <div class="card-footer">
                                <a href="javascript:void(0);" onclick="getRecipeDetail(${recipeId}); getComment(${recipeId}); showControl(recipeDetailDisplay)" class="card-link">자세히</a>`
    if (recipeLiked >= 1) {
        tempHtml += `<a id="before-like-${recipeId}" style="color:black; float:right; display:none"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipeId})" style="margin-right:5px"></i>${recipeLiked}</a><a id="after-like-${recipeId}" style="color:red; float:right;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipeId})" style="margin-right:5px"></i>${recipeLiked}</a>
                        </div>
                    </div>
                    </div>`
    } else {
        tempHtml += `<a id="before-like-${recipeId}" style="color:black; float:right;"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipeId})" style="margin-right:5px"></i>${recipeLiked}</a><a id="after-like-${recipeId}" style="color:red; float:right; display:none"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipeId})" style="margin-right:5px"></i>${recipeLiked}</a>
                        </div>
                    </div>
                    </div>`
    }

    $('#recipe-list').append(tempHtml)
}

/* 레시피 상세정보 요청 함수 */
function getRecipeDetail(recipeId) {
    $.ajax({
        type: "GET",
        url: `/recipe/detail?recipe_id=${recipeId}`,
        success: function (response) {
            makeRecipeDetail(response["info"], response["detail"], response["ingredients"])
        }
    })
}

/* 레시피 상세정보 출력 함수 */
function makeRecipeDetail(info, detail, ingredients) {
    let infoHtml = `<span class="detail-title">${info["RECIPE_NM_KO"]}</span>
                     <span class="detail-info">${info["COOKING_TIME"]}</span>
                     <span class="detail-info">${info["QNT"]}</span>`
    if (info['Liked'] >= 1) {
        infoHtml += `<a id="before-like-detail-${info["RECIPE_ID"]}" style="color:black;float:right;margin-top:20px; display:none"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a><a id="after-like-detail-${info["RECIPE_ID"]}" style="color:red; float:right;margin-top:20px;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a>
                    
                    <h4>${info["SUMRY"]}</h4>`
    } else {
        infoHtml += `<a id="before-like-detail-${info["RECIPE_ID"]}" style="color:black;float:right;margin-top:20px"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a><a id="after-like-detail-${info["RECIPE_ID"]}" style="color:red; float:right;margin-top:20px; display:none"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a>
                    
                    <h4>${info["SUMRY"]}</h4>`
    }

    for (let i = 0; i < ingredients.length; i++) {
        infoHtml += `<span class="badge badge-primary ingredient-tag">${ingredients[i]["IRDNT_NM"]} : ${ingredients[i]["IRDNT_CPCTY"]}</span>`
    }

    let detailHtml = ``
    detail.forEach(function (step) {
        detailHtml += `<div class="col-12">STEP<span class="detail-step-num">${step["COOKING_NO"]}. </span> ${step["COOKING_DC"]}</div>`
    })

    // 댓글 저장 시, RECIPE_ID 정보 필요
    let commentBtnHtml = `<button type="button" class="btn btn-primary" onclick="saveComment(${info["RECIPE_ID"]})">댓글 작성</button>`

    // 이전에 출력했던 상세정보 지우기
    $('#detail-img').empty()
    $('#detail-info').empty()
    $('#detail-step').empty()
    $('#comment-upload-btn-div').empty()

    $('#detail-img').attr("src", info["IMG_URL"])
    $('#detail-info').append(infoHtml)
    $('#detail-step').append(detailHtml)
    $('#comment-upload-btn-div').append(commentBtnHtml)
}

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

/* 사용자 닉네임, 비밀번호 입력 체크 함수 */
function checkCommentUserInfo(nickNm, pw, text) {
    if (text == "") {
        alert("내용을 입력해주세요!")
        return false
    }
    if (nickNm == "") {
        alert("닉네임을 입력해주세요!")
        return false
    }
    if (pw == "") {
        alert("비밀번호를 입력해주세요!")
        return false
    }
    return true
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
        data: form_data,
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
                                        <div class="col-6"><a href=""><img src="../static/chun_sik.png" style="width: 80px; height: 80px"></a></div>
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
        type: "POST",
        url: "/recipe/comment/delete",
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

/* 비밀번호 입력 다이얼로그 출력 함수 */
function showPasswordDialog(recipeId, nickNm) {
    $('#comment-pw-confirm-dialog').dialog({
        buttons: [
            {
                text: "취소",
                click: function () {
                    $(this).dialog("close");
                }
            },
            {
                text: "확인",
                click: function () {
                    pw = $('#comment-pw-confirm-input').val();
                    if (pw == "") {
                        $('#comment-pw-confirm-input').css('border-color', 'red');
                        $('#comment-pw-confirm-input').attr('placeholder', '비밀번호를 입력해주세요!');
                    } else {
                        deleteComment(recipeId, nickNm, pw);
                        $(this).dialog("close");
                    }
                }
            }
        ],
        // 다이얼로그가 닫히기 직전에 호출되는 함수
        beforeClose: function (event, ui) {
            $('#comment-pw-confirm-input').val('');
            $('#comment-pw-confirm-input').css('border-color', '');
            $('#comment-pw-confirm-input').attr('placeholder', '');
        }
    })
}

// 더 보기 닫기
function closeDetail() {
    location.reload();
}

// 다시 선택
function replay() {
    location.reload();
}

// 좋아요 버튼 눌렀을 때
function setLike(recipeId) {
    $('#before-like-' + recipeId).hide();
    $('#after-like-' + recipeId).show();
    $('#before-like-detail-' + recipeId).hide();
    $('#after-like-detail-' + recipeId).show();
    $('#before-like-liked-' + recipeId).hide();
    $('#after-like-liked-' + recipeId).show();
    $.ajax({
        type: "PUT",
        url: `/recipe/like?recipe-id=${recipeId}`,
        data: {recipe_id: recipeId},
        success: function (response) {
            alert(response["msg"]);
        }
    })
}

// 좋아요 해제
function setUnLike(recipeId) {
    $('#after-like-' + recipeId).hide();
    $('#before-like-' + recipeId).show();
    $('#after-like-detail-' + recipeId).hide();
    $('#before-like-detail-' + recipeId).show();
    $('#after-like-liked-' + recipeId).hide();
    $('#before-like-liked-' + recipeId).show();
    $.ajax({
        type: "PUT",
        url: `/recipe/unlike?recipe-id=${recipeId}`,
        data: {recipe_id: recipeId},
        success: function (response) {
            alert(response["msg"]);
        }
    })
}

function getRecipesLikedList() { // 좋아요 탭
    $.ajax({
        type: "GET",
        url: "/recipe/liked",
        success: function (response) {
            $('#recipe-liked-list').empty();
            let recipe = response['recipe_liked'];
            for (let i = 0; i < recipe.length; i++) {
                let recipeUrl = recipe[i]['IMG_URL']
                let recipeName = recipe[i]['RECIPE_NM_KO']
                let recipeDesc = recipe[i]['SUMRY']
                let recipeId = recipe[i]['RECIPE_ID']
                let recipeLiked = recipe[i]['Liked']

                makeRecipesLikedList(recipeId, recipeUrl, recipeName, recipeDesc, recipeLiked)
            }
        }
    })
}

// 좋아요탭의 좋아요한 레시피 표시
function makeRecipesLikedList(recipeId, recipeUrl, recipeName, recipeDesc, recipeLiked) {
    let tempHtml = `<div  id="recipe${recipeId}" class="card" style="margin-right: 12px; margin-left: 12px; min-width: 200px; max-width: 200px; margin-top: 10px; margin-bottom: 10px;">
                        <img class="card-img-top img-fix" src="${recipeUrl}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipeName}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipeDesc}</p>
                            <div class="card-footer">
                                <a href="javascript:void(0);" onclick="getRecipeDetail(${recipeId}); getComment(${recipeId}); showControl(recipeDetailDisplay)" class="card-link">자세히</a>`
    if (recipeLiked >= 1) {
        tempHtml += `<a id="before-like-liked-${recipeId}" style="color:black; float:right; display:none;"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipeId})"style="margin-right:5px"></i>${recipeLiked}</a><a id="after-like-liked-${recipeId}" style="color:red; float:right;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipeId})"style="margin-right:5px"></i>${recipeLiked}</a>
                        </div>
                    </div>
                    </div>`

    } else {
        tempHtml += `<a id="before-like-liked-${recipeId}" style="color:black; float:right;"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipeId})"style="margin-right:5px"></i>${recipeLiked}</a><a id="after-like-liked-${recipeId}" style="color:red; float:right; display:none;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipeId})"style="margin-right:5px"></i>${recipeLiked}</a>
                        </div>
                    </div>
                    </div>`
    }
    $('#recipe-liked-list').append(tempHtml)
}

function changePart(part) { // 좋아요 탭 눌렀을 경우 OK
    if (part == 'rec') {
        $('#recipe-liked-list').hide();
        $('#recipe-list').show();
        getRecipeList();
        if ($('#part-rec').children("a").hasClass("disabled")) {
            $('#part-rec').children("a").removeClass("disabled")
            $('#part-rec').children("a").addClass("active")
        }
        if ($('#part-like').children("a").hasClass("active")) {
            $('#part-like').children("a").removeClass("active")
            $('#part-like').children("a").addClass("disabled")
        }
    } else {
        $('#recipe-list').hide();
        $('#recipe-liked-list').show();
        getRecipesLikedList();
        if ($('#part-like').children("a").hasClass("disabled")) {
            $('#part-like').children("a").removeClass("disabled")
            $('#part-like').children("a").addClass("active")
        }
        if ($('#part-rec').children("a").hasClass("active")) {
            $('#part-rec').children("a").removeClass("active")
            $('#part-rec').children("a").addClass("disabled")
        }
    }
}