import { proxyOfURL } from './proxyOfURL.js';
import { checkAPIToken } from './getAPIToken.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { getDate } from './getDate.js';
import { checkCityInKeywords } from './checkCityInKeywords.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';

let resData = [];
// 透過使用屬性名稱來取得URL裡參數的值
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
const categoryContrast = {
  ScenicSpot: '探索景點',
  Activity: '近期活動',
  Restaurant: '品嚐美食',
  Hotel: '安心住宿'
};
let keywordsArr = [];

const today = getDate();
const selectedCategory = proxyOfURL.Category;
const cityName = proxyOfURL.City;
const className = proxyOfURL.Class;
const class1Name = proxyOfURL.Class1;
const class2Name = proxyOfURL.Class2;
const class3Name = proxyOfURL.Class3;
const keywords = proxyOfURL.Keywords;
let classNameObject = {};
classNameObject.Class = className;
classNameObject.Class1 = class1Name;
classNameObject.Class2 = class2Name;
classNameObject.Class3 = class3Name;

console.log('selectedCategory=', selectedCategory);
console.log('cityName999=', cityName);
console.log('keywords=', keywords);
console.log(classNameObject);

// 渲染麵包屑內容
function renderBreadcrumb() {
  // 取得<ul>元素內的span元素
  const breadcrumbSpan = document.querySelector('.breadcrumb span');
  // 更新麵包屑的內容
  Object.keys(categoryContrast).forEach(key => {
    if (key === selectedCategory) {
      breadcrumbSpan.textContent = categoryContrast[key];
    }
  });
}

async function getSearchResult() {
  const getAPIToken = await checkAPIToken();
  let urlStatement = '';
  let checkKeywordStatement = [];
  const keywordsExcludeStatement = keywordsToExclude(selectedCategory);

  if (keywords !== undefined && keywords !== '') {
    // 如果關鍵字是多個, 則依空格逐一進行切割, 得到多筆關鍵字詞
    if (keywords.includes(' ')) {
      keywordsArr = keywords.split(' ');
      // 檢查每一筆關鍵字是否有包含縣市的中文名稱
      keywordsArr.forEach(item => {
        checkKeywordStatement.push(checkCityInKeywords(item, selectedCategory));
      });
    }
    // 如果關鍵字只有一個
    else {
      if (keywords !== '') {
        // 找出該關鍵字中是否有包含縣市的中文名稱
        checkKeywordStatement.push(checkCityInKeywords(keywords, selectedCategory));
      } else {
        checkKeywordStatement.push(`contains(${selectedCategory}Name, '')`);
      }
    }
  } 
  // // 若是點擊詳細資料畫面上的badge標籤名稱, 則就會是無關鍵字的情況(keywords為undefined)
  // else {
  //   // 視使用者點到哪一個badge標籤(className/class1Name/class2Name/class3Name), 就為其加上該項的查詢條件; 例如當使用者在詳細資料畫面點擊到的是class2(其他)的badge標籤時, 則本頁class所取得的內容會是{Class: undefined, Class1: undefined, Class2: '其他', Class3: undefined}
  //   Object.keys(classNameObject).forEach(key => {
  //     if (classNameObject[key] !== undefined){
  //       checkKeywordStatement.push(`contains(${key}, '${classNameObject[key]}')`);
  //     }else {
  //       console.log(key,classNameObject[key]);
  //     }
  //   });
  // }

  //將網址列抓取到的縣市名稱一併納入搜尋條件內
  if(cityName !== undefined && cityName !== ''){
    checkKeywordStatement.push(`contains(City, '${cityName}')`);
  }

  //將網址列抓取到的Class名稱(Class/Class1/Class2/Class3)一併納入搜尋條件內
  Object.keys(classNameObject).forEach(key => {
    if (classNameObject[key] !== undefined && classNameObject[key] !== ''){
      checkKeywordStatement.push(`contains(${key}, '${classNameObject[key]}')`);
    }else {
      console.log(key,classNameObject[key]);
    }
  });

  // 若是"近期活動"主題, 則活動結束日期必須大於今日日期(使用TDX提供的OData搜尋語法指令'gt'超過...)
  if (selectedCategory === category[1]) {
    checkKeywordStatement.push(`date(EndTime) gt ${today}`);
  }

  // 將所有的查詢語句用and組合起來
  let combinedKeywordStatement = '';
  checkKeywordStatement.forEach((item, index) => {
    if (index + 1 < checkKeywordStatement.length) {
      combinedKeywordStatement += item + ' and ';
    } else {
      combinedKeywordStatement += item;
    }
  });

  // 若是"近期活動"主題, 則在select語句內多加入一個獨有欄位Location(因有些活動沒有Address, 但有Location)
  if (selectedCategory === category[1]) {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Location,Picture&$filter=${combinedKeywordStatement} ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
  } else {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Picture&$filter=${combinedKeywordStatement} ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
  }
  let res = await callCategoryDataAPI(getAPIToken, selectedCategory, urlStatement);
  return res;
}

