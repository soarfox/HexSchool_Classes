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
    a.href = './categoryContent.html';
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
    // 將該筆資料的分類及獨一無二的資料ID設為圖片的屬性與值, 以利使用者點擊圖片後, 將相關資料透過網址參數傳遞到詳細資料畫面內, 並對應API搜尋並呈現資料
    img.setAttribute('data-category', `${selectedCategory}`);
    img.setAttribute('data-id', item[`${selectedCategory}ID`]);

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

  // 當前述執行完畢後, 為ul元素加上監聽事件
  addClickListenersToLinks();
};

async function getResultAndRender() {
  resData = await searchResult();
  console.log(resData);
  //在sql語句上有限制為top 20筆, 待瞭解分頁如何設計後可再修改
  document.getElementById('result-count').textContent = resData.length;
  if (resData.length !== 0) {
    renderData();
  } else {
    document.getElementById('searchResult-list').style.display = 'none';
    document.getElementById('result-null').style.display = 'block';
  }
}

function addClickListenersToLinks() {
  document.addEventListener('click', function (e) {
    const clickedElement = e.target;

    // 判斷點擊到的元素是否為img, 如是則進行組合網址參數並跳轉到詳細資料畫面; 此處IMG需為大寫, 才能正確抓到網頁中的ul清單內的img元素
    if (clickedElement.tagName === 'IMG') {
      e.preventDefault();
      const dataCategory = clickedElement.getAttribute('data-category');
      const dataId = clickedElement.getAttribute('data-id');
      console.log('dataCategory=',dataCategory);
      console.log('dataId=',dataId);

      // 將選中的值作為參數傳遞到詳細資料畫面, 使用encodeURIComponent()函式進行編碼, 將可對'&'及'/'等符號進行編碼, 避免詳細資料畫面在解析網址時, 因為某些特殊符號而造成解析有問題(例如關鍵字為:海港&/), 則未使用該函式則只會解析出"海港", 但使用該函式後則可成功解析出"海港&/"
      const redirectURL = './categoryContent.html?category=' + dataCategory + '&id=' + encodeURIComponent(dataId);

      // 跳轉到詳細資料畫面
      window.location.href = redirectURL;
    }
  });
}

getResultAndRender();



