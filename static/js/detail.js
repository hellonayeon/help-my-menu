/* 레시피 상세정보 요청 함수 */
function getRecipeDetail(recipeId) {
    $.ajax({
        type: "GET",
        url: `/recipe/detail?req-type=json&recipe-id=${recipeId}`,
        success: function (response) {
            makeRecipeDetail(response["recipe_info"], response["steps"], response["irdnts"], response["like_info"], response['user_id'])
        }
    })
}

/* 레시피 상세정보 출력 함수 */
function makeRecipeDetail(recipeInfo, steps, irdnts, likeInfo, userId) {
    let classHeart = likeInfo['LIKE_BY_ME'] ? "fa-heart" : "fa-heart-o"
    let classColor = likeInfo['LIKE_BY_ME'] ? "heart-detail liked" : "heart-detail"
    let infoHtml = `<span class="detail-title">${recipeInfo["RECIPE_NM_KO"]}</span>
                     <span class="detail-info">${recipeInfo["COOKING_TIME"]}</span>
                     <span class="detail-info">${recipeInfo["QNT"]}</span>
                     <a id="likes-detail-${recipeInfo["RECIPE_ID"]}" class="${classColor}" onclick="toggleLike(${recipeInfo["RECIPE_ID"]}, 1)"><i class="fa ${classHeart}" aria-hidden="true"></i>&nbsp;<span class="like-num">${num2str(likeInfo['LIKES_COUNT'])}</span></a>
                    <h4>${recipeInfo["SUMRY"]}</h4>`

    for (let i = 0; i < irdnts.length; i++) {
        infoHtml += `<span class="badge badge-primary ingredient-tag">${irdnts[i]["IRDNT_NM"]} : ${irdnts[i]["IRDNT_CPCTY"]}</span>`
    }

    let detailHtml = ``
    steps.forEach(function (step) {
        detailHtml += `<div class="col-12">STEP<span class="detail-step-num">${step["COOKING_NO"]}. </span> ${step["COOKING_DC"]}</div>`
    })

    // 댓글 저장 시, RECIPE_ID 정보 필요
    let commentBtnHtml = `<button type="button" class="btn btn-primary" onclick="saveComment(${recipeInfo['RECIPE_ID']}, '${userId}', '${userId}')">댓글 작성</button>`

    $('#detail-img').attr("src", recipeInfo["IMG_URL"])
    $('#detail-info').append(infoHtml)
    $('#detail-step').append(detailHtml)
    $('#comment-upload-btn-div').append(commentBtnHtml)
}