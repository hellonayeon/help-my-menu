let recipe_id
let IRDNT_NM = []
let NATION_NM = []
let LEVEL_NM = []
let COOKING_TIME = []
let list = []

// 화면 출력 제어 플래그
const RECIPE_LIST_DISPLAY = "RECIPE_LIST_DISPLAY"
const RECIPE_DETAIL_DISPLAY = "RECIPE_DETAIL_DISPLAY"
const RECIPE_CHOICE_DISPLAY = "RECIPE_CHOICE_DISPLAY"
const RECIPE_LOADING_DISPLAY = "RECIPE_LOADING_DISPLAY"

$(document).ready(function () {
    ingredientListing();

    // 사진 업로드
    bsCustomFileInput.init()

    // 화면 출력 내용: 초기에는 "재료 선택 화면"으로 설정
    showControl(RECIPE_CHOICE_DISPLAY)
});

/* 화면에 보여지는 내용 보이기, 숨기기 */
function showControl(display) {
    switch (display) {
        case RECIPE_CHOICE_DISPLAY:
            $("#recipe-choice-container").show()
            $("#recipe-loading-container").hide()
            $("#recipe-detail-container").hide()
            $("#recipe-list-container").hide()
            break
        case RECIPE_LOADING_DISPLAY:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").show()
            $("#recipe-list-container").hide()
            $("#recipe-detail-container").hide()
            break
        case RECIPE_LIST_DISPLAY:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").hide()
            $("#recipe-list-container").show()
            $("#recipe-detail-container").hide()
            break
        case RECIPE_DETAIL_DISPLAY:
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
            let temp = {}
            let recipe_ingredient_main = response['recipe_ingredient_main']
            let recipe_ingredient_sauce = response['recipe_ingredient_sauce']

            for (let i = 0; i < recipe_ingredient_main.length; i++) {
                let ingredient = recipe_ingredient_main[i]
                let temp_html = `<option value="main">${ingredient}</option>`
                $('#ingre1').append(temp_html)
            }
            for (let i = 0; i < recipe_ingredient_sauce.length; i++) {
                let ingredient = recipe_ingredient_sauce[i]
                let temp_html = `<option value="sauce">${ingredient}</option>`
                $('#ingre2').append(temp_html)
            }
        }
    })
}

//검색 자동완성 기능
$(function autosearch() {
    $("#searchInput").autocomplete({
        source: function (request, response) {
            $.ajax({
                type: "GET",
                url: "/search",
                dataTye : 'json',
                success: function (data) {
                    // 서버에서 json 데이터 response 후 목록 추가
                    response(
                        $.map(data, function(item) {
                            return {
                                label : item["IRDNT_NM"],
                                value : item["IRDNT_NM"],
                                main_sauce : item["IRDNT_TY_NM"]
                            }
                        })
                    )
                }
            })
        },
        select: function (event, ui) {
            let ingredient = ui.item.label
            let main_or_sauce = ui.item.main_sauce
            console.log(ingredient)
            console.log(main_or_sauce)

            if (main_or_sauce == "주재료" && IRDNT_NM.indexOf(ingredient) == -1) {
                let temp_html = `<input type="button" class="btn btn-outline-primary" id="selected-ingredient-button-${index}" value="" style="margin-right:5px" onclick="cancleSelectingIngredientAdded(this)"/>`
                $('#selected-ingredient-display-main').append(temp_html)
                let temp = 'selected-ingredient-button-' + index
                document.getElementById(temp).value = ingredient;
                index += 1;
                IRDNT_NM.push(ingredient);

            } else if (main_or_sauce == "양념" && IRDNT_NM.indexOf(ingredient) == -1) {
                let temp_html = `<input type="button" class="btn btn-outline-danger" id="selected-ingredient-button-${index}" value="" style="margin:5px 5px 0px 0px" onclick="cancleSelectingIngredientAdded(this)"/>`
                $('#selected-ingredient-display-sauce').append(temp_html)
                let temp = 'selected-ingredient-button-' + index
                document.getElementById(temp).value = ingredient;
                index += 1;
                IRDNT_NM.push(ingredient)
            }
        },
        focus: function (event, ui) {
            return false;
        },
        minLength: 1,
        delay: 100,
        disabled: false
    });
});


