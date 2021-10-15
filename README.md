# 내일배움캠프 프로젝트 (1차) - 헤얿 마이 메뉴

<br>

## 🔗 라이브
<a href="https://helpmymenu.site">https://helpmymenu.site</a>

<br>

## 📢 소개
여러분의 냉장고에 있는 재료들로 만들 수 있는 요리를 추천 받고, 훌륭한 레시피를 친구들과 공유해보세요.

![실행화면](https://user-images.githubusercontent.com/43202607/135443176-6dfae082-289a-4b4c-9ba8-b75cd0147e4c.gif)

<br>

## 🗓 개발기간
**[1차]** 2021년 09월 23일 ~ 2021년 09월 30일 (8일)

<br>

## 🧙 멤버구성
### Back-End

[:octocat:](https://github.com/hellonayeon) 권나연

[:octocat:](https://github.com/KKHoon210417) 김광훈 

[:octocat:](https://github.com/HWON0720) 안휘원 

[:octocat:](https://github.com/profoundsea25) 양해준

<br>

## 🛠 사용기술 &nbsp; [Wiki](https://github.com/hellonayeon/recipe-recommend-service/wiki/%EC%82%AC%EC%9A%A9-%EA%B8%B0%EC%88%A0-%EC%86%8C%EA%B0%9C)

<p align="center">
  <img src="https://img.shields.io/badge/Python-3766AB?style=flat-square&logo=Python&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-ffb13b?style=flat-square&logo=javascript&logoColor=white"/>
  <img src="https://img.shields.io/badge/HTML-E34F26?style=flat-square&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/mongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/PyCharm-000000?style=flat-square&logo=pycharm&logoColor=white"/>
  <img src="https://img.shields.io/badge/aws-333664?style=flat-square&logo=amazon-aws&logoColor=white"/>
</p>

### Front-End

`HTML` / `Javascript` / `CSS`

`Ajax`

### Back-End

`Python`: `flask` `pymongo` `requests`

`MongoDB`

### Data

`농림축산식품 공공데이터`

&nbsp;&nbsp;&nbsp; |__ `레시피 기본정보`: [🔗Link](https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000464&filter_ty=)

&nbsp;&nbsp;&nbsp; |__ `레시피 재료정보`: [🔗Link](https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000465&filter_ty=)

&nbsp;&nbsp;&nbsp; |__ `레시피 과정정보`: [🔗Link](https://data.mafra.go.kr/opendata/data/indexOpenDataDetail.do?data_id=20150827000000000466&filter_ty=)

<br>

## 💡 주요기능 &nbsp; [Wiki](https://github.com/hellonayeon/recipe-recommend-service/wiki/%EC%A3%BC%EC%9A%94-%EA%B8%B0%EB%8A%A5-%EC%86%8C%EA%B0%9C)

<details markdown="1">
<summary>레시피 추천</summary>

#### 재료 선택
     
What's in my 냉장고? 자신이 가지고 있는 재료를 입력할 수 있습니다.

*  입력한 재료 텍스트 자동완성
*  원하는 음식 분류 선택
*  난이도, 조리시간 선택

#### 레시피 검색
입력한 재료들로 만들 수 있는 레시피를 검색합니다.
   
* `농림축산식품 Open API` 응답 데이터를 DB에 저장
*  입력받은 재료와 옵션을 기반으로 레시피 검색

#### 레시피 리스트 보기

검색 내용을 바탕으로 레시피를 추천합니다.
   
* 썸네일
* 레시피에 대한 간단한 요약
* 정렬 기준: 좋아요, 난이도, 조리시간
  
#### ♥ 좋아요
   
관심있는 레시피는 좋아요를 통해 저장이 가능합니다.
  
* 레시피 리스트와 상세 페이지에서 좋아요 선택
* 좋아요 취소

</details>

<details markdown="1">
<summary>회원 관리</summary>

#### 회원가입 및 로그인

이메일 및 소셜앱을 통해 회원가입/로그인을 합니다.

* 마이페이지에서 개인 정보 수정 가능

### 즐겨찾기 목록

`♥ 좋아요`를 누른 레시피들을 확인할 수 있습니다.

### 등록한 레시피 목록

자신이 등록한 레시피 리스트를 확인가능합니다.
  
</details>


<br>

## 👾 문제해결 &nbsp; [Wiki](https://github.com/hellonayeon/recipe-recommend-service/wiki/%EB%AC%B8%EC%A0%9C-%ED%95%B4%EA%B2%B0-%EA%B3%BC%EC%A0%95)
 
