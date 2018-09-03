var express = require('express');
var router = express.Router();

var soap = require('soap');
var url = 'https://nl.asr-gooyesh.com/NevisaLiveService.asmx?wsdl';
var soapClient = null;
soap.createClientAsync(url).then((client) => {
    console.log("Setup OK!");
    soapClient = client;
}).catch((error) => {
    console.log("Error setting up!");
    console.log(error);
    process.exit(1);
})

router.post('/connect', function(req, res, next) {
    soapClient.AuthenticateUserAsync({
        userName: req.body.userName,
        password: req.body.password
    }).then((response) => {
        if(response[0] != null) {
            var resp = response[0].AuthenticateUserResult
            if(resp != null 
                && resp.Authenticated
                && resp.Activated
                && resp.UserCredit.HasCredit) {
                    console.log("New user connected(", resp.GUID,"), credit data: ", resp.UserCredit);
                    res.send({
                        success: true,
                        guid: resp.GUID
                    });
                } else {
                    res.send({
                        success: false,
                        guid: null
                    });
                }
        } else {
            res.send({
                success: false,
                guid: null
            });
        }
    }).catch((error) => {
        console.log("Error!");
        res.send({
            success: false,
            guid: null
        });
    })
});

router.post('/update', function(req, res, next) {
    soapClient.UpdateUserSessionAsync({
        guid: req.body.guid
    }).then((response) => {
        if(response[0] != null) {
            var resp = response[0].UpdateUserSessionResult
            if(resp != null
                && resp.UserCredit.HasCredit) {
                    console.log("User updated(", req.body.guid,"), credit data: ", resp.UserCredit);
                    res.send({
                        success: true
                    });
                    return;
                }
        }
        if( response[1].includes('UpdateUserSessionResponse') ){
            console.log("User updated(", req.body.guid,"), credit data: ", resp.UserCredit);
            res.send({
                success: true
            })
        } else {
            res.send({
                success: false
            })
        }
    }).catch((error) => {
        res.send({
            success: false
        })
    })
});

router.post('/disconnect', function(req, res, next) {
    soapClient.DisconnectUserAsync({
        guid: req.body.guid
    }).then((response) => {
        if( response[1].includes('DisconnectUserResponse') ){
            console.log("disconnected user(", req.body.guid,")");
            res.send({
                success: true
            })
        } else {
            res.send({
                success: false
            })
        }
    }).catch((error) => {
        res.send({
            success: false
        })
    })
});

module.exports = router;
