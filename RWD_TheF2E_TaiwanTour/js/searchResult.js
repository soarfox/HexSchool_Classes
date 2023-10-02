import { loadingAnimation } from './loadingAnimation.js';
import { proxyOfURL } from './proxyOfURL.js';
import { checkAPIToken } from './getAPIToken.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { getDate } from './getDate.js';
import { checkCityInKeywords } from './checkCityInKeywords.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';
import { pagination } from './pagination.js';
import { setupSearchForm } from './setupImageClickAndSearchForm.js';

const selectedCategory = proxyOfURL.Category;
const selectedDate = proxyOfURL.SelectedDate;
const className = proxyOfURL.Class;
const class1Name = proxyOfURL.Class1;
const class2Name = proxyOfURL.Class2;
const class3Name = proxyOfURL.Class3;
const keywords = proxyOfURL.Keywords;
const page = proxyOfURL.Page;
const pageUrl = window.location.href;
const today = getDate();

// 如果使用者在縣市的下拉式選單選擇為"全部縣市", 則為了要讓查詢語句的cityName為空字串, 故需要設定cityName的值為空字串, 故在此使用let關鍵字宣告
let cityName = proxyOfURL.City;
let resData = [];
let keywordsArr = [];
let classNameObject = {};
classNameObject.Class = className;
classNameObject.Class1 = class1Name;
classNameObject.Class2 = class2Name;
classNameObject.Class3 = class3Name;
console.log('selectedCategory=', selectedCategory);
console.log('cityName=', cityName);
console.log('selectedDate=', selectedDate);
console.log(classNameObject);
console.log('keywords=', keywords);
console.log('page=', page);

const paginationList = document.querySelector('.pagination-list');
const searchResultList = document.getElementById('searchResult-list');

// 透過使用屬性名稱來取得URL裡參數的值
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
const categoryContrast = {
  ScenicSpot: '探索景點',
  Activity: '近期活動',
  Restaurant: '品嚐美食',
  Hotel: '安心住宿'
};

