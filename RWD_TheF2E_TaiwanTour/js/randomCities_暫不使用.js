const cities = ['Keelung', 'Taipei', 'NewTaipei', 'Taoyuan', 'Hsinchu', 'HsinchuCounty', 'MiaoliCounty', 'Taichung', 'ChanghuaCounty', 'NantouCounty', 'YunlinCounty', 'ChiayiCounty', 'Chiayi', 'Tainan', 'Kaohsiung', 'PingtungCounty', 'PenghuCounty', 'KinmenCounty', 'LienchiangCounty'];

function getRandomCities(numberOfCities) {
  const selectedCities = [];
  const numberOfCitiesToSelect = numberOfCities;

  
  while (selectedCities.length < numberOfCitiesToSelect) {
    // Math.random()每次會在0~1之間取得一個小數, 且該小數必定大於0且小於1, 而Math.floor()會無條件捨去小數位數, 故每次先將0~1的小數值乘上"城市總數(19)"後, 會得到0~19-1的一個值(0~18), 假設是17.12447568762, 則透過Math.floor()無條件捨去小數位, 故會得到整數17, 並將17作為一個index值去取得這個城市的英文名稱
    const randomIndex = Math.floor(Math.random() * cities.length);
    const randomCity = cities[randomIndex];

    // 如果選中的城市名稱已經陳列於selectedCities陣列內, 則會重跑一次迴圈; 否則就將該城市名稱納入陣列內
    if (!selectedCities.includes(randomCity)) {
      selectedCities.push(randomCity);
    }
  }

  return selectedCities;
}

export { getRandomCities };