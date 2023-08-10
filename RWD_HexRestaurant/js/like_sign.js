// 當DOM完全生成完畢後, 選取所有class名稱為.heartBtn的DOM元素們, 並將它們存入名為likeBtns的NodeList
document.addEventListener("DOMContentLoaded", function () {
  const likeBtns = document.querySelectorAll('.heartBtn');

  // 透過迴圈處理likeBtns這個NodeList內的每一個元素（每次以likeBtn代稱）, 尋找該元素內具有class名稱為.fa-regular的子元素, 並將該子元素存為heartSign;  將為名為likeBtn的元素添加一個監聽事件, 當該元素內的heartSign被點擊時, 切換其class名稱 "fa-solid", 藉此改變愛心的實心/空心狀態
  likeBtns.forEach(function (likeBtn) {
    const heartSign = likeBtn.querySelector('.fa-regular');

    likeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // 切換class名稱 "fa-solid"(愛心的實心圖案)
      heartSign.classList.toggle('fa-solid');
    });
  });
});
