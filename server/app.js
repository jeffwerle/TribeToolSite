// cd /d H:\documents\WebStorm Projects\SongwritingTheory\server
/**
 * Module dependencies
 */
var express = require('express');
var connect = require('connect');
var vhost = require('vhost');


// Main app
var app = express();

var server = require('http').createServer(app).listen(80);

// https://github.com/Automattic/socket.io/blob/master/examples/chat/index.js
//var io = require('socket.io')(server);

// vhost apps
var tribetool = require('./siteServers/tribetool/app.js').app;
var tribetoolSubdomains = require('./siteServers/tribetool/subdomains/app.js').app;
var catchall = require('./siteServers/catchall/app.js').app;

app.use(require('prerender-node').set('prerenderToken', 'anLtBOT9jOp1mhVckIqr'));

// apply thevhost middleware, before the router middleware
// http://www.hacksparrow.com/vhost-in-express-js.html
// http://www.jondev.net/articles/vHosts_with_Node.JS_and_Express
app.use(vhost('tribetool.com', tribetool));
app.use(vhost('*.tribetool.com', tribetoolSubdomains));
app.use(vhost('*', tribetool));






console.log('listening...');