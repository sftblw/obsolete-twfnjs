var express = require('express');
var router = express.Router();

// http://codetheory.in/how-to-use-twitter-oauth-with-node-oauth-in-your-node-js-express-application/

var OAuth = require('oauth').OAuth;
var oauth = new OAuth(
      "https://api.twitter.com/oauth/request_token",
      "https://api.twitter.com/oauth/access_token",
      "your_twitter_consumer_key",
      "your_twitter_consumer_secret",
      "1.0A",
      null,//"http://localhost:3000/login/callback", //null,  // my site callback
      "HMAC-SHA1"
);


/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('login', { title: 'login with twitter' });
    oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
        if (error) {
            console.log(error);
            res.send("Authentication Failed!");
        }
        else {
            req.session.oauth = {
                token: oauth_token,
                token_secret: oauth_token_secret
            };
            console.log(req.session.oauth);
                res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
        }
    });
});

router.get('/callback', function(req, res, next) {
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth_data = req.session.oauth;

    oauth.getOAuthAccessToken(
      oauth_data.token,
      oauth_data.token_secret,
      oauth_data.verifier,
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if (error) {
          console.log(error);
          res.send("Authentication Failure!");
        }
        else {
          req.session.oauth.access_token = oauth_access_token;
          req.session.oauth.access_token_secret = oauth_access_token_secret;
          req.session.oauth.results = results;
          console.log("oauth callback Successful!", results, req.session.oauth);
          //res.send("Authentication Successful");
          res.redirect('../'); // You might actually want to redirect!
        }
      }
    );
  }
  else {
    res.redirect('../'); // Redirect to login page
  }

});

module.exports = router;
