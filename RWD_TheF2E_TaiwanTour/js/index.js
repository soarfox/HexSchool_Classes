import { checkAPIToken } from './getAPIToken.js';
import { getRandomNumber } from './randomNumber.js';

let resData = [];
let category = ['Activity', 'ScenicSpot', 'Restaurant', 'Hotel'];
// 將HTML上的class name寫在此處, 請記得加上前方的.號
let categoryNameInHTML = ['.swiper-slide','.recent-activity', '.hot-spots', '.delicious-meal', '.peaceful-living'];
let randomNumArray = [];

// 取得指定主題的n項欄位內容
async function callAllCategoriesAPI(api_token, category, urlStatement) {

  if (api_token != undefined) {
    // 加入關鍵字搜尋的語句
    // const url = 'https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$filter=contains(ScenicSpotName, \'海\')&$top=4&$format=JSON';

    // 最廣泛適用, 但會把所有資料撈回來, 資料量較大 
    // const url = `https://tdx.transportdata.tw/api/basic/v2/Tourism/${category}?$top=4&$format=JSON`;

    // 過濾掉無圖片的資料(完整查詢語句)
    // https://tdx.transportdata.tw/api/basic/v2/Tourism/Activity?$select=ActivityName,StartTime,EndTime,Address,Picture&$filter=Picture/PictureUrl1 ne null&$orderby=UpdateTime desc&$top=4&$format=JSON
    const url = `https://tdx.transportdata.tw/api/basic/v2/Tourism/${category}?${urlStatement}`;

    try {
      // 
      const response = await axios.get(url, {
        headers: {
          "authorization": "Bearer " + api_token
        }
      });
      const tk2 = response.data;

      return tk2;
    } catch (error) {
      console.error('getAPIData axios失敗:', error);
    }
  }
  else {
    console.log('您的api token為:undefined');
  }
};

// 渲染banner資料到網頁上
function renderDataToBanner(categoryNameInHTML) {
  const list = document.querySelectorAll(`${categoryNameInHTML}`);

  // 把取回來的資料渲染到元素中
  resData.forEach((data, index)=> {
    const bannerElement = list[index];
    let picUrl = '';
    let addressSlice = '';
    
    //API回傳的某些資料內可能無提供圖片, 故需要在無圖片時為其加上預設圖片 
    try {
      if (Object.keys(data.Picture).length !== 0){
        picUrl = data.Picture.PictureUrl1;
      }else {
        picUrl = './images/index/none_pic.png';
      }

    //API回傳的某些資料內可能無地址, 故需要在無地址時加上註記文字 
      if(data.hasOwnProperty('Address') !== false) {
        addressSlice = data.Address.slice(0, 3);
      }else {
        addressSlice = '未提供地址';
      }
    }
    catch(error) {
      console.log('Error:',error);
    }
    const cityElement = bannerElement.querySelector('.city-Name');
    const scenicSpotElement = bannerElement.querySelector('.scenicSpot-Name');
    const imgElement = bannerElement.querySelector('.banner-img');
    cityElement.textContent = addressSlice;
    scenicSpotElement.textContent = data.ScenicSpotName;
    imgElement.src = picUrl;
  });
};

// 渲染近期活動資料到網頁上
function renderDataToRecentActivity(categoryNameInHTML) {
  const list = document.querySelectorAll(`${categoryNameInHTML} .card`);

  // 把取回來的資料渲染到元素中
  resData.forEach((data, index)=> {
    const cardElement = list[index];
    let picUrl = '';
    let addressSlice = '';
    
    //API回傳的某些資料內可能無提供圖片, 故需要在無圖片時為其加上預設圖片 
    try {
      if (Object.keys(data.Picture).length !== 0){
        picUrl = data.Picture.PictureUrl1;
      }else {
        picUrl = './images/index/none_pic.png';
      }

    //API回傳的某些資料內可能無地址, 故需要在無地址時加上註記文字 
      if(data.hasOwnProperty('Address') !== false) {
        addressSlice = data.Address.slice(0, 3);
      }else {
        addressSlice = '未提供地址';
      }
    }
    catch(error) {
      console.log('Error:',error);
    }
    const imgElement = cardElement.querySelector('img');
    const startTimeElement = cardElement.querySelector('.startDate');
    const endTimeElement = cardElement.querySelector('.endDate');
    const titleElement = cardElement.querySelector('.title');
    const locationElement = cardElement.querySelector('.location .location-name');
  
    startTimeElement.textContent = data.StartTime.slice(0, 10);
    endTimeElement.textContent = data.EndTime.slice(0, 10);
    titleElement.textContent = data.ActivityName;
    locationElement.textContent = addressSlice;
    imgElement.src = picUrl;
  });
};

