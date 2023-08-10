// 當DOM完全生成完畢後, 抓取.m-menu 這個DOM元素
document.addEventListener("DOMContentLoaded", function() {
  const showMenu = document.querySelector('.m-menu');
  const navElement = document.querySelector('.navbar');
  
  // 一旦showMenu變數被點擊, 先阻擋預設點擊會發生的行為後, 並為navbar元素加上/刪去(因為toggle代表切換的意思)一個class名稱'show-mobile-menu', 以利CSS內對應的語法能夠產生效果
  showMenu.addEventListener('click', function(e) {
    e.preventDefault();
    navElement.classList.toggle('show-mobile-menu');
  });
});