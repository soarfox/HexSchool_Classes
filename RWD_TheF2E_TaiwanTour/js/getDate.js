function getDate() {

  let formattedDate = '';
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  // 月份從0開始, 故需要加1
  let month = currentDate.getMonth() + 1;
  let day = currentDate.getDate();

  if (month < 10) {
    month = '0' + month;
  }

  if (day < 10) {
    day = '0' + day;
  }

  formattedDate = year + '-' + month + '-' + day;
  return formattedDate;
}

export { getDate };