var express = require('express');
var router = express.Router();

// http://codetheory.in/how-to-use-twitter-oauth-with-node-oauth-in-your-node-js-express-application/

/* GET /logout */
router.get('/', function(req, res, next) {
    if(req.session.oauth) {
        req.session.destroy();
    }
    res.redirect("../");
});

module.exports = router;
