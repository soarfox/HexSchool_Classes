const category = ['ScenicSpot', 'Activity', 'Restaurant', 'Hotel'];

function setupSearchForm(categoryName) {
  // 以下實作搜尋列的搜尋功能
  let redirectURL = '';
  const searchForm = document.querySelector('form');
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    const topic = document.getElementById('topic').value;
    const keywords = document.getElementById('keywords').value;
    // 需留意:在4支API中, 只有景點資料API才有Class1~Class3屬性, 活動資料API為Class1~Class2屬性, 而餐廳和住宿API只有Class屬性, 且在4個主題分類畫面上都是以Class1(Class)為主
    console.log('categoryName=', categoryName);
    // 此處將網址列內的各欄位與內容組合好之後, 跳轉到搜尋結果頁並交由該頁的js程式碼去解析網址的內容後顯示搜尋結果
    if (categoryName === category[0] || categoryName === category[1]) {
      redirectURL = `./searchResult.html?Category=${categoryName}&City=${city}&Class1=${topic}&Keywords=${encodeURIComponent(keywords)}`;
    } else {
      redirectURL = `./searchResult.html?Category=${categoryName}&City=${city}&Class=${topic}&Keywords=${encodeURIComponent(keywords)}`;
    }
    // 跳轉到搜尋畫面
    window.location.href = redirectURL;
  });
}

function setupImageClickHandlers(categoryName, classNames) {
  let redirectURL = '';
  // 以下實作畫面上各圖卡的點擊與跳轉搜尋頁的效果, 因為各圖片外層是用a標籤包著, 故直接抓取那些a標籤
  const imgElementList = document.querySelectorAll('ul .card a');

  //將ul清單內各a標籤都加上自設的Class名稱
  imgElementList.forEach((item, index) => {
    item.setAttribute('data-Class', classNames[index]);
  });

  // 為每一個a標籤都加上監聽事件(原本想為整個ul加上監聽, 但實測後發現有時候點擊到的是img標籤, 有時候點擊到的是div標籤, 且點擊後尚需取得Class1名稱, 故考量後較簡單方法是直接在a標籤上加上Class1名稱, 且直接為每一個a標籤都各加上一個監聽事件較為簡便)
  imgElementList.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      // 需留意:在4支API中, 只有景點資料API才有Class1~Class3屬性, 活動資料API為Class1~Class2屬性, 而餐廳和住宿API只有Class屬性, 且在4個主題分類畫面上都是以Class1(Class)為主
      console.log('categoryName=', categoryName);
      // 此處將網址列內的各欄位與內容組合好之後, 跳轉到搜尋結果頁並交由該頁的js程式碼去解析網址的內容後顯示搜尋結果
      if (categoryName === category[0] || categoryName === category[1]) {
        redirectURL = `./searchResult.html?Category=${categoryName}&Class1=${item.getAttribute('data-Class')}`;
      } else {
        redirectURL = `./searchResult.html?Category=${categoryName}&Class=${item.getAttribute('data-Class')}`;
      }
      // 跳轉到搜尋畫面
      window.location.href = redirectURL;
    });
  });
}

export { setupSearchForm, setupImageClickHandlers };