var OAuth = require('oauth').OAuth;
var keys = require('../config/keys.json');
var oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      keys.customer_key,
      keys.customer_secret,
      '1.0A',
      null, //null,  // my site callback
      'HMAC-SHA1'
);

module.exports = oauth;
