# bitcoin
用NodeJS開發取得多簽錢包位置與交易

## 如何啟動
1. 本機需有安裝Docker
2. 進入/dev_env資料夾
3. ./bitcoin.sh
4. cd /app
5. node server.js

## 需安裝的套件
1. bitcore-lib
2. bitcore-message
3. express
4. body-parser
5. bitcore-explorers

## 可用API
新增多簽錢包 - [http://localhost:3000/createMultiSignWallet](http://localhost:3000/createMultiSignWallet)

參數：

    num = Int [需要多少公/私鑰]

    sign = Int [需要多少簽署者]

回傳︰

    String [錢包位址]

---
簽署訊息 - [http://localhost:3000/signMessage](http://localhost:3000/signMessage)

參數︰

    privateKey = String [私鑰]

    message = String [訊息內容]

回傳︰

    String [簽署訊息]

---
新增單簽錢包 - [http://localhost:3000/createWallet](http://localhost:3000/createWallet)

參數︰

    privateKey = String [私鑰] [選填]

回傳︰

    String [錢包位址]

---
驗証簽署 - [http://localhost:3000/verifyMessage](http://localhost:3000/verifyMessage)

參數︰

    address = String [錢包位址]

    sign = String [簽署訊息]

    message = String [原始訊息]

回傳︰

    Bool [true:成功|false:失敗]

---
打造多簽公鑰 - [http://localhost:3000/buildScriptPublickKey](http://localhost:3000/buildScriptPublickKey)

參數︰

    publicKeys = Array [公鑰1, 公鑰2, 公鑰3...]

回傳︰

    String [多簽公鑰]

---
多簽轉賬交易 - [http://localhost:3000/p2sh](http://localhost:3000/p2sh)

參數︰

    publicKeys = Array [公鑰1, 公鑰2, 公鑰3...]

    privateKeys = Array [私鑰1, 私鑰2, 私鑰3...]

    sign = Int [需要多少簽署者]

    fromAddress = String [轉賬者錢包位址]

    toAddress = String [被轉賬者錢包位址]

    fee = Float [礦工手續費]

    amount = Float [轉賬面額]

回傳︰

    String [TXID]

---

## 目錄結構

    /dev_env 啟動Docker ShellScript
    /node_modules npm install安裝套件用資料夾
    server.js 主程式