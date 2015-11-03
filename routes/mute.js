var express = require('express');
var router = express.Router();
var fs = require('fs');
var schedule = require('node-schedule');
var oauth = require('../fn/twtAuth.js');

/* GET /mute */
router.get('/', function(req, res, next) {
    if(!req.session.oauth) {
        res.redirect('../login');
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
        res.redirect('../login');
    } else {

        if (req.session.mute === undefined)
            req.session.mute = {};
        res.locals.mutelist = req.session.mute;

        var hour = parseInt(req.body.hour==='' ? 0 : req.body.hour);
        var minute = parseInt(req.body.minute==='' ? 0 : req.body.minute);
        var second = parseInt(req.body.second==='' ? 0 : req.body.second);

        var username = req.body.username;

        var time = hour * 3600 + minute * 60 + second;
        console.log('time is', time);

        if (time <= 0) {
            res.render('mute', { title: 'twfnjs : mute', mutemsg: '시간값은 0보다 커야합니다.'});
            return;
        } else if (username == '') {
            res.render('mute', { title: 'twfnjs : mute', mutemsg: '뮤트할 사용자의 이름을 적으세요.'});
            return;
        }

        oauth.post(
            'https://api.twitter.com/1.1/mutes/users/create.json',
            req.session.oauth.access_token,
            req.session.oauth.access_token_secret,
            {
                screen_name: username
            },
            // callback
            function(error, data) {
                if(error) {
                    console.log(require('sys').inspect(error));
                    res.render('mute', { title: 'twfnjs : mute (실패)', mutemsg: ('실패 : ' + error.statusCode + ', ' + error.data)});
                }
                else {
                    console.log('the return data is...');
                    //console.log(data);
                    var until = new Date().setSeconds(new Date().getSeconds() + time);

                    data = JSON.parse(data);

                    req.session.mute[data.id_str] = {
                        name: data.name,
                        screen_name: data.screen_name,
                        until: until,
                        duration: time
                    };

                    console.log(req.session.mute);

                    res.render('mute', { title: 'twfnjs : mute (성공)', mutemsg: '뮤트됨 : ' + data.name + ' (@' + data.screen_name + ')', refresh: time});
                    console.log('rendered!');

                    schedule.scheduleJob(until, function () {
                      oauth.post(
                          'https://api.twitter.com/1.1/mutes/users/destroy.json',
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
                                  console.log('removed " + data.id_str + ", ' + data.screen_name);
                                  var mutelist = req.session.mute;
                                  delete mutelist[data.id_str];
                                  req.session.mute = mutelist;
                                  console.log(req.session.mute);
                                  req.session.save();
                              }
                          }
                      );
                    });
                }
            }
        );



    }
});

// function scheduleUnmute(mute) {
//     oauth.post(
//         'https://api.twitter.com/1.1/mutes/users/destroy.json',
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
//                 console.log('removed " + data.id_str + ", ' + data.screen_name);
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
