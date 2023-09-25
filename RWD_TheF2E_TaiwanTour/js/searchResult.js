import { proxyOfURL } from './proxyOfURL.js';
import { checkAPIToken } from './getAPIToken.js';
import { keywordsToExclude } from './keywordsToExclude.js';
import { getRegionOfAddress } from './getRegionOfAddress.js';
import { checkPictureUrl } from './checkPictureUrl.js';
import { getDate } from './getDate.js';
import { checkCityInKeywords } from './checkCityInKeywords.js';
import { callCategoryDataAPI } from './callCategoryDataAPI.js';
import { setupSearchForm } from './setupImageClickAndSearchForm.js';

const selectedCategory = proxyOfURL.Category;
const cityName = proxyOfURL.City;
const selectedDate = proxyOfURL.SelectedDate;
const className = proxyOfURL.Class;
const class1Name = proxyOfURL.Class1;
const class2Name = proxyOfURL.Class2;
const class3Name = proxyOfURL.Class3;
const keywords = proxyOfURL.Keywords;
const today = getDate();
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

// 透過使用屬性名稱來取得URL裡參數的值
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
const categoryContrast = {
  ScenicSpot: '探索景點',
  Activity: '近期活動',
  Restaurant: '品嚐美食',
  Hotel: '安心住宿'
};

document.addEventListener('DOMContentLoaded', () => {
  allFuncs();
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

  // 因為縣市下拉式選單是HTML已寫好的內容, 而如果使用者已經有選擇過任一縣市選項, 則按下搜尋按鈕後, 仍需把該值設為縣市下拉式選單的值
  if (cityName !== undefined) {
    const citySelection = document.getElementById('city');
    citySelection.value = cityName;
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

  const fourCategoryClassNames = {
    ScenicSpot: '自然風景類, 觀光工廠類, 遊憩類, 休閒農業類, 生態類, 溫泉類, 其他',
    Activity: '節慶活動, 自行車活動, 遊憩活動, 產業文化活動, 年度活動, 四季活動',
    Restaurant: '地方特產, 中式美食, 甜點冰品, 異國料理, 伴手禮, 素食',
    Hotel: '一般旅館, 一般觀光旅館, 國際觀光旅館, 民宿'
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
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Location,Picture&$filter=${combinedKeywordStatement} ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
  } else {
    urlStatement = `$select=${selectedCategory}ID,${selectedCategory}Name,Address,City,Picture&$filter=${combinedKeywordStatement} ${keywordsExcludeStatement} &$top=17&$orderby=UpdateTime desc&$format=JSON`;
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

// 彙整所有函式且依序逐步執行
async function allFuncs() {
  renderBreadcrumb();

  // 搜尋結果頁面採動態生成搜尋列方式; 若是4大主題頁面則搜尋列式預設用HTML寫好的, 則不需動態生成; 但不論如何都必須要先等搜尋列方式已經確定生成後, 才進一步使用setupSearchForm函式實現搜尋功能
  await renderSearchBar();

  await getResultAndRender();

  // 實現搜尋功能(引用js檔)
  setupSearchForm(selectedCategory);
}