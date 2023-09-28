function pagination({ dataCount = 100, currentPage = 1, countInOnePage = 20 }) {
  // const dataCount = 101;
  // const countInOnePage = 20;
  // let currentPage = 1;

  let totalPage = Math.floor(dataCount / countInOnePage);
  let previousPage = '';
  let nextPage = '';
  let finalPage = '';

  // 處理finalPage的邏輯
  if (dataCount % countInOnePage === 0) {
    finalPage = totalPage;
  } else {
    finalPage = totalPage + 1;
  }

  // 以下需要賦予變數數值
  const ulList = document.querySelector('.pagination-list');
  const currentPageLi = document.createElement('li');
  currentPageLi.id = 'currentPage';
  const previousPageLi = document.createElement('li');
  previousPageLi.id = 'previousPage';
  const nextPageLi = document.createElement('li');
  nextPageLi.id = 'nextPage';
  const finalPageLi = document.createElement('li');
  finalPageLi.id = 'finalPage';

  // 以下純符號, 不需賦予變數數值
  const ellipsisPageLi = document.createElement('li');
  ellipsisPageLi.textContent = '...';
  const previousButton = document.createElement('li');
  previousButton.id = 'previousButton';
  previousButton.textContent = '<';
  const nextButton = document.createElement('li');
  nextButton.id = 'nextButton';
  nextButton.textContent = '>';

  // 處理previousPage的邏輯
  if (currentPage - 1 > 0) {
    previousPage = currentPage - 1;
    previousPageLi.textContent = previousPage;
    ulList.appendChild(previousButton);
    ulList.appendChild(previousPageLi);
  } else {
    // 此時previousPage不需存在, 故不用將其加入ul內
    previousButton.classList.add('disable');
    ulList.appendChild(previousButton);
  }

  // 為currentPage加入數值及樣式
  currentPageLi.textContent = currentPage;
  currentPageLi.classList.add('active');
  ulList.appendChild(currentPageLi);

  // console.log('---------------------');
  // console.log('currentPage=',currentPage);
  // console.log('finalPage=',finalPage);
  // console.log('nextPage=',nextPage);

  // 處理nextPage的邏輯
  if (currentPage + 1 < finalPage) {
    // console.log('currentPage + 1 < finalPage');
    nextPage = currentPage + 1;
    nextPageLi.textContent = nextPage;
    ulList.appendChild(nextPageLi);

    if (nextPage + 1 !== finalPage) {
      // console.log('nextPage + 1 !== finalPage');
      ellipsisPageLi.textContent = '...';
      ulList.appendChild(ellipsisPageLi);
    }
  } else if (currentPage + 1 === finalPage) {
    // console.log('currentPage + 1 === finalPage');
    finalPageLi.textContent = finalPage;
    ulList.appendChild(finalPageLi);
  } else {
    // console.log('此時nextPage不需存在, 故不用將其加入ul內');
    // 此時nextPage不需存在, 故不用將其加入ul內
    nextButton.classList.add('disable');
    ulList.appendChild(nextButton);
  }

  // 處理currentPage等於/不等於finalPage時的邏輯
  if (currentPage !== finalPage) {
    finalPageLi.textContent = finalPage;
    ulList.appendChild(finalPageLi);
    ulList.appendChild(nextButton);
  } else {
    finalPage = '';
  }

  console.log(`dataCount=${dataCount}, previousPage=${previousPage}, currentPage=${currentPage}, nextPage=${nextPage}, finalPage=${finalPage}`);
}

// 以下暫時不使用
// // 修改 URL並新增新的歷史記錄項目
// const newState = { page: 'previous page' };
// const newTitle = 'previous page777';
// let newURL = currentURL + `&Page=${previousPage}`;
// console.log(newURL);

// // 取得上一次的網址並去掉尾巴的'`&Page=x'內容後, 補上本次新分頁的數字, 設為新的網址
// if(currentURL.indexOf('&Page=')){
//   newURL = newURL.split('&Page=') 
//   newURL[0] = newURL[0] + `&Page=${previousPage}`;
//   console.log(newURL[0]);
// }

// history.pushState(newState, newTitle, newURL[0]);
// // 現在瀏覽器的URL變為newURL內容, 並且可以在歷史記錄中找到新的狀態對象和標題

// // 下方僅適用於當使用者按下瀏覽器的上一頁/下一頁才會被觸發; 透過上述單純更新網址時, 並不會觸發以下監聽事件
// window.addEventListener('popstate', function(event) {
//   //檢查 state 是否與預期的一致
//   const state = event.state;
//   if (state) {
//     console.log('State information:', state);
//   }
// });


export { pagination };