// 此處執行進入本頁面時要執行的functions且處理對應的分頁內容
document.addEventListener('DOMContentLoaded', () => {
  allFuncs();

  // 假如使用者是按下首頁的搜尋按鈕後進來此搜尋結果頁, 則網址本身預設是不會包含&Page=參數(故proxy取回的page值為undefined), 在此主動在網址末端補上'&Page=1'且立刻修改當前網址, 並將此網址資訊儲存在瀏覽器的記錄內, 以利稍後使用者如果按下瀏覽器的回上一頁時, 可以立刻在網址上呈現&Page=1並渲染出對應資料在畫面上
  if (pageUrl.indexOf('&Page=') === -1) {
    console.log('---第一次進來此搜尋結果頁, 將自動補上網址&Page=並記錄下來----');
    //當第一次進入搜尋結果頁時, 自動幫網址補上尾字'&Page=1', 並需要紀錄該頁的網址等項目
    const state = { page: 'firstPage' };
    const title = null;
    const url = window.location.href + '&Page=1';
    // 將相關資訊記錄在瀏覽器的歷史記錄內
    history.pushState(state, title, url);
  }

  // 分頁元件的監聽事件
  paginationList.addEventListener('click', e => {
    console.log('---已點擊任一分頁按鈕, 此處負責處理----');
    e.preventDefault();
    const previousPage = document.getElementById('previousPage');
    const nextPage = document.getElementById('nextPage');
    const finalPage = document.getElementById('finalPage');

    // 假如點擊到的網頁元素是分頁區塊的前一頁按鈕且前一頁的值不為null
    if ((e.target.id === 'previousButton' && previousPage !== null) || (e.target.id === 'previousPage')) {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });
      
      removeChildNodes();

      // 將字串轉成10進位數字
      const intPreviousNumber = parseInt(previousPage.textContent, 10);
      // 把新的頁碼傳給渲染資料函式, 藉此切割出所需的資料並渲染在畫面上
      renderData({ pageNumber: intPreviousNumber })
      // 使用解構賦值方式, 只傳入一個參數{}(物件), 且在pagination.js檔案內有分別給予預設值 
      pagination({ dataCount: resData.length, currentPage: intPreviousNumber });

      const currentURL = window.location.href;
      // 修改網址內容
      if (intPreviousNumber !== null) {
        // 修改 URL並新增新的歷史記錄項目
        const newState = { page: 'previousPage' };
        const newTitle = null;
        let newURL = '';
        if (currentURL.indexOf('&Page=')) {
          const splitUrl = currentURL.split('&Page=');
          newURL = splitUrl[0] + `&Page=${intPreviousNumber}`;
        }
        // 此時瀏覽器的URL已經變更成新的網址, 且可以在歷史記錄中找到該狀態和標題
        history.pushState(newState, newTitle, newURL);
      }
      
    } else if ((e.target.id === 'nextButton' && (nextPage !== null || finalPage !== null)) || (e.target.id === 'nextPage')) {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });

      removeChildNodes();

      let intNextNumber = 0;
      // 如果nextPage數字不存在, 則代表下一個分頁頁碼就是finalPage了, 故此時nextPage不會被產生出來, 只會產生出finalPage, 因此如果nextPage不存在, 則以finalPage數字代替, 成為要更新的下一頁數字頁碼
      if (nextPage !== null) {
        intNextNumber = parseInt(nextPage.textContent, 10);
      } else {
        intNextNumber = parseInt(finalPage.textContent, 10);
      }

      // 把新的頁碼傳給渲染資料函式, 藉此切割出所需的資料並渲染在畫面上
      renderData({ pageNumber: intNextNumber })

      // 使用解構賦值方式, 只傳入一個參數{}(物件), 且在pagination.js檔案內有分別給予預設值 
      pagination({ dataCount: resData.length, currentPage: intNextNumber });

      if (intNextNumber !== null) {
        const newState = { page: 'nextPage' };
        const newTitle = null;
        const currentUrl = window.location.href;

        // 修改網址內容並在瀏覽器上新增瀏覽記錄
        if (currentUrl.indexOf('&Page=')) {
          const splitUrl = currentUrl.split('&Page=');
          const newUrl = splitUrl[0] + `&Page=${intNextNumber}`;
          // 此時瀏覽器的URL已經變更成新的網址, 且可以在歷史記錄中找到該狀態和標題
          history.pushState(newState, newTitle, newUrl);
        }
      }
     
    } else if (e.target.id === 'finalPage') {
      window.scroll({ top: 0, left: 0, behavior: 'smooth' });

      removeChildNodes();

      // 將字串轉成10進位數字
      const intFinalNumber = parseInt(finalPage.textContent, 10);
      // 把新的頁碼傳給渲染資料函式, 藉此切割出所需的資料並渲染在畫面上
      renderData({ pageNumber: intFinalNumber })

      // 使用解構賦值方式, 只傳入一個參數{}(物件), 且在pagination.js檔案內有分別給予預設值 
      pagination({ dataCount: resData.length, currentPage: intFinalNumber });

      if (intFinalNumber !== null) {
        const newState = { page: 'finalPage' };
        const newTitle = null;
        const currentUrl = window.location.href;

        // 修改網址內容並在瀏覽器上新增瀏覽記錄
        if (currentUrl.indexOf('&Page=')) {
          const splitUrl = currentUrl.split('&Page=');
          const newUrl = splitUrl[0] + `&Page=${intFinalNumber}`;
          // 此時瀏覽器的URL已經變更成新的網址, 且可以在歷史記錄中找到該狀態和標題
          history.pushState(newState, newTitle, newUrl);
        }
      }
      
    } else {
      console.log('因為點擊的是當前頁碼, 故沒有任何效果');
    }
  });

  // 當使用者按下瀏覽器的上一頁/下一頁按鈕時(才會觸發此popstate事件)
  window.addEventListener('popstate', function (event) {
    console.log('---已點瀏覽器的上/下一頁按鈕, 此處負責處理----');
    const state = event.state;
    const currentURL = window.location.href;
    console.log('state=', state);

    // 當state不為null代表已經有'搜尋結果頁'的相關瀏覽記錄, 也就是使用者剛剛已有瀏覽過搜尋結果的內容, 故會留下瀏覽器的相關記錄; 否則, 若是無最近的瀏覽記錄, 則代表該情境是'第一次進來本分頁的時候', 而現在使用者按了瀏覽器本身的回上一頁按鈕, 因此會直接跳轉回首頁
    if (state === null) {
      // 跳轉到首頁
      window.location.href = './index.html';
    } else {
      removeChildNodes();

      // 將網址尾字的頁碼數字取出來
      const pageNumber = currentURL.split('&Page=');

      // 將字串轉成10進位數字
      const intPage = parseInt(pageNumber[1], 10);

      // 把新的頁碼傳給渲染資料函式, 藉此切割出所需的資料並渲染在畫面上
      renderData({ pageNumber: intPage })

      // 使用解構賦值方式, 只傳入一個參數{}(物件), 且在pagination.js檔案內有分別給予預設值 
      pagination({ dataCount: resData.length, currentPage: intPage });
    }
  });
});

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

