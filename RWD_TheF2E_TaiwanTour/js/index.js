import { checkAPIToken } from './getAPIToken.js';
import { getRandomNumber } from './randomNumber.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { getDate } from './getDate.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.querySelector('form');

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const category = document.getElementById('category-selection').value;
    const keywords = document.getElementById('keywords').value;
    console.log(category);
    console.log(keywords);

    // 將選中的值作為參數傳遞到搜尋畫面, 使用encodeURIComponent()函式進行編碼, 將可對'&'及'/'等符號進行編碼, 避免搜尋畫面在解析網址時, 因為某些特殊符號而造成解析有問題(例如關鍵字為:天空&/), 則未使用該函式則只會解析出"天空", 但使用該函式後則可成功解析出"天空&/"
    const redirectURL = './searchResult.html?category=' + category + '&keywords=' + encodeURIComponent(keywords);

    // 跳轉到搜尋畫面
    window.location.href = redirectURL;
  })
});

let resData = [];
let category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
// 將HTML上的class name寫在此處, 請記得加上前方的.號
let categoryNameInHTML = ['.swiper-slide', '.recent-activity', '.hot-spots', '.delicious-meal', '.peaceful-living'];
let randomNumArray = [];

// 引用套件--Swiper圖片輪播
const swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  centeredSlides: true,
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".left-narrow",
    nextEl: ".right-narrow",
  },
});

// 渲染banner資料到網頁上
function renderDataToBanner(categoryNameInHTML) {
  const list = document.querySelectorAll(`${categoryNameInHTML}`);

  // 把取回來的資料渲染到元素中
  resData.forEach((item, index) => {
    const bannerElement = list[index];
    let addressSlice = '';
    let picUrl = '';

    // 檢查Address和Location有無包含縣市名稱(因有些資料就無包含Address和Location, 例如:烏來瀑布)
    addressSlice = getRegionOfAddress(item);
    // 檢查圖片網址是否存在, 且網址是否以為http作為開頭
    picUrl = checkPictureUrl(item, 'banner');

    const cityElement = bannerElement.querySelector('.city-Name');
    const scenicSpotElement = bannerElement.querySelector('.scenicSpot-Name');
    const imgElement = bannerElement.querySelector('.banner-img');
    cityElement.textContent = addressSlice;
    scenicSpotElement.textContent = item.ScenicSpotName;
    imgElement.src = picUrl;
  });
};

// 渲染近期活動資料到網頁上
function renderDataToRecentActivity(categoryNameInHTML) {
  const list = document.querySelectorAll(`${categoryNameInHTML} .card`);

  // 把取回來的資料渲染到元素中
  resData.forEach((item, index) => {
    const cardElement = list[index];
    let addressSlice = '';
    let picUrl = '';

    // 檢查Address和Location有無包含縣市名稱(因有些資料就無包含Address和Location, 例如:烏來瀑布)
    addressSlice = getRegionOfAddress(item);

    // 檢查圖片網址是否存在, 且網址是否以為http作為開頭
    picUrl = checkPictureUrl(item, 'thumbnail');

    const imgElement = cardElement.querySelector('img');
    const startTimeElement = cardElement.querySelector('.startDate');
    const endTimeElement = cardElement.querySelector('.endDate');
    const titleElement = cardElement.querySelector('.title');
    const locationElement = cardElement.querySelector('.location .location-name');

    startTimeElement.textContent = item.StartTime.slice(0, 10);
    endTimeElement.textContent = item.EndTime.slice(0, 10);
    titleElement.textContent = item.ActivityName;
    locationElement.textContent = addressSlice;
    imgElement.src = picUrl;
  });
};

