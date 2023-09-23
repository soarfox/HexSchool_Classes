import { checkAPIToken } from './getAPIToken.js';
import { getRandomNumber } from './randomNumber.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { getDate } from './getDate.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';

let resData = [];
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
// 將HTML上的class name寫在此處, 請記得加上前方的.號
const categoryNameInHTML = ['.recent-activity', '.hot-spots', '.delicious-meal', '.peaceful-living'];
let randomNumArray = [];
// 因為當前活動數量可能沒有很多, 故限定亂數取值的上限是30, 且只取出1個亂數值
let randomNumForActivity = getRandomNumber(30, 1);
// 每次從0~1000中隨機取得6個數字(假設為50,101,37,47,5,777), 並分別代入不同主題的API資料內, 成為各自要"skip的筆數", 然後再取其top 4筆/6筆資料, 藉此每次都能夠取得不同的資料(但這樣子取回的資location料幾乎視同一個縣市的資料, 但因為找景點也一定是找相同縣市的景點, 故符合實際出遊邏輯)
randomNumArray = getRandomNumber(1000, 6);
console.log('randomNumArray=', randomNumArray);

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('form');

  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const category = document.getElementById('category-selection').value;
    const keywords = document.getElementById('keywords').value;
    console.log(category);
    console.log(keywords);

    if(category === '請選擇您想搜尋的類別'){
      alert('您尚未選擇想要搜尋的類別哦！');
    }else {
    // 將選中的值作為參數傳遞到搜尋畫面, 使用encodeURIComponent()函式進行編碼, 將可對'&'及'/'等符號進行編碼, 避免搜尋畫面在解析網址時, 因為某些特殊符號而造成解析有問題(例如關鍵字為:天空&/), 則未使用該函式則只會解析出"天空", 但使用該函式後則可成功解析出"天空&/"
    const redirectURL = './searchResult.html?Category=' + category + '&Keywords=' + encodeURIComponent(keywords);

    // 跳轉到搜尋畫面
    window.location.href = redirectURL;
    }
  });

  // banner點擊測試
  const banner = document.querySelector('.swiper');
  banner.addEventListener('click', e => {
    e.preventDefault();
    console.log('您在banner區域點擊到的元素是:',e.target);
  });
});

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

// 將取回的景點資料逐一添加入創建的banner元素內
function renderDataToBanner() {
  const bannerAList = document.querySelectorAll('.swiper-slide a');

  // 把取回來的6筆景點資料逐一添加入創建的banner相關元素內
  resData.forEach((item, index) => {
    // 創建一個圖片元素, 把景點圖片添加進來
    const img = document.createElement('img');
    img.className = 'banner-img';
    img.width = 1110;
    img.height = 400;
    if(item.Picture.PictureDescription1 !== undefined && item.Picture.PictureDescription1 !== ''){
      img.alt = item.Picture.PictureDescription1;
    }else {
      img.alt = item[`${category[0]}Name`];
    }
    // 檢查圖片網址是否存在, 且網址是否以為http作為開頭
    img.src = checkPictureUrl(item, 'banner');
    // 將img元素添加到a元素身上
    bannerAList[index].appendChild(img);

    // 創建一個div容器, 裡面盛裝景點分類, 該筆資料ID, 縣市名稱及景點名稱資料
    const div = document.createElement('div');
    div.className = 'title';
    // // 將該筆資料的分類及獨一無二的資料ID設為圖片的屬性與值, 以利使用者點擊圖片後, 將相關資料透過網址參數傳遞到詳細資料畫面內, 並對應API搜尋並呈現資料
    div.setAttribute('data-category', category[0]);
    div.setAttribute('data-id', item[`${category[0]}ID`]);

    // 創建景點縣市的span元素
    const span = document.createElement('span');
    span.className = 'city-Name';
    // 檢查Address和Location有無包含縣市名稱(因有些資料就無包含Address和Location, 例如:烏來瀑布)
    span.textContent = getRegionOfAddress(item) + '　|　';
    div.appendChild(span);

    // 創建景點名稱的span元素
    const span2 = document.createElement('span');
    span2.className = 'scenicSpot-Name';
    span2.textContent = item[`${category[0]}Name`];
    div.appendChild(span2);
    // 將div元素添加到a元素身上
    bannerAList[index].appendChild(div);
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
  let urlStatement = `$select=${category[0]}ID,${category[0]}Name,City,Address,Picture&$filter=Picture/PictureUrl1 ne null ${keywordsExcludeStatement} &$top=6&$skip=${randomNumArray[0]}&$orderby=UpdateTime desc&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[0], urlStatement);
  console.log(resData);
  renderDataToBanner();

  // 撈出近期活動資料(加入隨機亂數(1~30), 且加入日期判定; 加入活動類獨有的Location屬性, 有助於解析出活動地點的行政區域名稱); 若是"近期活動"主題, 則活動結束日期必須大於今日日期(使用TDX提供的OData搜尋語法指令'gt'超過...)
  keywordsExcludeStatement = keywordsToExclude(category[1]);
  urlStatement = `$select=${category[1]}ID,${category[1]}Name,StartTime,EndTime,City,Address,Location,Picture&$filter=Picture/PictureUrl1 ne null and date(EndTime) gt ${today} ${keywordsExcludeStatement} &$orderby=startTime desc&$top=4&$skip=${randomNumForActivity}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[1], urlStatement);
  console.log(resData);
  renderDataToRecentActivity(categoryNameInHTML[0]);

  // 撈出景點資料
  keywordsExcludeStatement = keywordsToExclude(category[0]);
  urlStatement = `$select=${category[0]}ID,${category[0]}Name,City,Address,Picture&$filter=Picture/PictureUrl1 ne null ${keywordsExcludeStatement} &$top=4&$skip=${randomNumArray[1]}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[0], urlStatement);
  console.log(resData);
  renderData(category[0], categoryNameInHTML[1]);

  // 撈出餐廳資料
  urlStatement = `$select=${category[2]}ID,${category[2]}Name,City,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[2]}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[2], urlStatement);
  console.log(resData);
  renderData(category[2], categoryNameInHTML[2]);

  // 撈出旅館資料
  urlStatement = `$select=${category[3]}ID,${category[3]}Name,City,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[3]}&$format=JSON`;
  resData = await callCategoryDataAPI(getAPIToken, category[3], urlStatement);
  console.log(resData);
  renderData(category[3], categoryNameInHTML[3]);
}

getAPIData();