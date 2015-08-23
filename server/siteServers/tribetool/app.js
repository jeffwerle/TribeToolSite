// "C:\Program Files\MongoDB 2.6 Standard\bin\mongod.exe"

/**
 * Module dependencies
 */
var express = require('express');
var path = require('path');
var modRewrite = require('connect-modrewrite');
var http = require('http');
var bodyParser  = require('body-parser');
var request = require('request');
var jsdom = require('jsdom');

var app = express();

console.log('Entering TribeTool app.js...');


app.use(require('prerender-node').set('prerenderToken', 'anLtBOT9jOp1mhVckIqr'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


// Redirect http:// to https://
app.all('*', function ensureSecure(req, res, next){
    if(!req.secure) {
        return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
    }
    next();
});


// Socket connections} };
var connections = {};

// This must go BEFORE any other routes so that requests will come here instead
// of going to angular.
var processSocketPush = function (req, res) {

    if(req.params.key !== 'as32eouhe!f78329!sefhs57a73') {
        // Invalid request, pass to the next matching route
        console.log('invalid');
        return next();
    }

    console.log(req.params.action);
    console.log(req.body);

    var emit = function(target) {
        if(!target)
            return;
        target.emit(req.params.action, {
            data: req.body,
            communityId: req.params.communityId ? req.params.communityId : null
        });
    };

    if(req.params.accountId) {
        var a = connections[req.params.accountId];
        if(!a) {
            // Account is not connected
            res.send(200);
        }
        else {
            emit(a);
        }
    }
    else {
        // Push to everyone
        for(var p in connections) {
            emit(connections[p]);
        }
        res.send(200);
    }

};

// For sending an action to a specific account in a specific community
app.post('/tt/m/:key/:action/:communityId/:accountId', processSocketPush);

// For sending an action to an entire community, regardless of account
app.post('/tt/m/:key/:action/:communityId', processSocketPush);

// For sending an action to an account, regardless of community
// Notice the "/tta/" instead of "/tt/" in route
app.post('/tta/m/:key/:action/:accountId', processSocketPush);


// This is so we can use html5Mode (i.e. no hashbangs)
// Each time the user requests a page that doesn't ask for a specific MIME type (i.e. .html, .js, .css, etc.
// then we will navigate to index.html
app.use(modRewrite(['!\\.html|\\.js|\\.css|\\.jpeg|\\.svg|\\.gif|\\.ttf|\\.woff|\\.eot|\\.xml|\\.ico|\\.mp3|\\.wav|\\.jpg|\\.png$ /index.html [L]']));

// Any time the user requests '/{whatever else}', we will serve them
// the angular app. So if they request '/app-templates/contact.html', we will serve them
// '/sites/bazzle/build/app-templates/contact.html' which is the correct location
var staticPath = path.join(__dirname, '../../..', '/sites/tribetool/build');
console.log(staticPath);
app.use('/', express.static(staticPath));





var https = require('https');
var fs = require('fs');
var options = {
    key: fs.readFileSync('siteServers\\tribetool\\tribetool.com.pem'),
    cert: fs.readFileSync('siteServers\\tribetool\\2cbcf3385a6fac5a.crt'),
    ca: [
        fs.readFileSync('siteServers\\tribetool\\intermediate1.pem', 'utf8'),
        fs.readFileSync('siteServers\\tribetool\\intermediate2.pem', 'utf8'),
        fs.readFileSync('siteServers\\tribetool\\intermediate3.pem', 'utf8')
    ]
};


var server = https.createServer(options, app).listen(443);
//var server = http.createServer(app).listen(80);

var io = require('socket.io')(server);



console.log('initializing io...');
// https://github.com/Automattic/socket.io/blob/master/examples/chat/index.js
// https://github.com/gautamrege/pusher/blob/master/notify.js
io.on('connection', function(socket) {
    var socketId = socket.conn.id;
    console.log('Socket connecting: ' + socketId + '...');

    connections[socketId] = socket;
    socket.on('login', function(accountId) {
        console.log('AccountId logging in: ' + accountId + '...');
        connections[accountId] = socket;
        delete connections[socketId];
    });
    socket.on('logout', function(accountId) {
        console.log('AccountId logging out: ' + accountId + '...');
        //connections[accountId] = null;
        delete connections[accountId];
        connections[socketId] = socket;
    });

    /* Emits ytvComplete upon completion with: {
                                                    videoId: string,
                                                    urls: []
    *                                           }
    *                                           on error: {
    *                                            videoId: string,
    *                                            err: string
    *                                           }
    * */
    socket.on('ytv', function(videoId) {
        console.log('YouTube Video Request. SocketId: ' + socketId + '. videoId: ' + videoId);



        var retrieveYouTubeUrls = function() {


            jsdom.env({
                url: 'https://www.youtube.com/watch?v=' + videoId,
                scripts: ['http://code.jquery.com/jquery.js'],
                features : {
                    FetchExternalResources : ['script'],
                    ProcessExternalResources : ['script']
                },
                done: function (errors, window) {
                    //var $ = window.$;

                    var cleanup = function() {
                        // free memory associated with the window
                        window.close();
                    };
                    var onError = function(err) {
                        // Tell the socket that we have an error
                        socket.emit('ytvComplete', {
                            videoId: videoId,
                            error: err
                        });

                        cleanup();
                    };

                    if(errors) {
                        //console.log(errors);
                    }

                    var getUrls = function() {
                        // See http://superuser.com/questions/773719/how-do-all-of-these-save-video-from-youtube-services-work
                        // and more specifically https://github.com/svnpenn/bm/blob/gh-pages/yt.js
                        // For Vimeo: https://github.com/svnpenn/bm/blob/gh-pages/vimeo.js
                        var ytplayer = window.ytplayer;

                        function qry(sr) {
                            var qa = [];
                            var a = sr.split('&');
                            for(var i = 0; i < a.length; i++) {
                                var prs = a[i];
                                var pra = prs.split('=');
                                qa[pra[0]] = pra[1];
                            }
                            return qa;
                        }

                        function sprintf(nw) {
                            var i = 0;
                            while (/%s/.test(nw))
                                nw = nw.replace('%s', arguments[++i])
                            return nw;
                        }

                        var qua = {
                            _141: '256k AAC',
                            _140: '128k AAC',
                            _251: '160k Opus',
                            _250: '70k Opus',
                            _249: '50k Opus',
                            _171: '128k Vorbis',
                            _22: '720p H.264 192k AAC',
                            _84: '720p 3D 192k AAC',
                            _18: '360p H.264 96k AAC',
                            _82: '360p 3D 96k AAC',
                            _36: '240p MPEG-4 36k AAC',
                            _17: '144p MPEG-4 24k AAC',
                            _43: '360p VP8 128k Vorbis',
                            _100: '360p 3D 128k Vorbis',
                            _5: '240p H.263 64k MP3',
                            _138: '1440p 4400k H.264',
                            _264: '1440p 3700k H.264',
                            _137: '1080p H.264',
                            _136: '720p H.264',
                            _135: '480p H.264',
                            _134: '360p H.264',
                            _133: '240p H.264',
                            _160: '144p H.264',
                            _271: '1440p VP9',
                            _248: '1080p VP9',
                            _247: '720p VP9',
                            _244: '480p VP9',
                            _243: '360p VP9',
                            _242: '240p VP9',
                            _278: '144p VP9'
                        };

                        // Used to ensure there are no CORS issues
                        function curl(url, callback) {
                            /* cors-anywhere.herokuapp.com */
                            request('https://allow-any-origin.appspot.com' + url,
                                function (error, response, html) {
                                    if (!error && response.statusCode == 200) {
                                        callback(html);
                                    }
                                    else {
                                        // error
                                        onError(error);
                                    }
                                });
                        }

                        var args = [
                            ytplayer.config.args.adaptive_fmts,
                            ytplayer.config.args.url_encoded_fmt_stream_map
                        ].join(',').split(',');


                        var validUrls = [];
                        var onComplete = function() {
                            // Send our valid Urls to the socket

                            socket.emit('ytvComplete', {
                                videoId: videoId,
                                urls: validUrls
                            });


                            cleanup();
                        };

                        var i = -1;
                        var fcnm, rpt;
                        var iterateLoop = function() {
                            i++;
                            if(i >= args.length) {
                                onComplete();
                                return;
                            }
                            var frt = args[i];
                            var qst = qry(frt);
                            var qty = qua['_' + qst.itag] || qst.itag;

                            var hrf = unescape(qst.url);

                            // Called when our hrf is ready to add to oru validUrls array
                            var addUrl = function() {
                                var videoTitle = ytplayer.config.args.title;
                                if(typeof(qst.bitrate) === 'undefined' && qst.quality !== 'small') {
                                    validUrls.push(hrf);
                                }

                                iterateLoop();
                            };

                            if (qst.s) {
                                // Called when we have fcnm correctly defined and can add &signature
                                // to our url
                                var applySignature = function() {
                                    hrf += '&signature=' + eval(sprintf('%s("%s")', fcnm, qst.s));

                                    addUrl();
                                };

                                if (typeof rpt == 'undefined') {
                                    curl('https:' + ytplayer.config.assets.js, function(html) {
                                        rpt = html.replace(/^\(function\(\){/, '').replace(/}\)\(\);\n$/, '');
                                        try {eval(rpt)} catch(e) {}
                                        fcnm = /signature\W+(\w+)/.exec(rpt)[1];
                                        applySignature();
                                    });
                                }
                                else {
                                    applySignature()
                                }
                            }
                            else {
                                if (qst.sig)
                                    hrf += '&signature=' + qst.sig;

                                addUrl();
                            }


                            //qua['_' + qst.itag] = hrf;
                        };
                        iterateLoop();




                    };




                    // Wait until our ytplayer is initialized on the page
                    var totalTimeout = 10* 1000;
                    var currentTimeout = 0;
                    var timeoutInterval = 100;
                    var poll = function() {
                        var timeOut = null;
                        var callback = function() {
                            currentTimeout += timeoutInterval;
                            clearTimeout(timeOut);
                            if(window.ytplayer) {
                                getUrls();
                            }
                            else {
                                if(currentTimeout >= totalTimeout) {
                                    onError('Timeout');
                                }
                                else {
                                    poll();
                                }
                            }
                        };

                        timeOut = setTimeout(callback, timeoutInterval);
                    };
                    poll();


                }
            });
        };
        retrieveYouTubeUrls();


    });

    socket.on('disconnect', function() {
        console.log('Socket disconnecting: ' + socketId + '...');
        delete connections[socketId];
        //delete connections[accountId];
    });
});







// Make is so that the main app can call this app
exports.app = app;
// There is no need for .listen()