import { checkAPIToken } from './getAPIToken.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';
import { proxyOfURL } from './proxyOfURL.js';

let resData = [];

// 透過使用屬性名稱來取得URL裡參數的值
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
const selectedCategory = proxyOfURL.category;
const keywords = proxyOfURL.keywords;
console.log('selectedCategory=', selectedCategory);
console.log('keywords=', keywords);

async function searchResult() {
  const getAPIToken = await checkAPIToken();
  // const today = getDate();

  const keywordsExcludeStatement = keywordsToExclude(selectedCategory);
  let urlStatement = '';
  
  // 組合出查詢語句, 節慶活動主題才有"City或Location"這兩個屬性, 景點主題並無該些屬性, 故需要分開判斷
  if (selectedCategory === category[1]){
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Location,Picture&$filter=contains(${selectedCategory}Name, '${keywords}') ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
  }else {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,Picture&$filter=contains(${selectedCategory}Name, '${keywords}') ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
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

    // 判斷該筆資料是否擁有Address屬性或Location屬性(節慶活動類通常有這個屬性), 藉此取出該筆資料所屬的縣市並寫在麵包屑上
    if (item.hasOwnProperty('Address') || item.hasOwnProperty('Location') || item.hasOwnProperty('City')) {
      // 將該筆資料完整的倒入getRegionOfAddress()內, 解析其縣市名稱
      addressSlice = getRegionOfAddress(item);
    } else {
      addressSlice = '詳情如內';
    }


    // 檢查Address和Location有無包含縣市名稱(因有些資料就無包含Address和Location, 例如:烏來瀑布)
    // addressSlice = getRegionOfAddress(item);

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
  addClickListenersToLinks();
};

async function getResultAndRender() {
  resData = await searchResult();
  //在sql語句上有限制為top 17筆, 待瞭解分頁如何設計後可再修改
  console.log('這是searchResult頁面, 在sql語句上有限制為top 17筆, 待瞭解分頁如何設計後可再修改', resData);
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
      console.log('dataCategory=', dataCategory);
      console.log('dataId=', dataId);

      // 將選中的值作為參數傳遞到詳細資料畫面, 使用encodeURIComponent()函式進行編碼, 將可對'&'及'/'等符號進行編碼, 避免詳細資料畫面在解析網址時, 因為某些特殊符號而造成解析有問題(例如關鍵字為:海港&/), 則未使用該函式則只會解析出"海港", 但使用該函式後則可成功解析出"海港&/"
      const redirectURL = './detailContent.html?category=' + dataCategory + '&id=' + encodeURIComponent(dataId);

      // 跳轉到詳細資料畫面
      window.location.href = redirectURL;
    }
  });
}

getResultAndRender();



