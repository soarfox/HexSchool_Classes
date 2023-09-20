import { checkAPIToken } from './getAPIToken.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';
import { proxyOfURL } from './proxyOfURL.js';

let resData = [];
// 透過使用屬性名稱來取得URL裡參數的值
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
let keywordsArr = [];
const cities = {
  基隆: '基隆市',
  臺北: '台北市, 臺北市',
  新北: '新北市',
  桃園: '桃園市',
  新竹: '新竹市',
  新竹縣: '新竹縣, 竹縣',
  苗栗: '苗栗縣',
  臺中: '台中市, 臺中市',
  彰化: '彰化縣',
  南投: '南投縣',
  雲林: '雲林縣',
  嘉義: '嘉義市',
  嘉義縣: '嘉義縣, 嘉縣',
  臺南: '台南市, 臺南市',
  高雄: '高雄市',
  屏東: '屏東縣',
  宜蘭: '宜蘭縣',
  花蓮: '花蓮縣',
  臺東: '台東縣, 臺東縣',
  澎湖: '澎湖縣',
  金門: '金門縣',
  連江: '連江縣'
}
const selectedCategory = proxyOfURL.category;
const keywords = proxyOfURL.keywords;
console.log('selectedCategory=', selectedCategory);
console.log('keywords=', keywords);

async function searchResult() {
  const getAPIToken = await checkAPIToken();
  // const today = getDate();
  let cityInKeyword = '';
  let urlStatement = '';
  let regionStatement = '';
  const keywordsExcludeStatement = keywordsToExclude(selectedCategory);

  // 如果關鍵字不只一個, 則將關鍵字字串依空格逐一切割, 可得到多筆關鍵字詞
  if (keywords.includes(' ')) {
    keywordsArr = keywords.split(' ');

    // 找出各筆關鍵字詞中, 是否有包含縣市名稱, 若有則返回正式的縣市名稱英文單字, 以利做為"各縣市API"搜尋使用
    keywordsArr.forEach(item => {
      cityInKeyword = Object.keys(cities).find(key => cities[key].includes(item));
      if (cityInKeyword) {

        // 若是"近期活動"主題, 則其基本上都有City屬性, 故搜尋近期活動時以City為主; 若非"近期活動類", 則以Address為主來搜尋
        if (selectedCategory === category[1]) {
          regionStatement = `contains(City, '${cityInKeyword}') and`;
        } else {
          regionStatement = `contains(Address, '${cityInKeyword}') and`;
        }

        // 抓出在關鍵字詞中, 該縣市名稱的index位置
        const indexToRemove = keywordsArr.indexOf(item);

        // 將縣市名稱從一串關鍵字當中移除掉, 避免影響搜尋結果
        if (indexToRemove !== -1) {
          keywordsArr.splice(indexToRemove, 1);
        }
      } else {
        console.log('Not found.');
      }
    });
  } else {
    cityInKeyword = Object.keys(cities).find(key => cities[key].includes(keywords));
    // 如果關鍵字只有一個, 但是在關鍵字內有抓出城市名稱(例如:屏東), 則cityInKeyword為屏東; 否則為undefined
    if(cityInKeyword !== undefined){
      // 若是"近期活動"主題, 則其基本上都有City屬性, 故搜尋近期活動時以City為主; 若非"近期活動類", 則以Address為主來搜尋
      if (selectedCategory === category[1]) {
        regionStatement = `contains(City, '${cityInKeyword}') and`;
      } else {
        regionStatement = `contains(Address, '${cityInKeyword}') and`;
      }
      // 因為關鍵字只有一個, 故在此將關鍵字陣列設為空字串, 以利下方組合查詢語句時可以直接帶入空字串(空字串將不影響查詢結果)
      keywordsArr = '';
    }else {
      // 因為關鍵字只有一個, 且在關鍵字內並無縣市名稱, 則直接將keywords賦予給keywordsArr, 以利下方組合查詢語句時可以直接帶入使用
      keywordsArr = keywords;
    }
  }

  // 組合出查詢語句, "近期活動"主題才有City(或Location)這些屬性(且所填寫的資料較為正確), 而景點主題並無該些屬性, 故需要分開進行判斷
  if (selectedCategory === category[1]) {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Location,Picture&$filter=${regionStatement} contains(${selectedCategory}Name, '${keywordsArr}') ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
  } else {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,Picture&$filter=${regionStatement} contains(${selectedCategory}Name, '${keywordsArr}') ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
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

    // 判斷該筆資料是否擁有Address屬性或Location屬性(近期活動類通常有這個屬性), 藉此取出該筆資料所屬的縣市並寫在麵包屑上
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
  console.log('這是searchResult頁面, 在sql語句上有限制為top 17筆, 待瞭解分頁如何設計後可再修改');
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

      // 將選中的值作為參數傳遞到詳細資料畫面, 使用encodeURIComponent()函式進行編碼, 將可對'&'及'/'等符號進行編碼, 避免詳細資料畫面在解析網址時, 因為某些特殊符號而造成解析有問題(例如關鍵字為:海港&/), 則未使用該函式則只會解析出"海港", 但使用該函式後則可成功解析出"海港&/"
      const redirectURL = './detailContent.html?category=' + dataCategory + '&id=' + encodeURIComponent(dataId);

      // 跳轉到詳細資料畫面
      window.location.href = redirectURL;
    }
  });
}

getResultAndRender();



