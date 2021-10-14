let gIrdntNm = []
let gNationNm = []
let gLevelNm = []
let gCookingTime = []
let gSorted = []
let gIngreList = []
let gRecipeNameList = []
let gRecipeSearchName
let gIndex = 1

$(document).ready(function () {
    ingredientListing();

    // 사진 업로드
    bsCustomFileInput.init()

    // 접속한 url에 따라 [일반적인 홈 접속]인지 [마이페이지-레시피 검색 기능]인지 구별
    let url = window.location.href
    // 검색을 통한 접근이면 url에 recipe-name-kor-search가 포함됨.
    if (url.includes("recipe-name-kor-search=")) {
        gRecipeSearchName = url.split('=').at(-1)
        postRecipeInfo("searchRecipes", 0);
    } else {
        // 일반적인 홈페이지 접근이라면 "추천 리스트" 출력
        bestRecipeInfo()
    }
});

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
                selectedRecipeFilter()
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
    // 오른쪽 상단 navbar의 검색 input 박스의 내용을 가져와서 2글자 미만이면 alert, 아니면 페이지 이동으로 검색
        let recipeName = $('#search-recipe-input').val();
    if (recipeName.length < 2) {
        alert("검색할 레시피 이름을 2글자 이상 기입하세요.");
    } else {
        location.href = `/?recipe-name-kor-search=${recipeName}`
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
        selectedRecipeFilter()
    }
}