// 渲染景點/餐廳/旅宿資料到網頁上
function renderData(category, categoryNameInHTML) {
  const list = document.querySelectorAll(`${categoryNameInHTML} .card`);

  // 把取回來的資料渲染到元素中
  resData.forEach((data, index)=> {
    const cardElement = list[index];
    let picUrl = '';
    
    //因為API裡有些資料並無提供圖片, 故需要自行判斷有無值, 並且在無圖片時需為其加上預設圖片 
    try {
      if (Object.keys(data.Picture).length === 0){
        picUrl = './images/index/none_pic.png';
      }else {
        picUrl = data.Picture.PictureUrl1;
      }
      // console.log('picUrl=',picUrl);
    }
    catch(error) {
      console.log('Error:',error);
    }
    const nameElement = cardElement.querySelector('.name');
    const locationElement = cardElement.querySelector('.location .location-name');
    const imgElement = cardElement.querySelector('img');

    // 用變數方式動態換上各個主題裡的屬性名稱(ScenicSpotName/RestaurantName等)
    const categoryName = `${category}Name`;
    nameElement.textContent = data[categoryName];
    locationElement.textContent = data.Address.slice(0, 3);
    imgElement.src = picUrl;
  });
};

// 確認API token並且回傳各主題(觀光景點/餐廳/近期活動/住宿)API資料出去
async function getAPIData () {
  const getAPIToken = await checkAPIToken();

  // 撈出首頁banner景點標題與圖片網址(UpdateTime代表TDX平台更新資料的時間)
  let urlStatement = `$select=${category[1]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=6&$skip=${randomNumArray[0]}&$orderby=UpdateTime desc&$format=JSON`;
  resData = await callAllCategoriesAPI(getAPIToken, category[1], urlStatement);
  renderDataToBanner(categoryNameInHTML[0]);

  // 撈出近期活動資料(固定選擇top4, 不加入隨機亂數)
  urlStatement = `$select=${category[0]}Name,StartTime,EndTime,Address,Picture&$filter=Picture/PictureUrl1 ne null&$orderby=startTime desc&$top=4&$format=JSON`;
  resData = await callAllCategoriesAPI(getAPIToken ,category[0], urlStatement);
  renderDataToRecentActivity(categoryNameInHTML[1]);

  // 使用TDX API說明手冊的邏輯運算子語法($filter=Picture/PictureUrl1 ne null), 也就是在Picture屬性裡的PictureUrl1屬性內的值 不等於 null), 有符合者才會被撈出來, 藉此過濾掉無圖片的資料, 讓首頁內各項目一定都是有圖片的狀態, 但如果是切換到各縣市/各主題分頁則可以允許無圖片的地點出現
  // 撈出景點資料
  urlStatement = `$select=${category[1]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[1]}&$format=JSON`;
  resData = await callAllCategoriesAPI(getAPIToken, category[1], urlStatement);
  renderData(category[1], categoryNameInHTML[2]);

  // 撈出餐廳資料
  urlStatement = `$select=${category[2]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[2]}&$format=JSON`;
  resData = await callAllCategoriesAPI(getAPIToken, category[2], urlStatement);
  renderData(category[2], categoryNameInHTML[3]);

  // 撈出旅館資料
  urlStatement = `$select=${category[3]}Name,Address,Picture&$filter=Picture/PictureUrl1 ne null&$top=4&$skip=${randomNumArray[3]}&$format=JSON`;
  resData = await callAllCategoriesAPI(getAPIToken, category[3], urlStatement);
  renderData(category[3], categoryNameInHTML[4]);
}

// 每次從0~1000中隨機取得6個數字(假設為50,101,37,47,5,777), 並分別代入不同主題的API資料內, 成為各自要"skip的筆數", 然後再取其top 4筆/6筆資料, 藉此每次都能夠取得不同的資料(但這樣子取回的資料幾乎視同一個縣市的資料, 但因為找景點也一定是找相同縣市的景點, 故符合實際出遊邏輯)
randomNumArray = getRandomNumber(6);
console.log(randomNumArray);
getAPIData();

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