let index = 1

// 선택한 재료 표시하기 & 선택 재료 데이터 저장
function ingredientDisplay(ingredient) {
    if (ingredient.value == "main" && IRDNT_NM.indexOf(ingredient.options[ingredient.selectedIndex].text) == -1) {
        let temp_html = `<input type="button" class="btn btn-outline-primary" id="selected-ingredient-button-${index}" value="" style="margin-right:5px" onclick="cancleSelectingIngredientAdded(this)"/>`
        console.log(ingredient.value)
        console.log(ingredient.selectedIndex)
        console.log(ingredient.options[ingredient.selectedIndex])
        $('#selected-ingredient-display-main').append(temp_html)
        let temp = 'selected-ingredient-button-' + index
        document.getElementById(temp).value = ingredient.options[ingredient.selectedIndex].text;
        index += 1;
        IRDNT_NM.push(document.getElementById(temp).value);

    } else if (ingredient.value == "sauce" && IRDNT_NM.indexOf(ingredient.options[ingredient.selectedIndex].text) == -1) {
        let temp_html = `<input type="button" class="btn btn-outline-danger" id="selected-ingredient-button-${index}" value="" style="margin:5px 5px 0px 0px" onclick="cancleSelectingIngredientAdded(this)"/>`
        $('#selected-ingredient-display-sauce').append(temp_html)
        let temp = 'selected-ingredient-button-' + index
        document.getElementById(temp).value = ingredient.options[ingredient.selectedIndex].text;
        index += 1;
        IRDNT_NM.push(document.getElementById(temp).value)

    }
}

// 선택한 재료 취소하기 & 선택 재료 데이터 삭제
function cancleSelectingIngredientAdded(ingredient) {
    for_remove_button = document.getElementById(ingredient.closest("input").id);
    for_remove_button.parentNode.removeChild(for_remove_button);
    idx = IRDNT_NM.indexOf(ingredient.closest("input").value)
    IRDNT_NM.splice(idx, 1)
}

// "레시피 보기" 버튼 누르기
function selectedRecipeNation() {
    if (IRDNT_NM.length < 1) { // 원하는 개수만큼 조건에 맞게 숫자 수정 가능
        alert("재료를 선택해주세요!")
        return 0
    }
    // 식사 유형 데이터 저장
    if (document.getElementById('inputGroupSelect04').value != "바로...") {
        NATION_NM.push(document.getElementById('inputGroupSelect04').value)
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
            LEVEL_NM.push('초보환영')
        }
        if ($("input[id='level2']:checked").val() == 'on') {
            LEVEL_NM.push('보통')
        }
        if ($("input[id='level3']:checked").val() == 'on') {
            LEVEL_NM.push('어려움')
        }
    }

    // 조리시간 데이터 저장
    if ($("input[id='short']:checked").val() == undefined && $("input[id='medium']:checked").val() == undefined && $("input[id='long']:checked").val() == undefined) {
        alert("조리시간을 선택해주세요.")
        return 0
    } else {
        if ($("input[id='short']:checked").val() == 'on') {
            COOKING_TIME.push('5분', '10분', '15분', '20분', '25분', '30분', '35분', '40분', '50분', '60분')
        }
        if ($("input[id='medium']:checked").val() == 'on') {
            COOKING_TIME.push('70분', '80분', '90분', '120분')
        }
        if ($("input[id='long']:checked").val() == 'on') {
            COOKING_TIME.push('140분', '175분', '180분')
        }
    }
    postRecipeInfo();
    showControl(RECIPE_LOADING_DISPLAY);
}

