import { setupSearchForm, setupImageClickHandlers } from './setupImageClickAndSearchForm.js';

document.addEventListener('DOMContentLoaded', () => {
  const classNames = ["地方特產", "中式美食", "甜點冰品", "異國料理", "伴手禮", "素食"];

  // 實作搜尋列的搜尋功能
  setupSearchForm('Restaurant');

  //實作畫面上各圖卡的點擊與跳轉搜尋頁的效果
  setupImageClickHandlers('Restaurant', classNames);
});