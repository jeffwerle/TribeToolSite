var express = require('express');

var app = express();

// Redirect to tribetool.com
app.use(function(req, res){
    res.redirect('http://tribetool.com'+req.url)
});

// Make is so that the main app can call this app
exports.app = app;
// There is no need for .listen()