// 레시피 조건 보내기 POST
function postRecipeInfo() {
    var recipe_info = {"IRDNT_NM": IRDNT_NM, "NATION_NM": NATION_NM, "LEVEL_NM": LEVEL_NM, "COOKING_TIME": COOKING_TIME}
    $.ajax({
        type: "POST",
        contentType: 'application/json',
        url: "/recipe/post",
        dataType: 'json',
        data: JSON.stringify(recipe_info),
        success: function (response) {
            if (response['msg'] == 'success') {
                getRecipeList();
                showControl(RECIPE_LIST_DISPLAY);
            } else {
                alert("조건에 해당 되는 레시피가 없습니다.😥")
                showControl(RECIPE_CHOICE_DISPLAY);
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
                let recipe_url = recipe[i]['IMG_URL']
                let recipe_name = recipe[i]['RECIPE_NM_KO']
                let recipe_desc = recipe[i]['SUMRY']
                let recipe_id = recipe[i]['RECIPE_ID']
                let recipe_liked = recipe[i]['Liked']

                makeRecipeList(recipe_id, recipe_url, recipe_name, recipe_desc, recipe_liked)
            }
        }
    })
}

// 레시피 리스트 html
function makeRecipeList(recipe_id, recipe_url, recipe_name, recipe_desc, recipe_liked) {
    let tempHtml = `<div  id="recipe${recipe_id}" class="card" style="margin-right: 12px; margin-left: 12px; min-width: 200px; max-width: 200px; margin-top: 10px; margin-bottom: 10px;">                                
                        <img class="card-img-top img-fix" src="${recipe_url}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipe_name}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipe_desc}</p>
                            <div class="card-footer">
                                <a href="javascript:void(0);" onclick="getRecipeDetail(${recipe_id}); getComment(${recipe_id}); showControl(RECIPE_DETAIL_DISPLAY)" class="card-link">자세히</a>`
    if (recipe_liked >= 1) {
        tempHtml += `<a id="before-like_${recipe_id}" style="color:black; float:right; display:none"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipe_id})" style="margin-right:5px"></i>${recipe_liked}</a><a id="after-like_${recipe_id}" style="color:red; float:right;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipe_id})" style="margin-right:5px"></i>${recipe_liked}</a>
                        </div>
                    </div>
                    </div>`
    } else {
        tempHtml += `<a id="before-like_${recipe_id}" style="color:black; float:right;"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipe_id})" style="margin-right:5px"></i>${recipe_liked}</a><a id="after-like_${recipe_id}" style="color:red; float:right; display:none"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipe_id})" style="margin-right:5px"></i>${recipe_liked}</a>
                        </div>
                    </div>
                    </div>`
    }

    $('#recipe-list').append(tempHtml)
}

/* 레시피 상세정보 요청 함수 */
function getRecipeDetail(recipe_id) {
    $.ajax({
        type: "GET",
        url: `/recipe/detail?recipe_id=${recipe_id}`,
        success: function (response) {
            makeRecipeDetail(response["info"], response["detail"], response["ingredients"])
        }
    })
}

