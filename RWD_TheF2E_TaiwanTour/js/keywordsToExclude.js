function keywordsToExclude(categoryName) {
  let combinedKeywordStatement = 'and ';

  // 只有景點主題或活動主題才設定要排除的關鍵字; 餐廳主題及住宿主題則不設定
  if(categoryName === 'ScenicSpot' || categoryName === 'Activity'){

  // 要排除的關鍵字
  const strToExclude = ['宮', '廟', '佛', '寺', '壇', '祠', '巖', '殿','財神', '神社', '安府', '天府', '西府', '媽祖', '觀音', '神像', '神石碑', '鯤鯓王', '天德堂', '代勸堂', '文林閣' , '天上聖母', '南天花苑', '左營萬年季', '中台世界博物館'];

  // 只有景點主題才會有Class1為廟宇類, 其餘三種主題的Class沒有"廟宇類"; 但因為這樣會把一些教堂也濾掉, 故不使用此方法
  // statement = 'and not contains(Class1, \'廟宇類\')';
  // if (categoryName !== 'ScenicSpot'){
  //   statement = '';
  // }

  // 將會回傳要排除的OData查詢語句
  // strToExclude.forEach(function (item) {
  //   statement = statement + ` and not contains(${categoryName}Name, '${item}')`;
  // });

    strToExclude.forEach((item, index) => {
      if (index + 1 < strToExclude.length) {
        combinedKeywordStatement += `not contains(${categoryName}Name, '${item}')` + ' and ';
      } else {
        combinedKeywordStatement += `not contains(${categoryName}Name, '${item}')`;
      }
    });
  } else {
    combinedKeywordStatement = '';
  }
  return combinedKeywordStatement;
}

export { keywordsToExclude };

