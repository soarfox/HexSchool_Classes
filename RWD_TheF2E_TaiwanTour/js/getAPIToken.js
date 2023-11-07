async function GetAuthorizationHeader() {
  const auth_url = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';

  // 要發送的資料, 且要使用URLSearchParams()方式, 才能搭配headers將Content-Type轉成TDX官方的要求的'application/x-www-form-urlencoded'格式
  const parameter = new URLSearchParams();
  parameter.append('grant_type', 'client_credentials');
  parameter.append('client_id', 'soarfox-29385fbf-7122-452b');
  parameter.append('client_secret', 'f9a58f5a-a796-4354-abfd-89103324cf40');

  // 因為axios預設是content-type: application/json, 但是依照TDX官方的要求, headers內的content type務必要指定使用'application/x-www-form-urlencoded'格式, 才能成功取得API token 
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // 設定Accept-Encoding為TDX官方所指定的值('br,gzip'), 藉此向伺服器表明我希望接收經過br和gzip壓縮演算法壓縮之後的回應資料
      'Accept-Encoding': 'br,gzip',
    },
  };

  try {
    // 因為TDX API預設提供的資料是JSON格式, 而axios本身就預設是接收JSON的格式, 因此當使用axios時, 便不需要將所接收到的資料轉換成JSON格式了, 而是它已經是物件/字串/陣列...等型態的資料了
    const response = await axios.post(auth_url, parameter, config);
    const tk = response.data.access_token;
    return tk;
  } catch (error) {
    console.error('GetAuthorizationHeader失敗:', error);
    throw error;
  }
};

// 將 API token存儲在 Cookie 中 (在TDX的API說明裡提到, 每次取得的token在24小時後將自動失效), 以利不同內頁或網頁分頁使用
function setTokenToCookie(token) {
  try {
    // 因本機端測試只有http, 而沒有https, 故本機測試時需要拿掉 secure; 和 HttpOnly, 以利測試; 設定secure屬性, 代表瀏覽器只會在透過https安全連接傳輸時才會傳送該cookie; 設定 HttpOnly 屬性的 cookie, 只能透過http或https協議進行訪問，而無法透過JavaScript訪問, 這有助於減少"跨網站指令碼(XSS)"風險, 因為即使攻擊者成功加入惡意指令碼, 也無法訪問受保護的cookie, 故在有https的github上的專案應將下方改為: document.cookie = `apiToken=${token}; path=/; secure; HttpOnly`;
    // 下方為本機測試用; 使用一對反引號(`), 形成樣板字面值, 裡面可直接用${}放入變數
    document.cookie = `apiToken=${token}; path=/;`;
  }
  catch (error) {
    // console.log('setTokenToCookie失敗:', error);
    throw error;
  }
};

// 從 Cookie 中取得 API token
function getTokenFromCookie() {
  const cookies = document.cookie.split('; ');
  // 若沒有cookie存在, 則上句進行分割後會得到一個空字串的值
  if (cookies.length === 0) {
    return null;
  }
  // 若沒有返回null則代表有值, 進行切割並找出token內容
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === 'apiToken') {
      // console.log('從 Cookie 中取得 API token=', value)
      return value;
    }
  }
};

async function checkAPIToken() {
  let token = getTokenFromCookie();
  // 實測後若是沒有取得cookie的內容, 則會得到undefined
  if (token !== undefined) {
    return token;
  }
  // 如token為null則重新取得API Token資料, 且記得要將token回傳出去
  else {
    token = await GetAuthorizationHeader();
    setTokenToCookie(token);
    return token;
  }
}

export { checkAPIToken };
