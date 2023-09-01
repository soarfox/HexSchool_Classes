// 以下語法可直接放在網址列上敲, 能夠取得資料

// https://ptx.transportdata.tw/MOTC/v2/Tourism/Hotel?$filter=Class ne '民宿' & top=300

// https://ptx.transportdata.tw/MOTC/v2/Tourism/Hotel?$filter=Class ne '民宿' and Class ne '一般旅館' & top=30

// https://ptx.transportdata.tw/MOTC/v2/Tourism/Hotel?$filter=Class ne '民宿' and Class ne '一般旅館' and Class ne '一般觀光旅館' and Class ne '國際觀光旅館' & top=30


async function GetApiResponse(api_token) {

  if (api_token != undefined) {
    const url = 'https://tdx.transportdata.tw/api/basic/v2/Tourism/ScenicSpot?$filter=contains(ScenicSpotName, \'海\')&$top=3&$format=JSON';

    try {
      // 
      const response = await axios.get(url, {
        headers: {
          "authorization": "Bearer " + api_token
        }
      });
      console.log('GetApiResponse成功取得回應');
      const tk2 = response.data;

      return tk2;
    } catch (error) {
      console.error('GetApiResponse axios失敗:', error);
    }
  }
  else {
    console.log('您的api token為:undefined');
  }
}