// 渲染景點/餐廳/旅宿資料到網頁上
function renderData(category, categoryNameInHTML) {
  const list = document.querySelectorAll(`${categoryNameInHTML} .card`);

  // 把取回來的資料渲染到元素中
  resData.forEach((item, index) => {
    const cardElement = list[index];
    let addressSlice = '';
    let picUrl = '';

    // 檢查Address和Location有無包含縣市名稱(因有些資料就無包含Address和Location, 例如:烏來瀑布)
    addressSlice = getRegionOfAddress(item);

    // 檢查圖片網址是否存在, 且網址是否以為http作為開頭
    picUrl = checkPictureUrl(item, 'thumbnail');

    const nameElement = cardElement.querySelector('.name');
    const locationElement = cardElement.querySelector('.location .location-name');
    const imgElement = cardElement.querySelector('img');

    // 用變數方式動態換上各個主題裡的屬性名稱(ScenicSpotName/RestaurantName等)
    const categoryName = `${category}Name`;
    nameElement.textContent = item[categoryName];
    locationElement.textContent = addressSlice;
    imgElement.src = picUrl;
  });
};

// 確認API token並且回傳各主題(觀光景點/餐廳/近期活動/住宿)API資料出去
async function getAPIData() {
  const getAPIToken = await checkAPIToken();
  const today = getDate();

  // 為了讓首頁各個項目撈出來的資料都必定有圖片, 故使用TDX API說明手冊的邏輯運算子語法($filter=Picture/PictureUrl1 ne null), 也就是在Picture屬性裡的PictureUrl1屬性內的值 不等於 null), 有符合者才會被撈出來, 藉此過濾掉無圖片的資料; 但若是切換到各縣市/各主題分頁, 則可以允許無圖片的項目出現, 避免有些縣市(如:屏東縣)因為該縣政府API完全沒提供景點圖片而沒有任何資料被撈回來

  // 撈出首頁banner景點標題與圖片網址(UpdateTime代表TDX平台更新資料的時間)
  let keywordsExcludeStatement = keywordsToExclude(category[0]);
  let urlStatement = `$select=${category[0]}ID,${category[0]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null ${keywordsExcludeStatement} &$top=6&$skip=${randomNumArray[0]}&$orderby=UpdateTime desc&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[0], urlStatement);
  console.log(resData);
  renderDataToBanner(categoryNameInHTML[0]);

  // 撈出近期活動資料(加入隨機亂數(1~30), 且加入日期判定; 除了Address之外, 亦加入Location, 有助於解析出活動地點的行政區域名稱)
  keywordsExcludeStatement = keywordsToExclude(category[1]);
  urlStatement = `$select=${category[1]}ID,${category[1]}Name,StartTime,EndTime,Address,Location,Picture&$filter=Picture/PictureUrl1 ne null and date(EndTime) ge ${today} ${keywordsExcludeStatement} &$orderby=startTime desc&$top=4&$skip=${randomNumForActivity}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[1], urlStatement);
  console.log(resData);
  renderDataToRecentActivity(categoryNameInHTML[1]);

  // 撈出景點資料
  keywordsExcludeStatement = keywordsToExclude(category[0]);
  urlStatement = `$select=${category[0]}ID,${category[0]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null ${keywordsExcludeStatement} &$top=4&$skip=${randomNumArray[1]}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[0], urlStatement);
  console.log(resData);
  renderData(category[0], categoryNameInHTML[2]);

  // 撈出餐廳資料
  urlStatement = `$select=${category[2]}ID,${category[2]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[2]}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[2], urlStatement);
  console.log(resData);
  renderData(category[2], categoryNameInHTML[3]);

  // 撈出旅館資料
  urlStatement = `$select=${category[3]}ID,${category[3]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[3]}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[3], urlStatement);
  console.log(resData);
  renderData(category[3], categoryNameInHTML[4]);
}

// 每次從0~1000中隨機取得6個數字(假設為50,101,37,47,5,777), 並分別代入不同主題的API資料內, 成為各自要"skip的筆數", 然後再取其top 4筆/6筆資料, 藉此每次都能夠取得不同的資料(但這樣子取回的資料幾乎視同一個縣市的資料, 但因為找景點也一定是找相同縣市的景點, 故符合實際出遊邏輯)
let randomNumForActivity = getRandomNumber(30, 1);
randomNumArray = getRandomNumber(1000, 6);
console.log('randomNumArray=', randomNumArray);

// getAPIData();




