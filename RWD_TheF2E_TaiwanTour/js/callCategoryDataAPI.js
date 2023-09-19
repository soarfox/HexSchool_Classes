// 取得指定主題的n項欄位內容
async function callCategoryDataAPI(api_token, category, urlStatement) {

  if (api_token != undefined) {
    // 加入關鍵字搜尋的語句
    // const url = 'https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$filter=contains(ScenicSpotName, \'海\')&$top=4&$format=JSON';

    // 最廣泛適用, 但會把所有資料撈回來, 資料量較大 
    // const url = `https://tdx.transportdata.tw/api/basic/v2/Tourism/${category}?$top=4&$format=JSON`;

    // 過濾掉無圖片的資料(完整查詢語句)
    // https://tdx.transportdata.tw/api/basic/v2/Tourism/Activity?$select=ActivityName,StartTime,EndTime,Address,Picture&$filter=Picture/PictureUrl1 ne null&$orderby=UpdateTime desc&$top=4&$format=JSON
    const url = `https://tdx.transportdata.tw/api/basic/v2/Tourism/${category}?${urlStatement}`;
    // console.log(url);

    try {
      // 
      const response = await axios.get(url, {
        headers: {
          "authorization": "Bearer " + api_token
        }
      });
      return response.data;

    } catch (error) {
      console.error('getAPIData axios失敗:', error);
    }
  }
  else {
    console.log('您的api token為:undefined');
  }
};

export { callCategoryDataAPI };