function renderData() {
  // 取得<ul>元素的id
  const ulList = document.getElementById('searchResult-list');

  // 將每一筆取回的資料都走一遍, 且動態生成每個li元素
  resData.forEach(item => {

    let picUrl = '';
    let addressSlice = '';

    // 判斷該筆資料是否擁有相關屬性, 藉此取出該筆資料所屬的縣市並寫在麵包屑上
    if (item.hasOwnProperty('City') || item.hasOwnProperty('Address') || item.hasOwnProperty('Location')) {
      // 將該筆資料完整的倒入getRegionOfAddress()內, 解析其縣市名稱
      addressSlice = getRegionOfAddress(item);
    } else {
      addressSlice = '詳情如內';
    }

    // 檢查圖片網址是否存在, 且網址是否以為http作為開頭
    picUrl = checkPictureUrl(item, 'thumbnail');

    // 創建li標籤
    const li = document.createElement('li');
    li.className = 'card';

    // a標籤的部份
    const a = document.createElement('a');
    a.href = './detailContent.html';
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
    ulList.appendChild(li);
  });

  // 當前述執行完畢後, 為ul元素加上監聽事件
  addClickListenerToUl();
};

async function getResultAndRender() {
  renderBreadcrumb();
  resData = await getSearchResult();
  //在sql語句上有限制為top 17筆, 待瞭解分頁如何設計後可再修改
  console.log('這是searchResult頁面, 在sql語句上有限制為top 17筆, 待瞭解分頁如何設計後可再修改');
  document.getElementById('result-count').textContent = resData.length;
  if (resData.length !== 0) {
    renderData();
  } else {
    document.getElementById('searchResult-list').style.display = 'none';
    document.getElementById('result-null').style.display = 'block';
  }
}

function addClickListenerToUl() {

  // 因為在搜尋結果頁中可能一次會顯示相當多個搜尋結果, 故直接建立一個監聽事件(而不針對每一個搜尋結果都加上一個監聽事件), 如果被點擊的元素是圖片, 則產生後續行為
  document.getElementById('searchResult-list').addEventListener('click', e => {
    // e.target代表的是"觸發此click事件的HTML元素", 並判斷該元素是否為img, 如是, 進行組合網址參數並跳轉到詳細資料畫面(已實測此處IMG必需為大寫, 才能正確抓到網頁中的ul清單內的img元素, 若改成小寫img, 則會無法正確抓到所點擊的圖片元素資料而報錯)
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      const dataCategory = e.target.getAttribute('data-category');
      const dataId = e.target.getAttribute('data-id');

      // 將選中的值作為參數傳遞到詳細資料畫面, 使用encodeURIComponent()函式進行編碼, 將可對'&'及'/'等符號進行編碼, 避免詳細資料畫面在解析網址時, 因為某些特殊符號而造成解析有問題(例如關鍵字為:海港&/), 則未使用該函式則只會解析出"海港", 但使用該函式後則可成功解析出"海港&/"
      const redirectURL = './detailContent.html?Category=' + dataCategory + '&ID=' + encodeURIComponent(dataId);

      // 跳轉到詳細資料畫面
      window.location.href = redirectURL;
    }
  });
}

getResultAndRender();



