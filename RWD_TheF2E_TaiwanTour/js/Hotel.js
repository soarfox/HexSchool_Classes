import { setupSearchForm, setupImageClickHandlers } from './setupImageClickAndSearchForm.js';

document.addEventListener('DOMContentLoaded', () => {
  const classNames = ["一般旅館", "一般觀光旅館", "國際觀光旅館", "民宿"];

  // 實作搜尋列的搜尋功能
  setupSearchForm('Hotel');

  //實作畫面上各圖卡的點擊與跳轉搜尋頁的效果
  setupImageClickHandlers('Hotel', classNames);
});