/* 레시피 상세정보 출력 함수 */
function makeRecipeDetail(info, detail, ingredients) {
    let info_html = `<span class="detail-title">${info["RECIPE_NM_KO"]}</span>
                     <span class="detail-info">${info["COOKING_TIME"]}</span>
                     <span class="detail-info">${info["QNT"]}</span>`
    if (info['Liked'] >= 1) {
        info_html += `<a id="before-like_detail_${info["RECIPE_ID"]}" style="color:black;float:right;margin-top:20px; display:none"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a><a id="after-like_detail_${info["RECIPE_ID"]}" style="color:red; float:right;margin-top:20px;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a>
                    
                    <h4>${info["SUMRY"]}</h4>`
    } else {
        info_html += `<a id="before-like_detail_${info["RECIPE_ID"]}" style="color:black;float:right;margin-top:20px"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a><a id="after-like_detail_${info["RECIPE_ID"]}" style="color:red; float:right;margin-top:20px; display:none"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${info["RECIPE_ID"]})" style="margin-right:5px"></i>${info['Liked']}</a>
                    
                    <h4>${info["SUMRY"]}</h4>`
    }

    for (let i = 0; i < ingredients.length; i++) {
        info_html += `<span class="badge badge-primary ingredient-tag">${ingredients[i]["IRDNT_NM"]} : ${ingredients[i]["IRDNT_CPCTY"]}</span>`
    }

    let detail_html = ``
    detail.forEach(function (step) {
        detail_html += `<div class="col-12">STEP<span class="detail-step-num">${step["COOKING_NO"]}. </span> ${step["COOKING_DC"]}</div>`
    })

    // 댓글 저장 시, RECIPE_ID 정보 필요
    let comment_btn_html = `<button type="button" class="btn btn-primary" onclick="saveComment(${info["RECIPE_ID"]})">댓글 작성</button>`

    // 이전에 출력했던 상세정보 지우기
    $('#detail-img').empty()
    $('#detail-info').empty()
    $('#detail-step').empty()
    $('#comment-upload-btn-div').empty()

    $('#detail-img').attr("src", info["IMG_URL"])
    $('#detail-info').append(info_html)
    $('#detail-step').append(detail_html)
    $('#comment-upload-btn-div').append(comment_btn_html)
}

/* 댓글 리스트 요청 함수 */
function getComment(recipe_id) {
    $.ajax({
        type: "GET",
        url: `/recipe/comment?recipe_id=${recipe_id}`,
        success: function (response) {
            makeComment(response)
        }
    })
}

/* 사용자 닉네임, 비밀번호 입력 체크 함수 */
function checkCommentUserInfo(nick_nm, pw, text) {
    if (text == "") {
        alert("내용을 입력해주세요!")
        return false
    }
    if (nick_nm == "") {
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
function saveComment(recipe_id) {
    let nick_nm = $('#comment-nick').val()
    let pw = $('#comment-pw').val()
    let text = $('#comment-text-area').val()
    let img_src = $('#file')[0].files[0]

    // 아이디 또는 비밀번호, 댓글 내용을 입력 안한 경우
    if (!checkCommentUserInfo(nick_nm, pw, text)) return

    let form_data = new FormData()
    form_data.append("recipe_id", recipe_id)
    form_data.append("text", text)
    form_data.append("img_src", img_src)
    form_data.append("nick_nm", nick_nm)
    form_data.append("pw", pw)

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

                getComment(recipe_id)
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
        let comment_html = `<div class="container">
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
                                     <button class="comment-delete-btn" onclick="showPasswordDialog(${comment["RECIPE_ID"]}, ${comment["NICK_NM"]})">삭제</button>
                                </div>
                             </div>
                             <br>
                             <div class="row comment-content" id="comment-content-${idx}">
                                <!-- Dynamic contents -->
                             </div>
                             </div>
                             <hr>`

        $('#comment-list').append(comment_html)

        // 이미지가 있는 경우 댓글 내용에 이미지 출력
        if (comment["IMG_SRC"] != "") {
            let img_html = `<div class="col-12"><img src="../static/images/${comment["IMG_SRC"]}" style="width: 250px; height: 200px"></div>`
            $(`#comment-content-${idx}`).append(img_html)
        }

        let txt_html = `<div class="col-12">${comment["TEXT"]}</div>`
        $(`#comment-content-${idx}`).append(txt_html)
    })
}

function deleteComment(recipe_id, nick_nm, pw) {
    $.ajax({
        type: "POST",
        url: "/recipe/comment/delete",
        data: {"nick_nm": nick_nm, "pw": pw},
        success: function (response) {
            if (response["result"] == "success") {
                // 댓글 다시 출력: 삭제된 댓글 반영
                getComment(recipe_id)
            } else {
                alert(response["msg"])
                return
            }
        }
    })
}