// 渲染搜尋列
async function renderSearchBar() {
  const form = document.querySelector('.search-bar');

  // 因為縣市下拉式選單是HTML已寫好的內容, 如果使用者完全沒選擇過縣市名稱, 則預設的值就是undefined; 而如果使用者已經有選擇過任一縣市選項, 則按下搜尋按鈕後, 仍需把該值設為縣市下拉式選單的值
  let citySelection = document.getElementById('city');
  if (cityName === '全部縣市') {
    // 設為空字串, 讓搜尋語句能夠尋找所有縣市的資料
    cityName = '';
    // 在畫面上仍需要呈現使用者選擇的是'全部縣市'的選項
    citySelection.value = '全部縣市';
  } else if (cityName !== undefined) {
    citySelection.value = cityName;
  } else {
  }

  // 以動態方式生成當前主題的Class下拉式選單
  const label = document.createElement('label');
  label.for = 'topic';
  label.setAttribute('aria-label', '請選擇主題');
  form.appendChild(label);

  const select = document.createElement('select');
  select.className = 'select-category';
  select.name = 'topic';
  select.id = 'topic';
  select.setAttribute('aria-label', '請選擇主題');
  select.setAttribute('aria-describedby', '請從以下選項內選擇一個您搜尋的主題');
  form.appendChild(select);

  // 各主題頁裡的完整Class(Class1)下拉式選單內容
  const fourCategoryClassNames = {
    ScenicSpot: '其他, 藝術類, 林場類, 遊憩類, 文化類, 溫泉類, 古蹟類, 生態類, 觀光類, 體育健身類, 都會公園類, 國家公園類, 休閒農業類, 自然風景類, 觀光工廠類, 小吃/特產類, 森林遊樂區類, 國家風景區類',
    Activity: '其他, 藝文活動, 活動快報, 節慶活動, 遊憩活動, 四季活動, 年度活動, 自行車活動, 產業文化活動',
    Restaurant: '其他, 素食, 伴手禮, 夜市小吃, 火烤料理, 地方特產, 中式美食, 甜點冰品, 異國料理',
    Hotel: '民宿, 一般旅館, 一般觀光旅館, 國際觀光旅館'
  };

  const optionTopic = document.createElement('option');
  optionTopic.value = '';
  optionTopic.setAttribute('disabled', 'disabled');
  optionTopic.setAttribute('selected', 'selected');
  optionTopic.setAttribute('hidden', 'hidden');
  optionTopic.textContent = '請選擇主題';
  select.appendChild(optionTopic);

  const optionAllClass = document.createElement('option');
  optionAllClass.value = '';
  optionAllClass.textContent = '全部主題';
  select.appendChild(optionAllClass);

  for (const category in fourCategoryClassNames) {
    if (category === selectedCategory) {
      const values = fourCategoryClassNames[category].split(', ');

      values.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
      });
    }
  }

  // 如果使用者已經有選擇任一主題(Class)選項, 則按下搜尋按鈕後, 仍需把該值設為主題(Class)下拉式選單的值
  Object.values(classNameObject).forEach(value => {
    if (value !== undefined) {
      select.value = value;
    }
  });

  // 如果當前主題為近期活動, 以動態方式生成選擇日期欄位
  if (selectedCategory === category[1]) {
    const label = document.createElement('label');
    label.for = 'datepicker';
    label.setAttribute('aria-label', '請選擇日期');
    form.appendChild(label);

    const input = document.createElement('input');
    input.className = 'select-category';
    input.type = 'date';
    input.name = 'datepicker';
    input.id = 'datepicker';

    // 如果使用者已有選定一個日期, 則在搜尋列上顯示其選定的日期; 否則自動補上今日日期
    if (selectedDate !== undefined) {
      input.value = selectedDate;
    } else {
      input.value = today;
    }
    form.appendChild(input);
  }

  // 以動態方式生成關鍵字搜尋欄位
  const div = document.createElement('div');
  div.className = 'keywords';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'keywords';
  input.placeholder = '請輸入關鍵字';
  input.setAttribute('aria-label', '請輸入關鍵字');
  // 如果使用者已有輸入搜尋關鍵字, 則在搜尋列上顯示其關鍵字
  if (keywords !== undefined) {
    input.value = keywords;
  }
  div.appendChild(input);
  form.appendChild(div);

  // 以動態方式生成搜尋按鈕
  const button = document.createElement('button');

  if (selectedCategory === category[1]) {
    button.className = 'search-button activity-search-button';
  } else {
    button.className = 'search-button';
  }
  button.type = 'submit';
  button.name = 'search-button';
  button.setAttribute('aria-label', '按下此按鈕進行搜尋');
  button.textContent = '搜尋';

  const i = document.createElement('i');
  i.className = 'fa-solid fa-magnifying-glass';
  button.appendChild(i);

  form.appendChild(button);
}

