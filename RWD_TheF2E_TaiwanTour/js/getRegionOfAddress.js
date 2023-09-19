// 取出地址內行政區的名稱, 若無包含任何行政區, 則網頁上將不顯示相同縣市(行政區)的任何景點/活動/餐廳/住宿資料, 直接隱藏該區域內容
function checkRegion(place) {
  const regions = ['縣','市','區','鄉','鎮','村','里','鄰'];
  // 使用for迴圈藉此在找到資料時就能透過return中斷迴圈並將資料回傳出去; 若使用forEach, 則只會中斷該次迴圈, 並且繼續走下一個regions內容, 直到遍歷完所有內容後才會停止
  for(let item of regions) {
    const index = place.indexOf(item);
    // 如果找到的資料其索引值不為-1, 代表該字有存在於地址內
    if( index !== -1 ) {
      // 將地址內的區域名稱(例如: 新北市)回傳出去
      // console.log(place.slice(index-2,index+1));
      return place.slice(index-2,index+1);
    }
  }
  // 如果資料本身有Address屬性/Location屬性, 但是其值卻不包含上述各種行政區域名稱, 則回傳'未提供縣市名稱'
  return false;
}

// function getRegionOfAddress (data){
//   let placeSlice = '';

//   if(data.hasOwnProperty('Address') && data.Address.trim() !== ''){
//     placeSlice = checkRegion(data.Address);
//     if(placeSlice !== false){
//       return placeSlice;
//     }
//   }
//   if(data.hasOwnProperty('Location') && data.Location.trim() !== ''){
//     placeSlice = checkRegion(data.Location);
//     if(placeSlice !== false){
//       return placeSlice;
//     }
//   }
//   if(placeSlice === '' || placeSlice === false){
//     return '詳情如內';
//   }
// }

function getRegionOfAddress (data){
  let placeSlice = '';
  console.log(data);
  if(data.hasOwnProperty('City') && data.City.trim() !== ''){
    placeSlice = checkRegion(data.City);
  } else if(data.hasOwnProperty('Address') && data.Address.trim() !== ''){
    placeSlice = checkRegion(data.Address);
  } else if (data.hasOwnProperty('Location') && data.Location.trim() !== ''){
    placeSlice = checkRegion(data.Location);
  } else {
    placeSlice = '詳情如內';
  }

  if(placeSlice === '' || placeSlice === false){
    return '詳情如內';
  } else {
    return placeSlice;
  }
}

export { getRegionOfAddress };