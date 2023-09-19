function keywordsToExclude(categoryName) {

  const arr = ['宮', '廟', '佛', '寺', '壇', '祠', '巖', '殿','財神', '神社', '媽祖', '觀音', '神像', '神石碑', '鯤鯓王', '中台世界博物館'];
  let statement = 'and not contains(Class1, \'廟宇類\')';

  // 因為只有景點主題才會有Class1為廟宇類, 其餘三種主題的Class1沒有"廟宇類"這個內容
  if (categoryName !== 'ScenicSpot'){
    statement = '';
  }

  // 將會回傳要排除的OData查詢語句
  arr.forEach(function (item) {
    statement = statement + `and not contains(${categoryName}Name, '${item}')`;
  });

  return statement;
}

export { keywordsToExclude };

