// 讀取效果動畫
function loadingAnimation() {
  const overlayElement = document.getElementById("overlay");
  const loaderElement = document.getElementById("loader");
  if (overlayElement && loaderElement) {
    // 讓遮罩層的不透明度從1逐漸減小至0為止(此為降低透明度的起點, 將依.overlay設定的秒數逐漸將透明度降為0, 成為完全透明)
    overlayElement.style.opacity = "0";
    // 防止遮罩層在消失之前被使用者點擊
    overlayElement.style.pointerEvents = "none";
    loaderElement.style.opacity = "0";

    // 當讀取動畫icon結束時, 同時隱藏遮罩層與動畫本身
    overlayElement.addEventListener("transitionend", () => {
      overlayElement.style.display = "none";
      loaderElement.style.display = "none";
    }, {
      // once代表事件只會觸發一次
      once: true,
    }
    );
  } else {
    // console.log("沒抓到overlay");
  }
}

export { loadingAnimation };