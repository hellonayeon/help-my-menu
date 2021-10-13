let gIrdntNm = []
let gNationNm = []
let gLevelNm = []
let gCookingTime = []
let gSorted = []
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
            $("#recipe-list-container").hide()
            $("#recipe-fileterbar").hide()
            break
        case recipeLoadingDisplay:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").show()
            $("#recipe-list-container").hide()
            $("#recipe-fileterbar").hide()
            break
        case recipeListDisplay:
            $("#recipe-choice-container").hide()
            $("#recipe-loading-container").hide()
            $("#recipe-list-container").show()
            $("#recipe-fileterbar").show()
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
        postRecipeInfo("searchRecipes", 0);
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
        let checkNation = document.getElementById('recipe-type-select-list').value
        $(`input:radio[id="nation-food-${checkNation}"]`).attr("checked", true);
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
            $('input:checkbox[id="filter-level1"]').attr("checked", true);
        }
        if ($("input[id='level2']:checked").val() == 'on') {
            gLevelNm.push('보통')
            $('input:checkbox[id="filter-level2"]').attr("checked", true);
        }
        if ($("input[id='level3']:checked").val() == 'on') {
            gLevelNm.push('어려움')
            $('input:checkbox[id="filter-level3"]').attr("checked", true);
        }
    }

    // 조리시간 데이터 저장
    if ($("input[id='short']:checked").val() == undefined && $("input[id='medium']:checked").val() == undefined && $("input[id='long']:checked").val() == undefined) {
        alert("조리시간을 선택해주세요.")
        return 0
    } else {
        if ($("input[id='short']:checked").val() == 'on') {
            gCookingTime.push('5분', '10분', '15분', '20분', '25분', '30분', '35분', '40분', '50분', '60분')
            $('input:checkbox[id="filter-short"]').attr("checked", true);
        }
        if ($("input[id='medium']:checked").val() == 'on') {
            gCookingTime.push('70분', '80분', '90분', '120분')
            $('input:checkbox[id="filter-medium"]').attr("checked", true);
        }
        if ($("input[id='long']:checked").val() == 'on') {
            gCookingTime.push('140분', '175분', '180분')
            $('input:checkbox[id="filter-long"]').attr("checked", true);
        }
    }
    showControl(recipeLoadingDisplay);
    postRecipeInfo("search", 0);
}


// "필터 보기" 버튼 누르기 (검색 호출)
function selectedRecipeFilter() {
    // 좋아요 탭에서 호출 시 정렬만 적용
    if ($("#favorite-page").hasClass("active")) {
        if ($("input[name='align']:checked").val()) {
            gSorted[0] = $("input[name='align']:checked").val()
        } else {
            alert("정렬을 선택해주세요.")
            return 0
        }
        postRecipeInfo("liked", 0);

    } else if ($("#search-recipe-input").val()) {
        if ($("input[name='align']:checked").val()) {
            gSorted[0] = $("input[name='align']:checked").val()
        } else {
            alert("정렬을 선택해주세요.")
            return 0
        }
        postRecipeInfo("searchRecipes", 0);

    } else {
        // 추천레시피 탭에서 호출 시 조건 + 정렬 다 적용
        // 식사 유형 데이터 저장
        gNationNm.push($('input[name=nation]:checked').val())

        // 식사 난이도 데이터 저장
        if ($("input[id='filter-level1']:checked").val() == undefined && $("input[id='filter-level2']:checked").val() == undefined && $("input[id='filter-level3']:checked").val() == undefined) {
            alert("난이도를 선택해주세요.")
            return 0
        } else {
            if ($("input[id='filter-level1']:checked").val() == 'on') {
                gLevelNm.push('초보환영')
            }
            if ($("input[id='filter-level2']:checked").val() == 'on') {
                gLevelNm.push('보통')
            }
            if ($("input[id='filter-level3']:checked").val() == 'on') {
                gLevelNm.push('어려움')
            }
        }

        // 조리시간 데이터 저장
        if ($("input[id='filter-short']:checked").val() == undefined && $("input[id='filter-medium']:checked").val() == undefined && $("input[id='filter-long']:checked").val() == undefined) {
            alert("조리시간을 선택해주세요.")
            return 0
        } else {
            if ($("input[id='filter-short']:checked").val() == 'on') {
                gCookingTime.push('5분', '10분', '15분', '20분', '25분', '30분', '35분', '40분', '50분', '60분')
            }
            if ($("input[id='filter-medium']:checked").val() == 'on') {
                gCookingTime.push('70분', '80분', '90분', '120분')
            }
            if ($("input[id='filter-long']:checked").val() == 'on') {
                gCookingTime.push('140분', '175분', '180분')
            }
        }

        if ($("input[name='align']:checked").val()) {
            gSorted[0] = $("input[name='align']:checked").val()
        } else {
            alert("정렬을 선택해주세요.")
            return 0
        }
        postRecipeInfo("filter", 0);
    }
}


// FIXME: 필터 넣기 위해서 status 항목 추가

