function keywordsToExclude(categoryName) {

  const arr = ['宮', '廟', '寺', '壇', '祠','財神', '神社', '神石碑', '神像', '佛', '中台世界博物館','巖'];
  let statement = 'and not contains(Class1, \'廟宇類\')';

  // 將會回傳要排除的OData查詢語句
  arr.forEach(function (item) {
    statement = statement + ` and not contains(${categoryName}Name, '${item}')`;
  });

  return statement;
}

export { keywordsToExclude };

