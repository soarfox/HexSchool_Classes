import { checkAPIToken } from './getAPIToken.js';
import { keywordsToExclude } from './keywordsToExclude.js';
// import { getDate } from './getDate.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';

let resData = [];
// 將HTML上的class name寫在此處, 請記得加上前方的.號
// let categoryNameInHTML = ['.recent-activity'];
const queryString = window.location.search;
// console.log('queryString=',queryString);
const searchParams = new URLSearchParams(queryString);
// console.log('searchParams=',searchParams);

const handler = {
  // 攔截對物件屬性的讀取操作
  get: function (obj, prop) {
    if (obj.has(prop)) {
      console.log(`訪問的屬性名稱為:${prop}`);
      // console.log(`值為:`,obj.get(prop));
      return obj.get(prop);
    } else {
      console.log(`屬性名稱:${prop}並不存在`);
      // 返回 undefined 表示屬性不存在
      return undefined;
    }
  },
};

// 建立一個代理對象(proxy), 藉此成為代理者並進行處理
const proxy = new Proxy(searchParams, handler);

// 透過使用屬性名稱來取得參數的值
const selectedCategory = proxy.category;
const keywords = proxy.keywords;
console.log('selectedCategory=', selectedCategory);
console.log('keywords=', keywords);

async function searchResult() {
  const getAPIToken = await checkAPIToken();
  // const today = getDate();

  // 撈出景點資料
  const keywordsExcludeStatement = keywordsToExclude(selectedCategory);
  let urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,Picture&$filter=contains(${selectedCategory}Name, '${keywords}') ${keywordsExcludeStatement} &$top=20&$orderby=UpdateTime desc&$format=JSON`;

  let res = await callCategoryDataAPI(getAPIToken, selectedCategory, urlStatement);
  return res;
}

function renderData() {
  // 取得<ul>元素的id
  const dataList = document.getElementById('searchResult-list');

  // 將每一筆取回的資料都走一遍, 且動態生成每個li元素
  resData.forEach(item => {

    let picUrl = '';
    let addressSlice = '';

    try {
      //API回傳的某些資料內可能無地址, 故需要在無地址時加上註記文字 
      if (item.hasOwnProperty('Address') !== false) {
        addressSlice = item.Address.slice(0, 3);
      } else {
        addressSlice = '未提供縣市名稱';
      }

      //API回傳的某些資料內可能無提供圖片, 故需要在無圖片時為其加上預設圖片 
      if (Object.keys(item.Picture).length !== 0) {
        picUrl = item.Picture.PictureUrl1;
      } else {
        picUrl = './images/sharedImages/none_picture.png';
      }
    }
    catch (error) {
      console.log('判斷有無地址或有無圖片時出現錯誤:', error);
    }

    // 創建li標籤
    const li = document.createElement('li');
    li.className = 'card';

    // a標籤的部份
    const a = document.createElement('a');
    a.href = '#';
    a.setAttribute('aria-label', '查看這一筆資料的詳細內容');

    // div標籤 photo的部份
    const divPhoto = document.createElement('div');
    divPhoto.className = 'photo';

    // img標籤的部份
    const img = document.createElement('img');
    img.src = picUrl;
    img.width = 255;
    img.height = 200;
    img.alt = item.Picture.PictureDescription1;

    // 將img標籤加入div內
    divPhoto.appendChild(img);
    a.appendChild(divPhoto);

    // 資料標題的部份
    const spanName = document.createElement('span');
    spanName.className = 'name';
    spanName.textContent = item[`${selectedCategory}Name`];

    // div標籤 location的部份
    const divLocation = document.createElement('div');
    const iLocation = document.createElement('i');
    iLocation.className = 'fa-solid fa-location-dot location-icon';
    iLocation.textContent = addressSlice;
    // 將i標籤加入div內
    divLocation.appendChild(iLocation);

    li.appendChild(a);
    li.appendChild(spanName);
    li.appendChild(divLocation);

    // 將li添加到ul內
    dataList.appendChild(li);
  });
};

async function getResultAndRender() {
  resData = await searchResult();
  console.log(resData);
  //在sql語句上有限制為top 20筆, 待瞭解分頁如何設計後可再修改 
  document.getElementById('result-count').textContent = resData.length;
  renderData();
}

getResultAndRender();
