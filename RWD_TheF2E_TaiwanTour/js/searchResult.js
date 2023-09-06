const queryString = window.location.search;
// console.log('queryString=',queryString);
const searchParams = new URLSearchParams(queryString);
// console.log('searchParams=',searchParams);

const handler = {
  // 攔截對物件屬性的讀取操作
  get: function (obj, prop) {
    if (obj.has(prop)) {
      console.log(`訪問的屬性名稱為:${prop}`);
      // console.log(`值為:`,obj.get(prop));
      return obj.get(prop);
    } else {
      console.log(`屬性名稱:${prop}並不存在`);
      // 返回 undefined 表示屬性不存在
      return undefined; 
    }
  },
};

// 建立一個代理對象(proxy), 藉此成為代理者並進行處理
const proxy = new Proxy (searchParams, handler);

// 透過使用屬性名稱來取得參數的值
const keywords = proxy.keywords;
console.log('keywords=',keywords);








