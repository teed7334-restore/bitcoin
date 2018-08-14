var bitcore = require('bitcore-lib');
var Message = require('bitcore-message');
var express = require('express');
var bodyParser = require('body-parser');
var explorers = require('bitcore-explorers');
var insight = new explorers.Insight("https://test-insight.bitpay.com", "testnet");
var app = express();

//設定預設為測試網路
bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

var bitcoin = {
    createMultiSignWallet: function (num, sign) { //新增多簽錢包
        let privateKeys = [];
        let publicKeys = [];
        for (i = 0; i < num; i++) {
            privateKey = bitcore.PrivateKey();
            publicKey = bitcore.PublicKey(privateKey);
            privateKeys.push(privateKey.toString());
            publicKeys.push(publicKey.toString());
        }
        let address = bitcore.Address(publicKeys, sign).toString();
        let json = {
            'privateKeys': privateKeys,
            'publicKeys': publicKeys,
            'address': address
        };
        return json;
    },
    buildScriptPublickKey: function(publicKeys, sign) { //打造多簽公鑰
        let redeemScript = bitcore.Script.buildMultisigOut(publicKeys, sign);
        let script = redeemScript.toScriptHashOut().toString();
        return script;
    },
    signMessage: function(privateKey, message) { //簽署密文
        sign = Message(message).sign(privateKey).toString();
        return sign;
    },
    createWallet: function(privateKey) { //新增單簽錢包
        if ('' !== privateKey) { //當使用者有指定私鑰時
            privateKey = new bitcore.PrivateKey(privateKey);
        } else { //當使用者不指定私鑰時
            privateKey = new bitcore.PrivateKey();
        }
        let address = privateKey.toAddress().toString();
        return address;
    },
    verifyMessage: function(address, message, sign) { //驗証簽署
        let verified = Message(message).verify(address, sign);
        return verified;
    },
    p2sh: function(res, publicKeys, privateKeys, sign, fromAddress, toAddress, fee, amount) { //透過P2SH打款
        insight.getUnspentUtxos(fromAddress, function(err, utxos) {
            if (err) {
                res.send(err);
                return;
            } else {
                var multiSigTx = new bitcore.Transaction();
                multiSigTx.from(utxos, publicKeys, sign);
                multiSigTx.change(fromAddress);
                multiSigTx.fee(fee);
                multiSigTx.to(toAddress, bitcore.Unit.fromBTC(amount).toSatoshis());
                multiSigTx.sign(privateKeys);
                multiSigTx = multiSigTx.toString();
                insight.broadcast(multiSigTx, function(err, returnedTxId) {
                    if (err) {
                        res.send(err);
                        return;
                    } else {
                        res.json({ transaction_id: returnedTxId });
                    }
                });
            }
        });
    }
}

app.use(bodyParser.urlencoded({ extended: true })); //啟用HTTP POST

app.post('/createMultiSignWallet', function(req, res, next) { //新增多簽錢包路由
    let num = parseInt(req.body.num) || 0; //私鑰數
    let sign = parseInt(req.body.sign) || 0; //簽署人
    let maxNum = 15;

    if (0 >= num || 0 >= sign || num < sign || maxNum < num || maxNum < sign) { //當私鑰少於或多於十五把，簽署人大於私鑰數時
        res.send("");
        return;
    }

    let json = bitcoin.createMultiSignWallet(num, sign);
    json = JSON.stringify(json);
    res.send(json);
    return;
});

app.post('/signMessage', function(req, res, next) { //簽署訊息路由
    let privateKey = req.body.privateKey;
    let message = req.body.message;

    result = bitcoin.signMessage(privateKey, message);
    res.send(result);
    return;
});

app.post('/buildScriptPublickKey', function(req, res, next) { //打造多簽公鑰路由
    let publicKeys = req.body.publicKeys;
    let sign = parseInt(req.body.sign) || 0;

    if (0 >= sign || 15 < sign) { //當簽署人數等於零或大於15
        res.send("");
        return;
    }

    result = bitcoin.buildScriptPublickKey(publicKeys, sign);
    res.send(result);
    return;
});

app.post('/createWallet', function(req, res, next) { //新增單簽錢包路由
    let privateKey = req.body.privateKey || '';

    result = bitcoin.createWallet(privateKey);
    res.send(result);
    return;
});

app.post('/verifyMessage', function(req, res, next) { //驗証簽署路由
    let address = req.body.address;
    let message = req.body.message;
    let sign = req.body.sign;

    result = bitcoin.verifyMessage(address, message, sign);
    res.send(result);
    return;
});

app.post('/p2sh', function(req, res, next) { //透過P2SH打款路由
    let publicKeys = req.body.publicKeys;
    let privateKeys = req.body.privateKeys;
    let sign = parseInt(req.body.sign) || 0;
    let fromAddress = req.body.fromAddress;
    let toAddress = req.body.toAddress;
    let fee = parseFloat(req.body.fee) || 5000;
    let amount = parseFloat(req.body.amount) || 0;
    
    if (0 >= sign || 0 >= amount) { //當簽署人小於等於0或是轉賬金額小於等於0
        res.send("aaa");
        return;
    }

    bitcoin.p2sh(res, publicKeys, privateKeys, sign, fromAddress, toAddress, fee, amount);
    return;
});

app.listen(3000, function() { //監聽端口

});