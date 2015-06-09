var express = require('express');
var router = express.Router();
var fs = require('fs');
var OAuth = require('oauth').OAuth;
var oauth = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      "your_twitter_consumer_key",
      "your_twitter_consumer_secret",
      "1.0A",
      null, //null,  // my site callback
      "HMAC-SHA1"
);

// 나중에 갈아엎기 (뭔소리냐 이게)
// var muteuser = {}; // userinfo, mutelist
// fs.readFile('./mutelist/mutelist.json', function (err, data) {
//     if (err) {
//         fs.writeFile('./mutelist/mutelist.json', JSON.stringify(muteuser), function (err) {
//             if (err) throw err;
//         });
//     } else {
//         muteuser = JSON.parse(data);
//         // each for object http://stackoverflow.com/questions/11846484/each-for-object
//         for(var index in muteuser) {
//             if (muteuser.hasOwnProperty(index)) {
//                 var mutelist = muteuser[index];
//                 for(var index in mutelist) {
//                     if (muteuser.hasOwnProperty(index)) {
//                         //var attr = mutelist[index];
//                         scheduleUnmute(mutelist[index]);
//                     }
//                 }
//             }
//         }
//    }
// });

/* GET /mute */
router.get('/', function(req, res, next) {
    if(!req.session.oauth) {
        res.redirect("../login");
    } else {

        if (req.session.mute === undefined)
            req.session.mute = {};
        res.locals.mutelist = req.session.mute;

        console.log(req.session.mute);
        res.render('mute', { title: 'twfnjs : mute' });
    }
});

router.post('/', function(req, res, next) {
    if(!req.session.oauth) {
        res.redirect("../login");
    } else {

        if (req.session.mute === undefined)
            req.session.mute = {};
        res.locals.mutelist = req.session.mute;

        var hour = parseInt(req.body.hour===""?0:req.body.hour);
        var minute = parseInt(req.body.minute===""?0:req.body.minute);
        var second = parseInt(req.body.second===""?0:req.body.second);

        var username = req.body.username;

        var time = hour * 3600 + minute * 60 + second;
        console.log("time is", time);

        if (time <= 0) {
            res.render('mute', { title: 'twfnjs : mute', mutemsg: '시간값은 0보다 커야합니다.'});
            return;
        } else if (username == "") {
            res.render('mute', { title: 'twfnjs : mute', mutemsg: '뮤트할 사용자의 이름을 적으세요.'});
            return;
        }

        oauth.post(
            "https://api.twitter.com/1.1/mutes/users/create.json",
            req.session.oauth.access_token,
            req.session.oauth.access_token_secret,
            {
                screen_name: username
            },
            // callback
            function(error, data) {
                if(error) {
                    console.log(require('sys').inspect(error));
                    res.render('mute', { title: 'twfnjs : mute (실패)', mutemsg: ('실패 : ' + error.statusCode + ", " + error.data)});
                }
                else {
                    console.log("the return data is...");
                    //console.log(data);

                    data = JSON.parse(data);
                    req.session.mute[data.id_str] = {
                        name: data.name,
                        screen_name: data.screen_name,
                        until: new Date().setSeconds(new Date().getSeconds() + time),
                        duration: time
                    };

                    console.log(req.session.mute);

                    res.render('mute', { title: 'twfnjs : mute (성공)', mutemsg: '뮤트됨 : ' + data.name + " (@" + data.screen_name + ")", refresh: time});
                    console.log("rendered!");

                    var timerNum = setTimeout(function () {
                        //console.log("removed " + this.screen_name + " from mute");
                        //console.log(data.screen_name);

                        oauth.post(
                            "https://api.twitter.com/1.1/mutes/users/destroy.json",
                            req.session.oauth.access_token,
                            req.session.oauth.access_token_secret,
                            {
                                screen_name: username
                            },
                            // callback
                            function(error, data) {
                                if (error) {
                                    console.log(require('util').inspect(error));
                                } else {
                                    //console.log(data);
                                    data = JSON.parse(data);
                                    console.log("removed " + data.id_str + ", " + data.screen_name);
                                    var mutelist = req.session.mute;
                                    delete mutelist[data.id_str];
                                    req.session.mute = mutelist;
                                    console.log(req.session.mute);
                                    req.session.save();
                                }
                            }
                        );
                    }, time*1000);
                    console.log(timerNum);


                }
            }
        );



    }
});

// function scheduleUnmute(mute) {
//     oauth.post(
//         "https://api.twitter.com/1.1/mutes/users/destroy.json",
//         req.session.oauth.access_token,
//         req.session.oauth.access_token_secret,
//         {
//             screen_name: username
//         },
//         // callback
//         function(error, data) {
//             if (error) {
//                 console.log(require('util').inspect(error));
//             } else {
//                 //console.log(data);
//                 data = JSON.parse(data);
//                 console.log("removed " + data.id_str + ", " + data.screen_name);
//                 var mutelist = req.session.mute;
//                 delete mutelist[data.id_str];
//                 req.session.mute = mutelist;
//                 console.log(req.session.mute);
//                 req.session.save();
//             }
//         }
//     );
// }
module.exports = router;