/* 비밀번호 입력 다이얼로그 출력 함수 */
function showPasswordDialog(recipe_id, nick_nm) {
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
                    pw = $('#comment-pw-confirm-input').val()
                    if (pw == "") {
                        $('#comment-pw-confirm-input').css('border-color', 'red')
                        $('#comment-pw-confirm-input').attr('placeholder', '비밀번호를 입력해주세요!')
                    } else {
                        deleteComment(recipe_id, nick_nm, pw)
                        $(this).dialog("close");
                    }
                }
            }
        ],
        // 다이얼로그가 닫히기 직전에 호출되는 함수
        beforeClose: function (event, ui) {
            $('#comment-pw-confirm-input').val('')
            $('#comment-pw-confirm-input').css('border-color', '')
            $('#comment-pw-confirm-input').attr('placeholder', '')
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
function setLike(recipe_id) {
    $('#before-like_' + recipe_id).hide();
    $('#after-like_' + recipe_id).show();
    $('#before-like_detail_' + recipe_id).hide();
    $('#after-like_detail_' + recipe_id).show();
    $('#before-like_liked_' + recipe_id).hide();
    $('#after-like_liked_' + recipe_id).show();
    $.ajax({
        type: "PUT",
        url: `/recipe/like?recipe-id=${recipe_id}`,
        data: {recipe_id: recipe_id},
        success: function (response) {
            alert(response["msg"]);
        }
    })
}

// 좋아요 해제
function setUnLike(recipe_id) {
    $('#after-like_' + recipe_id).hide();
    $('#before-like_' + recipe_id).show();
    $('#after-like_detail_' + recipe_id).hide();
    $('#before-like_detail_' + recipe_id).show();
    $('#after-like_liked_' + recipe_id).hide();
    $('#before-like_liked_' + recipe_id).show();
    $.ajax({
        type: "PUT",
        url: `/recipe/unlike?recipe-id=${recipe_id}`,
        data: {recipe_id: recipe_id},
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
                let recipe_url = recipe[i]['IMG_URL']
                let recipe_name = recipe[i]['RECIPE_NM_KO']
                let recipe_desc = recipe[i]['SUMRY']
                let recipe_id = recipe[i]['RECIPE_ID']
                let recipe_liked = recipe[i]['Liked']

                makeRecipesLikedList(recipe_id, recipe_url, recipe_name, recipe_desc, recipe_liked)
            }
        }
    })
}

// 좋아요탭의 좋아요한 레시피 표시
function makeRecipesLikedList(recipe_id, recipe_url, recipe_name, recipe_desc, recipe_liked) {
    let tempHtml = `<div  id="recipe${recipe_id}" class="card" style="margin-right: 12px; margin-left: 12px; min-width: 200px; max-width: 200px; margin-top: 10px; margin-bottom: 10px;">
                        <img class="card-img-top img-fix" src="${recipe_url}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipe_name}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipe_desc}</p>
                            <div class="card-footer">
                                <a href="javascript:void(0);" onclick="getRecipeDetail(${recipe_id}); getComment(${recipe_id}); showControl(RECIPE_DETAIL_DISPLAY)" class="card-link">자세히</a>`
    if (recipe_liked >= 1) {
        tempHtml += `<a id="before-like_liked_${recipe_id}" style="color:black; float:right; display:none;"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipe_id})"style="margin-right:5px"></i>${recipe_liked}</a><a id="after-like_liked_${recipe_id}" style="color:red; float:right;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipe_id})"style="margin-right:5px"></i>${recipe_liked}</a>
                        </div>
                    </div>
                    </div>`

    } else {
        tempHtml += `<a id="before-like_liked_${recipe_id}" style="color:black; float:right;"><i class="fa fa-heart-o" aria-hidden="true" onclick="setLike(${recipe_id})"style="margin-right:5px"></i>${recipe_liked}</a><a id="after-like_liked_${recipe_id}" style="color:red; float:right; display:none;"><i class="fa fa-heart" aria-hidden="true" onclick="setUnLike(${recipe_id})"style="margin-right:5px"></i>${recipe_liked}</a>
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