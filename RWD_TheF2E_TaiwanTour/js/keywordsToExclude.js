function keywordsToExclude(categoryName) {

  const arr = ['宮', '廟', '寺', '壇', '祠','財神', '神社', '神石碑', '神像', '佛', '中台世界博物館'];
  let statement = '';

  // 將會回傳要排除的OData查詢語句
  arr.forEach(function (item) {
    statement = statement + ` and not contains(${categoryName}Name, '${item}')`;
  });

  return statement;
}

export { keywordsToExclude };

