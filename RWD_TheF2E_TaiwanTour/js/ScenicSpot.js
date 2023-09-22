import { setupSearchForm, setupImageClickHandlers } from './setupImageClickAndSearchForm.js';

document.addEventListener('DOMContentLoaded', () => {
  const classNames = ["自然風景類", "觀光工廠類", "遊憩類", "休閒農業類", "生態類", "溫泉類", "其他"];

  // 實作搜尋列的搜尋功能
  setupSearchForm('ScenicSpot');

  //實作畫面上各圖卡的點擊與跳轉搜尋頁的效果
  setupImageClickHandlers('ScenicSpot', classNames);
});