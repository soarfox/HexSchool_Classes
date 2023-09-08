function getRandomNumber(limitNum, number) {
  const selectedNumbers = [];
  const numberToSelect = number;

  
  while (selectedNumbers.length < numberToSelect) {
    // Math.random()每次會在0~1之間取得一個小數, 且該小數必定大於0且小於1, 而Math.floor()會無條件捨去小數位數, 故每次先將0~1的小數值乘上100後, 會得到0~100-1的一個值(0~99), 假設是17.12447568762, 則透過Math.floor()無條件捨去小數位, 故會得到整數17
    const randomNumber = Math.floor(Math.random() * limitNum);

    // 如果選中的亂數值已經陳列於selectedNumbers陣列內, 則會重跑一次迴圈; 否則就將該亂數值納入陣列內
    if (!selectedNumbers.includes(randomNumber)) {
      selectedNumbers.push(randomNumber);
    }
  }

  return selectedNumbers;
}

export { getRandomNumber };