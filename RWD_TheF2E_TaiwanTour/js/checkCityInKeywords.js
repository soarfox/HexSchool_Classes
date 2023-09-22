const cities = {
  基隆: '基隆市',
  臺北: '台北市, 臺北市',
  新北: '新北市',
  桃園: '桃園市',
  新竹: '新竹市',
  新竹縣: '新竹縣',
  苗栗: '苗栗縣',
  臺中: '台中市, 臺中市',
  彰化: '彰化縣',
  南投: '南投縣',
  雲林: '雲林縣',
  嘉義: '嘉義市',
  嘉義縣: '嘉義縣',
  臺南: '台南市, 臺南市',
  高雄: '高雄市',
  屏東: '屏東縣',
  宜蘭: '宜蘭縣',
  花蓮: '花蓮縣',
  臺東: '台東縣, 臺東縣',
  澎湖: '澎湖縣',
  金門: '金門縣',
  連江: '連江縣'
};

function checkCityInKeywords (item, selectedCategory) {
  let statement = '';
  let cityInKeyword = Object.keys(cities).find(key => cities[key].includes(item));

  if (cityInKeyword) {
    statement = `contains(City, '${cityInKeyword}')`;
  } else {
    statement = `contains(${selectedCategory}Name, '${item}')`;
  }
  return statement;
}

export { checkCityInKeywords };