// 레시피 리스트 만들기 ("레시피 보기" or "레시피 검색" or 좋아요 탭 or )
function postRecipeInfo(status, info) {
    // "레시피 보기"를 클릭한 경우, 사용자 지정 조건에 맞는 검색 리스트 호출 & 출력
    if (status == "search" || status == "filter") {
        var recipeInfo = {
            "IRDNT_NM": gIrdntNm,
            "NATION_NM": gNationNm,
            "LEVEL_NM": gLevelNm,
            "COOKING_TIME": gCookingTime,
            "SORTED": gSorted
        }
        $.ajax({
            type: "POST",
            contentType: 'application/json',
            url: `/recipe/search`,
            dataType: 'json',
            data: JSON.stringify(recipeInfo),
            success: function (response) {
                if (response['msg'] == 'success') {
                    $('#recipe-list').empty();
                    gNationNm = [];
                    gLevelNm = [];
                    gCookingTime = [];
                  
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['LIKES_COUNT'], recipe[i]['LIKE_BY_ME'], status)
                    }
                    showControl(recipeListDisplay);

                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥");
                    if (status == "search") {
                        showControl(recipeChoiceDisplay);

                    }
                }
            }
        });
        // Navbar의 "레시피 검색"을 클릭한 경우, 검색어에 알맞는 레시피 호출 & 출력
    } else if (status == "searchRecipes") {
        $.ajax({
            type: "GET",
            url: `/recipe/search?recipe-search-name=${gRecipeSearchName}&sort=${gSorted[0]}`,
            success: function (response) {
                if (response['msg'] == 'success') {
                    gSorted = [];
                    $('#recipe-list').empty();
                    changePart("rec");
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['LIKES_COUNT'], recipe[i]['LIKE_BY_ME'], status)
                    }
                    showControl(recipeListDisplay);
                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥")
                }
            }
        });
    // index.html 좋아요탭 혹은 user.html 즐겨찾기을 눌렀을 경우, 사용자가 좋아요한 레시피 호출 & 출력
    } else if (status == "searchRecipesInMyPage") {
        showControl(recipeLoadingDisplay);
        $.ajax({
            type: "GET",
            url: `/recipe/search?recipe-search-name=${info}&sort=${gSorted[0]}`,
            success: function (response) {
                if (response['msg'] == 'success') {
                    gSorted = [];
                    $('#recipe-list').empty();
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['LIKES_COUNT'], recipe[i]['LIKE_BY_ME'], status)
                    }
                    showControl(recipeListDisplay);
                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥")
                    window.location.href = '/';
                }
            }
        });
      // 좋아요 탭을 눌렀을 경우, 사용자가 좋아요한 레시피 호출 & 출력
    } else if (status == "liked" || status == "likedInMypage") {
        let urlForLikedOrMypage = status == "liked" ? `/recipe/search?sort=${gSorted[0]}` : `/recipe/search?user_id=${info}`
        $.ajax({
            type: "GET",
            url: urlForLikedOrMypage,
            success: function (response) {
                gSorted = [];
                let idToAppend = status == "liked" ? "#recipe-liked-list" : "#recipe-liked-mypage-list"
                let idAlertNoLiked = status == "liked" ? "alert-no-liked" : "alert-no-liked-in-my-page"
                $(idToAppend).empty();
                if (response['msg'] == 'success') {
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['LIKES_COUNT'], recipe[i]['LIKE_BY_ME'], status)
                    }
                } else if (response['msg'] == 'nothing') {
                    let tempHtml = `<div class=${idAlertNoLiked}>좋아요한 레시피가 없습니다.😥<br>관심있는 레시피에 좋아요를 눌러보세요.</div>`
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
    let idType, heartIdType, toggleLikeNum
    if (status == "search" || status == "searchRecipes" || status == "filter") {idType = "-list"; heartIdType = ""; toggleLikeNum = 0;}
    else if (status == "liked") {idType = "-liked-list"; heartIdType = "-liked"; toggleLikeNum = 2;}
    else if (status == "likedInMypage") {idType = `-liked-mypage-list`; heartIdType = "-liked-mypage"; toggleLikeNum = 3;}

    let tempHtml = `<div id="recipe${recipeId}" class="card" style="margin:10px 12.5px 10px 12.5px;  min-width: 200px; max-width: 200px;">                                
                        <img class="card-img-top img-fix" src="${recipeUrl}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipeName}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipeDesc}</p>
                            <div class="card-footer">
                                <a href="/recipe/detail?recipe-id=${recipeId}" target="_blank" class="card-link">자세히</a>
                                <a id="likes${heartIdType}-${recipeId}" class="${classColor}" onclick="toggleLike(${recipeId}, ${toggleLikeNum})"><i class="fa ${classHeart}" aria-hidden="true"></i>&nbsp;<span class="like-num">${num2str(recipeLikesCount)}</span></a>
                            </div>
                        </div>
                    </div>`
    $(`#recipe${idType}`).append(tempHtml)
}

// 좋아요 기능
function toggleLike(recipe_id, toggleLikeNum) {
    let likeIdArray = ["","-detail", "-liked", "-liked-mypage"]
    let likeId = $(`#likes${likeIdArray[toggleLikeNum]}-${recipe_id}`)
    $.ajax({
        type : 'POST',
        url : `/recipe/update_like`,
        data : {
            recipe_id : recipe_id
        },
        success : function(response) {
            for(let i = 0; i < likeIdArray.length; i++) {
                likeId = $(`#likes${likeIdArray[i]}-${recipe_id}`)
                if (response['action'] == "like") {
                    if (likeId.find("i").hasClass("fa-heart-o")) {likeId.find("i").removeClass("fa-heart-o").addClass("fa-heart")}
                    if (!likeId.hasClass("liked")) {likeId.addClass("liked")}
                } else {
                    if (likeId.find("i").hasClass("fa-heart")) {likeId.find("i").removeClass("fa-heart").addClass("fa-heart-o")}
                    if (likeId.hasClass("liked")) {likeId.removeClass("liked")}
                }
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
        postRecipeInfo("liked", 0);
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
    $.removeCookie('mytoken', {path: '/'});
    alert('로그아웃!');
    window.location.href = '/login';
}