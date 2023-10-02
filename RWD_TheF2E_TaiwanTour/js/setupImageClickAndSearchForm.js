import { getDate } from './getDate.js';

const today = getDate();
const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];
// 此處是將各Class(Class1)名稱綁定到各主題頁裡的各張圖卡的a連結身上, 而搜尋結果頁顯現的各主題的完整Class(Class1)下拉式選單內容, 則寫在searchResult.js內
const categoryClassNameForImg = {
  ScenicSpot: '自然風景類, 觀光工廠類, 遊憩類, 休閒農業類, 生態類, 溫泉類, 其他',
  Activity: '節慶活動, 遊憩活動, 四季活動, 年度活動, 自行車活動, 產業文化活動',
  Restaurant: '地方特產, 中式美食, 甜點冰品, 異國料理, 伴手禮, 素食',
  Hotel: '民宿, 一般旅館, 一般觀光旅館, 國際觀光旅館'
};

// 實現搜尋列的搜尋功能
function setupSearchForm(categoryName) {
  let redirectURL = '';

  if (categoryName === category[1]) {
    const defaultDate = document.getElementById('datepicker');
    // 若是活動分類頁畫面上的日期選擇欄位為空值, 則自動改成今日日期; 若已有日期, 則維持所選的日期不變
    if (defaultDate.value === '') {
      defaultDate.value = today;
    }
  }

  // 當搜尋按鈕被點擊後
  const searchForm = document.querySelector('form');
  searchForm.addEventListener('submit', e => {
    let datepicker = '';
    e.preventDefault();
    const city = document.getElementById('city').value;
    const topic = document.getElementById('topic').value;
    const keywords = document.getElementById('keywords').value;
    // 如果是活動分類則抓取日期欄位的資料, 才需要抓取datepicker元素
    if (categoryName === category[1]) {
      datepicker = document.getElementById('datepicker');
    }
    // 需留意:在4支API中, 只有景點資料API才有Class1~Class3屬性, 活動資料API為Class1~Class2屬性, 而餐廳和住宿API只有Class屬性, 且在4個主題分類畫面上都是以Class1(Class)為主, 此處將網址列內的各欄位與內容組合好之後, 跳轉到搜尋結果頁並交由該頁的js程式碼去解析網址的內容後顯示搜尋結果
    if (categoryName === category[0]) {
      redirectURL = `./searchResult.html?Category=${categoryName}&City=${city}&Class1=${topic}&Keywords=${encodeURIComponent(keywords)}`;
    } else if (categoryName === category[1]) {
      redirectURL = `./searchResult.html?Category=${categoryName}&City=${city}&Class1=${topic}&SelectedDate=${datepicker.value}&Keywords=${encodeURIComponent(keywords)}`;
    } else {
      redirectURL = `./searchResult.html?Category=${categoryName}&City=${city}&Class=${topic}&Keywords=${encodeURIComponent(keywords)}`;
    }
    // 跳轉到搜尋畫面
    window.location.href = redirectURL;
  });
}

// 實現各主題頁內各圖卡的搜尋功能
function setupImageClickHandlers(categoryName) {
  let redirectURL = '';
  let categoryClassNames = [];

  if (categoryName === category[1]) {
    const defaultDate = document.getElementById('datepicker');
    // 若是活動分類頁畫面上的日期選擇欄位為空值, 則自動改成今日日期; 若已有日期, 則維持所選的日期不變
    if (defaultDate.value === '') {
      defaultDate.value = today;
    }
  }
  
  // 以下實作畫面上各圖卡的點擊與跳轉搜尋頁的效果, 因為各圖片外層是用a標籤包著, 故直接抓取那些a標籤
  const imgElementList = document.querySelectorAll('ul .card a');

  for (const category in categoryClassNameForImg) {
    if (category === categoryName) {
      categoryClassNames = categoryClassNameForImg[category].split(', ');
    }
  }

  //將ul清單內各a標籤都加上自設的Class名稱
  imgElementList.forEach((item, index) => {
    item.setAttribute('data-Class', categoryClassNames[index]);
  });

  // 為每一個a標籤都加上監聽事件(原本想為整個ul加上監聽, 但實測後發現有時候點擊到的是img標籤, 有時候點擊到的是div標籤, 且點擊後尚需取得Class1名稱, 故考量後較簡單方法是直接在a標籤上加上Class1名稱, 且直接為每一個a標籤都各加上一個監聽事件較為簡便)
  imgElementList.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      // 需留意:在4支API中, 只有景點資料API才有Class1~Class3屬性, 活動資料API為Class1~Class2屬性, 而餐廳和住宿API只有Class屬性, 且在4個主題分類畫面上都是以Class1(Class)為主, 此處將網址列內的各欄位與內容組合好之後, 跳轉到搜尋結果頁並交由該頁的js程式碼去解析網址的內容後顯示搜尋結果
      if (categoryName === category[0]) {
        redirectURL = `./searchResult.html?Category=${categoryName}&Class1=${item.getAttribute('data-Class')}`;
      } else if (categoryName === category[1]) {
        redirectURL = `./searchResult.html?Category=${categoryName}&Class1=${item.getAttribute('data-Class')}&SelectedDate=${datepicker.value}`;
      } else {
        redirectURL = `./searchResult.html?Category=${categoryName}&Class=${item.getAttribute('data-Class')}`;
      }
      // 跳轉到搜尋畫面
      window.location.href = redirectURL;
    });
  });
}

export { setupSearchForm, setupImageClickHandlers };