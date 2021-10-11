let gIrdntNm = []
let gNationNm = []
let gLevelNm = []
let gCookingTime = []
let gIngreList = []
let gRecipeNameList = []
let gRecipeSearchName
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
        url: "/ingredient-and-recipe",
        data: {},
        success: function (response) {
            let ingreList = response['recipe_ingredient']

            for (let i = 0; i < ingreList.length; i++) {
                let ingredient = ingreList[i]
                let tempHtml = `<option value="main">${ingredient}</option>`
                $('#ingredient-select-list').append(tempHtml)
            }
        }
    });
}

//검색 자동완성 기능
$(function autoSearch() {
    $.ajax({
        type: "GET",
        url: "/ingredient-and-recipe",
        data: {},
        success: function (response) {
            gIngreList = response["recipe_ingredient"]
            gRecipeNameList = response['recipe_name_kor']
            searchShow()
        }
    })
});

// 재료 검색 자동완성, 선택한 재료 표시하기 & 선택 재료 데이터 저장 / 레시피 검색 자동완성
function searchShow() {
    $("#search-input").autocomplete({
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

    $("#search-recipe-input").autocomplete({
        autoFocus: true,
        source: gRecipeNameList,
        focus: function (event, ui) {
            return false;
        },
        minLength: 1,
        delay: 100,
        disabled: false
    });
}

// 레시피 검색 (Navbar 오른쪽)
function recipeNameKorSearch() {
    let recipeName = $('#search-recipe-input').val();
    if (recipeName.length < 2) {
        alert("검색할 레시피 이름을 2글자 이상 기입하세요.");
    } else {
        gRecipeSearchName = recipeName
        postRecipeInfo("searchRecipes");
        // FIXME: 로딩창을 띄울 경우 원래 검색하던 위치로 다시 돌아갈 수 없는 경우 발생
        // showControl의 인수에 따라 검색하기 이전 페이지로 돌아가도록 하는 코드가 필요합니다.
        // 아주 사소한 것이라 안 고쳐도 됩니다.
        // showControl(recipeLoadingDisplay);
    }
}


// 지정한 재료 버튼 형식의 태그 저장
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

// "레시피 보기" 버튼 누르기 (검색 호출)
function selectedRecipeNation() {
    if (gIrdntNm.length < 1) { // 원하는 개수만큼 조건에 맞게 숫자 수정 가능
        alert("재료를 선택해주세요!")
        return 0
    }
    // 식사 유형 데이터 저장
    if (document.getElementById('recipe-type-select-list').value != "바로...") {
        gNationNm.push(document.getElementById('recipe-type-select-list').value)
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
    showControl(recipeLoadingDisplay);
    postRecipeInfo("search");
}

// 레시피 리스트 만들기 ("레시피 보기" or "레시피 검색" or 좋아요 탭)
function postRecipeInfo(status) {
    // "레시피 보기"를 클릭한 경우, 사용자 지정 조건에 맞는 검색 리스트 호출 & 출력
    if (status == "search") {
        var recipeInfo = {"IRDNT_NM": gIrdntNm, "NATION_NM": gNationNm, "LEVEL_NM": gLevelNm, "COOKING_TIME": gCookingTime}
        $.ajax({
            type: "POST",
            contentType: 'application/json',
            url: `/recipe/search`,
            dataType: 'json',
            data: JSON.stringify(recipeInfo),
            success: function (response) {
                if (response['msg'] == 'success') {
                    $('#recipe-list').empty();
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['likes_count'], recipe[i]['like_by_me'], "search")
                    }
                    showControl(recipeListDisplay);
                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥")
                    showControl(recipeChoiceDisplay);
                }
            }
        });
    // Navbar의 "레시피 검색"을 클릭한 경우, 검색어에 알맞는 레시피 호출 & 출력
    } else if (status == "searchRecipes") {
        $.ajax({
            type: "GET",
            url: `/recipe/search?recipe-search-name=${gRecipeSearchName}`,
            success: function (response) {
                if (response['msg'] == 'success') {
                    $('#recipe-list').empty();
                    changePart("rec");
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['likes_count'], recipe[i]['like_by_me'], "search")
                    }
                    showControl(recipeListDisplay);
                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥")
                    // showControl(recipeChoiceDisplay);
                }
            }
        });
    // 좋아요 탭을 눌렀을 경우, 사용자가 좋아요한 레시피 호출 & 출력
    } else if (status == "liked" || status == "likedInMypage") {
        $.ajax({
            type: "GET",
            url: "/recipe/search",
            success: function (response) {
                let idToAppend = status == "liked" ? "#recipe-liked-list" : "#recipe-liked-mp-list"
                let idAlertNoLiked = status == "liked" ? "alert-no-liked" : "alert-no-liked-in-my-page"
                $(idToAppend).empty();
                if (response['msg'] == 'success') {
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['likes_count'], recipe[i]['like_by_me'], status)
                    }
                } else if (response['msg'] == 'nothing') {
                    let tempHtml = `<div id=${idAlertNoLiked}>좋아요한 레시피가 없습니다.😥<br>관심있는 레시피에 좋아요를 눌러보세요.</div>`
                    $(idToAppend).append(tempHtml)
                }
            }
        })
    }
}