// 선택한 재료 취소하기 & 선택 재료 데이터 삭제
function cancleSelectingIngredientAdded(ingredient) {
    forRemoveButton = document.getElementById(ingredient.closest("input").id);
    forRemoveButton.parentNode.removeChild(forRemoveButton);
    idx = gIrdntNm.indexOf(ingredient.closest("input").value)
    gIrdntNm.splice(idx, 1)
    // 재료가 0개일 때, 재료선택 경고창 호출
    if (gIrdntNm[0] == undefined) {
        alert("재료를 하나 이상 선택해 주세요.")
        return 0
    } else {
        selectedRecipeFilter()
    }
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

    } else if ($("#search-page").hasClass("active")) {
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
        if ($("input[name=nation]:checked").val() == undefined) {

            gNationNm.push('한식', '일식', '중식', '서양, 이탈리아', '동남아시아', '퓨전')
        } else {
            gNationNm.push($('input[name=nation]:checked').val())
        }

        // 식사 난이도 데이터 저장
        if ($("input[id='filter-level1']:checked").val() == undefined && $("input[id='filter-level2']:checked").val() == undefined && $("input[id='filter-level3']:checked").val() == undefined) {
            gLevelNm.push('초보환영', '보통', '어려움')
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
            gCookingTime.push('5분', '10분', '15분', '20분', '25분', '30분', '35분', '40분', '50분', '60분', '70분', '80분', '90분', '120분', '140분', '175분', '180분')
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

// 메인화면 추천 레시피 리스트 출력
function bestRecipeInfo() {
    $.ajax({
        type: "GET",
        url: '/recipe/search',
        success: function (response) {
            if (response['msg'] == 'success') {
                let recipe = response['data_we_get']
                for (let i = 0; i < recipe.length; i++) {
                    makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['LIKES_COUNT'], recipe[i]['LIKE_BY_ME'], status)
                }
            }
        }
    });
}

// 레시피 리스트 만들기 ("필터 수정", "레시피 검색", "마이페이지 즐겨찾기")
function postRecipeInfo(status, info) {
    // 검색 리스트에서 필터 "수정"을 클릭한 경우, 사용자 지정 조건에 맞는 검색 리스트 호출 & 출력
    if (status == "filter") {
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

                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥");
                    gNationNm = [];
                    gLevelNm = [];
                    gCookingTime = [];
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
                    $('#recipe-search-list').empty();
                    changePart("search");
                    let recipe = response['data_we_get']
                    for (let i = 0; i < recipe.length; i++) {
                        makeRecipeList(recipe[i]['RECIPE_ID'], recipe[i]['IMG_URL'], recipe[i]['RECIPE_NM_KO'], recipe[i]['SUMRY'], recipe[i]['LIKES_COUNT'], recipe[i]['LIKE_BY_ME'], status)
                    }
                } else if (response['msg'] == 'nothing') {
                    alert("조건에 해당 되는 레시피가 없습니다.😥")
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
    // 한 페이지 안의 좋아요 버튼을 구별하기 위한 조건문
    let idType, heartIdType, toggleLikeNum
    if (status == "filter") {
        idType = "-list";
        heartIdType = "";
        toggleLikeNum = 0;
    } else if (status == "liked") {
        idType = "-liked-list";
        heartIdType = "-liked";
        toggleLikeNum = 2;
    } else if (status == "likedInMypage") {
        idType = `-liked-mypage-list`;
        heartIdType = "-liked-mypage";
        toggleLikeNum = 3;
    } else if (status == "searchRecipes") {
        idType = "-search-list";
        heartIdType = "-search";
        toggleLikeNum = 4;
    }


    let tempHtml = `<div id="recipe${recipeId}" class="card" style="margin:10px 12.5px 10px 12.5px;  min-width: 200px; max-width: 200px;">                                
                        <img class="card-img-top img-fix" src="${recipeUrl}" alt="Card image cap">
                        <div class="card-body">
                            <h5 class="card-title">${recipeName}</h5>
                            <p class="card-text text-overflow" style="min-height: 100px; max-height: 100px;">${recipeDesc}</p>
                            <div class="card-footer">
                                <a href="/recipe/detail?recipe-id=${recipeId}" class="card-link">자세히</a>
                                <a id="likes${heartIdType}-${recipeId}" class="${classColor}" onclick="toggleLike(${recipeId}, ${toggleLikeNum})"><i class="fa ${classHeart}" aria-hidden="true"></i>&nbsp;<span class="like-num">${num2str(recipeLikesCount)}</span></a>
                            </div>
                        </div>
                    </div>`
    $(`#recipe${idType}`).append(tempHtml)
}

// 좋아요 기능
function toggleLike(recipe_id, toggleLikeNum) {
    // toggleLikeNum은 어디서 호출했는지에 따라 배열의 위치에 맞게 정수값을 주었습니다.
    let likeIdArray = ["","-detail", "-liked", "-liked-mypage", "-search"]
    let likeId = $(`#likes${likeIdArray[toggleLikeNum]}-${recipe_id}`)
    // 좋아요 설정 및 해제는 app.py에서 DB에 좋아요 데이터가 있는지 없는지를 기준으로 동작하고, 그 결과를 가져옵니다.
    $.ajax({
        type : 'POST',
        url : `/recipe/update_like`,
        data : {
            recipe_id : recipe_id
        },
        success: function (response) {
            for (let i = 0; i < likeIdArray.length; i++) {
                likeId = $(`#likes${likeIdArray[i]}-${recipe_id}`)
                if (response['action'] == "like") {
                    // "좋아요" 설정 시, 꽉 찬 하트(fa-heart) + 빨간색(liked 클래스 추가)
                    // liked 클래스는 css 파일 참고해보세요. .heart .liked {} 입니다.
                    if (likeId.find("i").hasClass("fa-heart-o")) {
                        likeId.find("i").removeClass("fa-heart-o").addClass("fa-heart")
                    }
                    if (!likeId.hasClass("liked")) {
                        likeId.addClass("liked")
                    }
                } else {
                    // "좋아요" 해제 시, 빈 하트(fa-heart-o) + 검은색(liked 클래스 삭제)
                    if (likeId.find("i").hasClass("fa-heart")) {
                        likeId.find("i").removeClass("fa-heart").addClass("fa-heart-o")
                    }
                    if (likeId.hasClass("liked")) {
                        likeId.removeClass("liked")
                    }
                }
                // 좋아요 수 반영
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
        $('#recipe-search-list').hide();
        $('#recipe-list-title').show();
        if ($('#part-rec').children("a").hasClass("disabled")) {
            $('#part-rec').children("a").removeClass("disabled")
            $('#part-rec').children("a").addClass("active")
        }
        if ($('#part-like').children("a").hasClass("active")) {
            $('#part-like').children("a").removeClass("active")
            $('#part-like').children("a").addClass("disabled")
        }
        if ($('#part-search').children("a").hasClass("active")) {
            $('#part-search').children("a").removeClass("active")
            $('#part-search').children("a").addClass("disabled")
        }
    } else if (part == "search") {
        $('#recipe-list').hide();
        $('#recipe-liked-list').hide();
        $('#recipe-search-list').show();
        $('#recipe-list-title').hide();
        if ($('#part-search').children("a").hasClass("disabled")) {
            $('#part-search').children("a").removeClass("disabled")
            $('#part-search').children("a").addClass("active")
        }
        if ($('#part-rec').children("a").hasClass("active")) {
            $('#part-rec').children("a").removeClass("active")
            $('#part-rec').children("a").addClass("disabled")
        }
        if ($('#part-like').children("a").hasClass("active")) {
            $('#part-like').children("a").removeClass("active")
            $('#part-like').children("a").addClass("disabled")
        }
    } else {
        $('#recipe-list').hide();
        $('#recipe-liked-list').show();
        $('#recipe-search-list').hide();
        $('#recipe-list-title').hide();
        postRecipeInfo("liked", 0);
        if ($('#part-like').children("a").hasClass("disabled")) {
            $('#part-like').children("a").removeClass("disabled")
            $('#part-like').children("a").addClass("active")
        }
        if ($('#part-rec').children("a").hasClass("active")) {
            $('#part-rec').children("a").removeClass("active")
            $('#part-rec').children("a").addClass("disabled")
        }
        if ($('#part-search').children("a").hasClass("active")) {
            $('#part-search').children("a").removeClass("active")
            $('#part-search').children("a").addClass("disabled")
        }
    }
}


function logout() {
    $.removeCookie('mytoken', {path: '/'});
    alert('로그아웃!');
    window.location.href = '/login';
}