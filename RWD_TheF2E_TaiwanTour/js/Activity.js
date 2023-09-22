import { setupSearchForm, setupImageClickHandlers } from './setupImageClickAndSearchForm.js';

document.addEventListener('DOMContentLoaded', () => {
  const classNames = ["藝文活動", "自行車活動", "遊憩活動", "產業文化活動", "年度活動", "四季活動"];

  // 實作搜尋列的搜尋功能
  setupSearchForm('Activity');

  //實作畫面上各圖卡的點擊與跳轉搜尋頁的效果
  setupImageClickHandlers('Activity', classNames);
});