// 검색한 레시피 리스트 & 좋아요 탭 레시피 리스트 출력
function makeRecipeList(recipeId, recipeUrl, recipeName, recipeDesc, recipeLikesCount, recipeLikebyMe, status) {
    let classHeart = recipeLikebyMe ? "fa-heart" : "fa-heart-o"
    let classColor = recipeLikebyMe ? "heart liked" : "heart"
    let idTyep
    let toggleLikeNum
    if (status == "search") {idTyep = ""; toggleLikeNum = 0;}
    else if (status == "liked") {idTyep = "-liked"; toggleLikeNum = 2;}
    else if (status == "likedInMypage") {idTyep = "-liked-mp"; toggleLikeNum = 3;}

    let tempHtml = `<div id="recipe${recipeId}" class="card" style="margin:10px auto 10px auto;  min-width: 200px; max-width: 200px;">                                
                        <img class="card-img-top img-fix" src="${recipeUrl}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipeName}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipeDesc}</p>
                            <div class="card-footer">
                                <a href="javascript:void(0);" onclick="getRecipeDetail(${recipeId}); getComment(${recipeId}); showControl(recipeDetailDisplay)" class="card-link">자세히</a>
                                <a id="likes${idTyep}-${recipeId}" class="${classColor}" onclick="toggleLike(${recipeId}, ${toggleLikeNum})"><i class="fa ${classHeart}" aria-hidden="true"></i>&nbsp;<span class="like-num">${num2str(recipeLikesCount)}</span></a>
                            </div>
                        </div>
                    </div>`
    $(`#recipe${idTyep}-list`).append(tempHtml)
}

/* 레시피 상세정보 요청 함수 */
function getRecipeDetail(recipeId) {
    $.ajax({
        type: "GET",
        url: `/recipe/detail?recipe-id=${recipeId}`,
        success: function (response) {
            makeRecipeDetail(response["info"], response["detail"], response["ingredients"], response["like_info"][0])
        }
    })
}

/* 레시피 상세정보 출력 함수 */
function makeRecipeDetail(info, detail, ingredients, like_info) {
    let classHeart = like_info['like_by_me'] ? "fa-heart" : "fa-heart-o"
    let classColor = like_info['like_by_me'] ? "heart-detail liked" : "heart-detail"
    let infoHtml = `<span class="detail-title">${info["RECIPE_NM_KO"]}</span>
                     <span class="detail-info">${info["COOKING_TIME"]}</span>
                     <span class="detail-info">${info["QNT"]}</span>
                     <a id="likes-detail-${info["RECIPE_ID"]}" class="${classColor}" onclick="toggleLike(${info["RECIPE_ID"]}, 1)"><i class="fa ${classHeart}" aria-hidden="true"></i>&nbsp;<span class="like-num">${num2str(like_info['likes_count'])}</span></a>

                    <h4>${info["SUMRY"]}</h4>`

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


// 좋아요 기능
function toggleLike(recipe_id, num) {
    let likeIdArray = ["","-detail", "-liked", "-liked-mp"]
    let likeId = $(`#likes${likeIdArray[num]}-${recipe_id}`)
    let actionData = !likeId.hasClass("liked") ? "like" : "unlike"
    let iAddClassData = !likeId.hasClass("liked") ? "fa-heart" : "fa-heart-o"
    let iRemoveClassData = !likeId.hasClass("liked") ? "fa-heart-o" : "fa-heart"

    $.ajax({
        type : 'POST',
        url : `recipe/update_like`,
        data : {
            recipe_id : recipe_id,
            action : actionData
        },
        success : function(response) {
            for(let i = 0; i < likeIdArray.length; i++) {
                let likeId = $(`#likes${likeIdArray[i]}-${recipe_id}`)
                likeId.find("i").addClass(iAddClassData).removeClass(iRemoveClassData)
                if (!likeId.hasClass("liked")) {likeId.addClass("liked")}
                else {likeId.removeClass("liked")}
                likeId.find("span.like-num").text(num2str(response["likes_count"]))
            }
        }
    })
}

// 좋아요 수 편집 (K로 나타내기)
function num2str(likesCount) {
    if (likesCount > 10000) {
        return parseInt(likesCount / 1000) + "k"
    }
    if (likesCount > 500) {
        return parseInt(likesCount / 100) / 10 + "k"
    }
    if (likesCount == 0) {
        return ""
    }
    return likesCount
}

// 검색 결과 출력 페이지 상단의 추천탭/좋아요탭 기능
function changePart(part) { 
    if (part == 'rec') {
        $('#recipe-liked-list').hide();
        $('#recipe-list').show();
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
        postRecipeInfo("liked");
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

function logout() {
    $.removeCookie('mytoken');
    if ($.cookie('mytoken') == undefined) {
        alert('로그아웃!');
        window.location.href = '/login';
    }
}