// 呼叫API及渲染資料
async function getResultAndRender() {
  resData = await getSearchResult();
  console.log('這是searchResult頁面, 在sql語句的top限制已拿掉');
  document.getElementById('result-count').textContent = resData.length;
  if (resData.length !== 0) {
    // 預設渲染第一頁(至多20筆資料)即可, 故可以不用寫{}內的屬性和值(pageNumber: 1), 因為當無傳入屬性和值時, 函式本身會使用函式宣告的預設值(pageNumber = 1)
    renderData({});
  } else {
    document.getElementById('searchResult-list').style.display = 'none';
    document.getElementById('result-null').style.display = 'block';
  }
}

// 呼叫API取回資料
async function getSearchResult() {
  const getAPIToken = await checkAPIToken();
  let urlStatement = '';

  let checkKeywordStatement = [];
  const keywordsExcludeStatement = keywordsToExclude(selectedCategory);

  // 如果從活動分類頁直接選點Class1名稱進來, 則關鍵字會是undefined
  if (keywords !== '' && keywords !== undefined) {
    // 如果關鍵字有包含一個或多個空格(通常代表有多個關鍵字), 則依空格逐一進行切割, 可得到多筆關鍵字詞
    if (keywords.includes(' ')) {
      // 如果關鍵字不論多長都只有空格
      if (isOnlySpaces(keywords) === true) {
        checkKeywordStatement.push(`contains(${selectedCategory}Name, '')`);
      } else {
        keywordsArr = keywords.split(' ');
        // 檢查每一筆關鍵字是否有包含縣市的中文名稱, 若沒有包含縣市名稱, 則在checkCityInKeywords函式內, 將其設為關鍵字字詞
        keywordsArr.forEach(item => {
          checkKeywordStatement.push(checkCityInKeywords(item, selectedCategory));
        });
      }
    }
    // 如果關鍵字只有一個
    else {
      // 找出該關鍵字中是否有包含縣市的中文名稱, 若沒有包含縣市名稱, 則在checkCityInKeywords函式內, 將其設為關鍵字字詞
      checkKeywordStatement.push(checkCityInKeywords(keywords, selectedCategory));
    }
  } else {
    checkKeywordStatement.push(`contains(${selectedCategory}Name, '')`);
  }

  //將網址列抓取到的縣市名稱一併納入搜尋條件內
  if (cityName !== undefined && cityName !== '') {
    checkKeywordStatement.push(`contains(City, '${cityName}')`);
  }

  //將網址列抓取到的Class名稱(Class/Class1/Class2/Class3)一併納入搜尋條件內
  Object.keys(classNameObject).forEach(key => {
    if (classNameObject[key] !== undefined && classNameObject[key] !== '') {
      checkKeywordStatement.push(`contains(${key}, '${classNameObject[key]}')`);
    }
  });

  // 若是"近期活動"主題且使用者已有選擇日期, 則依使用者日期為主, 使用TDX提供的OData搜尋語法指令'gt'超過(某日期)
  if (selectedCategory === category[1] && selectedDate !== undefined) {
    checkKeywordStatement.push(`date(EndTime) gt ${selectedDate}`);
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

  // 若是"近期活動"主題, 則在select語句內多加入一個獨有的Location欄位(因有些活動沒有Address欄位的值, 但有Location欄位的值)
  if (selectedCategory === category[1]) {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Location,Picture&$filter=${combinedKeywordStatement} ${keywordsExcludeStatement}&$orderby=UpdateTime desc&$format=JSON`;
  } else {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Picture&$filter=${combinedKeywordStatement} ${keywordsExcludeStatement}&$orderby=UpdateTime desc&$format=JSON`;
  }
  let res = await callCategoryDataAPI(getAPIToken, selectedCategory, urlStatement);
  return res;
}

// 檢查關鍵字字串內是否僅只有空格
function isOnlySpaces(str) {
  // 使用正規表達式來檢查字串, ^表示字串的開頭, *表示匹配前一個字符(在此為一個空格)零次或多次, $表示字串的結尾, 也就是如果這個字串只包含空格而不包含其他文字或符號, 則會回傳true, 否則回傳false
  return /^ *$/.test(str);
}

// 渲染資料到畫面上
function renderData({ pageNumber = 1 }) {
  // 取得<ul>元素的id
  const ulList = document.getElementById('searchResult-list');

  // 因為index是從0開始, 在此取得第(pageNumber-1)*20 ~ pageNumber*20筆資料, 單頁至多20筆資料
  const dataSlice = resData.slice((pageNumber - 1) * 20, pageNumber * 20);

  // 將每一筆取回的資料都走一遍, 且動態生成每個li元素
  dataSlice.forEach(item => {

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
}

// 將畫面上的各項資料設定監聽事件
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

// 移除'搜尋結果ul'及'分頁ul'兩者的所有子結點
function removeChildNodes() {
  // 移除現有的所有"分頁ul"的子元素, 以利後續重新生成新的分頁子元素
  while (paginationList.firstChild) {
    paginationList.removeChild(paginationList.firstChild);
  }

  // 移除現有的所有"搜尋結果ul"的子元素, 以利後續重新生成新的分頁子元素
  while (searchResultList.firstChild) {
    searchResultList.removeChild(searchResultList.firstChild);
  }
}

// 彙整所有函式且依序逐步執行
async function getAPIData() {
  renderBreadcrumb();

  // 搜尋結果頁面採動態生成搜尋列方式; 若是4大主題頁面則搜尋列式預設用HTML寫好的, 則不需動態生成; 但不論如何都必須要先等搜尋列方式已經確定生成後, 才進一步使用setupSearchForm函式實現搜尋功能
  await renderSearchBar();

  await getResultAndRender();

  // 實現搜尋功能(引用js檔)
  setupSearchForm(selectedCategory);


  // 此處判斷是否為首次進來搜尋結果頁並進行對應處理; 如果proxy抓取到page變數的值為undefined, 則代表是從首頁按下搜尋按鈕後, 首次進來此搜尋結果頁; 否則, 則代表是從詳細資料畫面按瀏覽器的上一頁按鈕, 返回到此搜尋結果頁, 也就是符合page !== undefined的情形
  if (page === undefined) {
    console.log('---首次進來此搜尋結果頁, 此處負責處理----');
    // 使用解構賦值方式, 只傳入一個參數{}(物件), 且在pagination.js檔案內有分別給予預設值 
    pagination({ dataCount: resData.length, currentPage: 1 });
  } else {
    console.log('---已成功捕捉到網址尾字的頁碼數字, 此處負責處理----');

    removeChildNodes();

    // 將字串轉成10進位數字
    const intPage = parseInt(page, 10);

    // 把新的頁碼傳給渲染資料函式, 藉此切割出所需的資料並渲染在畫面上
    renderData({ pageNumber: intPage })

    // 使用解構賦值方式, 只傳入一個參數{}(物件), 且在pagination.js檔案內有分別給予預設值 
    pagination({ dataCount: resData.length, currentPage: intPage });
  }
}

async function allFuncs() {
  await getAPIData();
  loadingAnimation();
}