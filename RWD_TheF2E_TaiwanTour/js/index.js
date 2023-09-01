import { checkAPIToken } from './getAPIToken.js';

let resData = [];
let resData2 = [];
let category = ['ScenicSpot', 'Restaurant'];
// 將HTML上的class name寫在此處, 請記得加上前方的.號
let categoryNameInHTML = ['.hot-spots', '.delicious-meal'];

// 取得各主題API資料
async function callAllCategoriesAPI(api_token, category) {

  if (api_token != undefined) {
    // const url = 'https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$filter=contains(ScenicSpotName, \'海\')&$top=4&$format=JSON';
    const url = `https://tdx.transportdata.tw/api/basic/v2/Tourism/${category}?$top=4&$format=JSON`;

    try {
      // 
      const response = await axios.get(url, {
        headers: {
          "authorization": "Bearer " + api_token
        }
      });
      console.log('getAPIData成功取得回應');
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

// 渲染各主題資料到網頁上
function renderData(category, categoryNameInHTML) {
  console.log('render裡的category=',category);
  console.log('render裡的class name=',categoryNameInHTML);
  // const mealList = document.querySelectorAll('.hot-spots .card');
  const mealList = document.querySelectorAll(`${categoryNameInHTML} .card`);

  // 把取回來的資料渲染到元素中
  resData.forEach((data, index)=> {
    const cardElement = mealList[index];
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

    let categoryName = (`${category}Name`);
    console.log(categoryName);
  
    // 原版_取得景點名稱, 但現在用變數方式動態換上各個主題裡的屬性名稱(ScenicSpotName/RestaurantName等)
    // nameElement.textContent = data.ScenicSpotName;
    nameElement.textContent = data[categoryName];
    locationElement.textContent = data.Address.slice(0, 3);
    imgElement.src = picUrl;
  });
};

// 確認API token並且回傳各主題(觀光景點/餐廳/近期活動/住宿)API資料出去
async function getAPIDataOfScenicSpotData () {
  const getAPIToken = await checkAPIToken();


  // 在此已將"觀光景點"及"餐廳"的卡片資訊處理完成, 近期活動與住宿待處理
  resData = await callAllCategoriesAPI(getAPIToken, category[0]);
  // console.log('準備將資料渲染到網頁上');
  renderData(category[0], categoryNameInHTML[0]);
  // console.log('已渲染0到網頁上!');

  resData = await callAllCategoriesAPI(getAPIToken, category[1]);
  // console.log('準備將資料渲染到網頁上');
  renderData(category[1], categoryNameInHTML[1]);
  // console.log('已渲染1到網頁上!');
}

getAPIDataOfScenicSpotData();