angular.module('youtube', ['ng'])
    .run(function () {
        var tag = document.createElement('script');
        // This is a protocol-relative URL as described here:
        //     http://paulirish.com/2010/the-protocol-relative-url/
        // If you're testing a local page accessed via a file:/// URL, please set tag.src to
        //     "https://www.youtube.com/player_api" instead.
        //tag.src = "//www.youtube.com/player_api";
        tag.src = "//www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });