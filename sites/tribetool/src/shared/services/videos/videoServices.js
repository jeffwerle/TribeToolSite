angular.module('app.Services')
    .factory('videoService', ['uiService', 'mediaService', '$window', '$socket', function(uiService, mediaService, $window, $socket) {

        var ytvCallbacks = [];
        var service = {
            getPlayerVars: function() {
                return {
                    'autohide': 1,
                    'enablejsapi': 1,
                    'iv_load_policy': 3,
                    'origin': $window.location.origin
                };
            },
            calculateDimension: function(element, maxHeight) {
                var targetWidth = 470;
                var targetHeight = 265;
                var width = targetWidth;

                var parentWidth = uiService.getParentWidth(element);

                if(width > parentWidth) {
                    width = parentWidth;
                }
                if(width > mediaService.viewport.width) {
                    width = mediaService.viewport.width;
                }

                var height = (targetHeight/targetWidth) * width;
                if(maxHeight && height > maxHeight) {
                    height = maxHeight;
                    width = (targetWidth/targetHeight) * height;
                }

                return {
                    height: height,
                    width: width
                };
            },
            getYouTubeUrlSource: function(videoId, onSuccess, onError) {
                ytvCallbacks.push({
                    videoId: videoId,
                    onSuccess: onSuccess,
                    onError: onError
                });

                $socket.emit('ytv', videoId);
            }

        };

        $socket.on('ytvComplete', function(data) {
            // Find our callback
            for(var i = 0; i < ytvCallbacks.length; i++) {
                var callbackData = ytvCallbacks[i];
                if(callbackData.videoId === data.videoId) {
                    // deregister our callback
                    ytvCallbacks.splice(i, 1);

                    if(data.err) {
                        callbackData.onError(data.err);
                    }
                    else {
                        callbackData.onSuccess(data.urls);
                    }
                    break;
                }
            }
        });

        return service;
    }]);