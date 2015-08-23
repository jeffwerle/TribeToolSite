angular.module('app.Directives')
    .directive('youtubeMobile', ['toolbarService', 'formatterService', '$timeout', 'videoService', 'youtubeService', '$ionicPlatform', '$compile', 'route', function (toolbarService, formatterService, $timeout, videoService, youtubeService, $ionicPlatform, $compile, route) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="video-container" >' +
                    // We'll put a div overlay on the player so that the user can scroll over the created iframe on mobile
                    '<div class="video-overlay-container" style="position: relative;" ng-style="{\'width\': width, \'height\': height}">' +
                        '<div class="video-overlay" style="position: absolute; top: 0; left: 0; z-index: 1;" ng-style="{\'width\': width, \'height\': height - (form.hasAttemptedStart ? 35 : 0)}"></div>' +
                        '<div id="{{playerId}}" style="position:absolute; top: 0; left: 0; height: 100%; width: 100%;"></div>' +
                    '</div>' +

                    '<div style="margin-bottom:10px;">' +
                        '<video-toolbar video-id="{{videoId}}"></video-toolbar>' +
                    '</div>' +
                '</div>',
            scope: {
                videoId: '@?',
                hidePin: '=?',
                maxHeight: '=?'
            },
            controller: ['$scope', 'uiService', function($scope, uiService) {
                $scope.playerId = uiService.getGuid();
                $scope.form = {
                    playing: false,
                    hasAttemptedStart: false,
                    hasStarted: false
                };
            }],
            link: function (scope, element, attrs) {
                var videoOverlay = element.find('.video-overlay');

                scope.removeAlternatePlayer = function() {
                    if(scope.youtubeUrlSourceElement) {
                        scope.youtubeUrlSourceElement.remove();
                        scope.youtubeUrlSourceElement = null;
                    }
                };

                scope.getPlayerElement = function() {
                    return $('#' + scope.playerId);
                };

                scope.onSuccessfulPlay = function() {
                    videoOverlay.show();
                    scope.form.hasAttemptedStart = true;
                    scope.form.playing = true;
                    if(!scope.form.hasStarted) {
                        scope.form.hasStarted = true;
                        scope.$on('routeChangeSuccess', function() {
                            if(route.getCurrentRoute() === scope.creationRoute) {
                                scope.form.hasAttemptedStart = false;
                                if(scope.youtubeUrlSourceHtml) {
                                    // Add our iframe
                                    // back when we return (since we don't have access to the controls to stop the video).
                                    scope.createPlayer();
                                }
                                else {
                                    // We're playing the video using the YouTube API
                                }
                            }
                            else {
                                if(scope.youtubeUrlSourceHtml) {
                                    // We're navigating away from the page on which this video exists--remove
                                    // the video element so that it stops playing. We'll put our original video
                                    // back when we reload the view.
                                    scope.removeAlternatePlayer();

                                    if(scope.player)
                                        scope.getPlayerElement().show();
                                }
                                else {
                                    // We're playing the video using the YouTube API
                                    // Stop the video since we're navigating away from this view
                                    if(scope.player)
                                        scope.player.pauseVideo();
                                }
                            }
                        });
                    }
                };

                scope.hideLoading = function() {
                    if(scope.loadingElement) {
                        scope.loadingElement.remove();
                        scope.loadingElement = null;
                    }
                };

                scope.hidePlayer = function() {
                    scope.getPlayerElement().hide();
                };

                scope.hideVideoAndShowLoading = function() {
                    scope.hidePlayer();
                    if(!scope.loadingElement) {
                        scope.loadingElement = $compile('<loading></loading> Loading Video...')(scope);
                        videoOverlay.after(scope.loadingElement);
                    }
                };

                videoOverlay.on('tap', function(e){
                    scope.form.hasAttemptedStart = true;
                    videoOverlay.hide();
                    scope.$apply(function() {
                        if(scope.player) {
                            if(scope.player.getPlayerState() === 1) {
                                // video is currently playing so let's pause it.
                                scope.player.pauseVideo();
                            }
                            else {
                                scope.hideVideoAndShowLoading();
                                // Wrap in $timeout to give us time to hide the player
                                // We don't want to present youtube errors to the user
                                $timeout(function() {
                                    // If we already have the source url, just skip straight
                                    // to the alternate player
                                    if(scope.youtubeUrlSourceHtml) {
                                        scope.onYouTubeError();
                                    }
                                    else {
                                        scope.player.playVideo();
                                    }
                                });
                            }
                        }
                    });
                });

                // What's the route on which we were created?
                scope.creationRoute = route.getCurrentRoute();

                scope.onYouTubeError = function() {
                    if(scope.player)
                        scope.player.destroy();

                    if(!scope.playerElement) {
                        scope.playerElement = $('#' + scope.playerId);
                    }

                    var createIFrame = function() {
                        scope.removeAlternatePlayer();
                        scope.youtubeUrlSourceElement = $(scope.youtubeUrlSourceHtml);
                        videoOverlay.before(scope.youtubeUrlSourceElement);

                        scope.hideLoading();

                        scope.getPlayerElement().hide();

                        scope.onSuccessfulPlay();
                    };

                    if(scope.youtubeUrlSourceHtml) {
                        // We already have the youtube source so let's skip right to creating the iframe
                        createIFrame();
                    }
                    else {
                        // Get a different url for the video
                        videoService.getYouTubeUrlSource(scope.videoId, function(urls) {

                            if(urls.length > 0) {
                                var url = urls[0];
                                scope.youtubeUrlSourceHtml = '<iframe src="' + url + '" style="position:absolute; top: 0; left: 0; height: 100%; width: 100%;"></iframe>';

                                createIFrame();
                            }
                            else {
                                // No urls found!
                                // Show the player (and consequently the youtube error)
                                scope.playerElement.show();
                            }

                        }, function(error) {
                            //console.log('TRIBETOOL: getYouTubeUrlSource error: ' + error);
                        });
                    }
                };


                scope.createPlayer = function() {
                    var create = function() {
                        $ionicPlatform.ready(function() {
                            scope.player = youtubeService.createPlayer(scope.playerId, {
                                width : scope.width,
                                height : scope.height,
                                videoId : scope.videoId,
                                playerVars: videoService.getPlayerVars(), // This is where params go https://developers.google.com/youtube/player_parameters#controls
                                events : {
                                    'onYouTubePlayerReady': function(event) {
                                        if(scope.youtubeUrlSourceHtml) {
                                            scope.hideVideoAndShowLoading();
                                            scope.onYouTubeError();
                                        }
                                        else {
                                            if(scope.playerElement) {
                                                scope.playerElement.show();
                                            }
                                        }



                                    },
                                    'onError': function(event) {
                                        scope.onYouTubeError();
                                    },
                                    'onStateChange': function(event) {
                                        if(!scope.playerElement) {
                                            scope.playerElement = $('#' + scope.playerId);
                                        }
                                        var show = function() {
                                            scope.hideLoading();
                                            scope.playerElement.show();
                                        };

                                        if(event.data === 0) {
                                            // Video done
                                            scope.form.playing = false;
                                        }
                                        else if(event.data === -1) {
                                            // video unstarted
                                            scope.form.playing = false;
                                            scope.hideVideoAndShowLoading();
                                        }
                                        else if(event.data === 2) {
                                            // Video Paused
                                            videoOverlay.show();
                                            scope.form.playing = false;
                                        }
                                        else if(event.data === 3) {
                                            // Video buffering
                                            scope.form.playing = false;
                                        }
                                        else if(event.data === 5) {
                                            // Video cued
                                            show();
                                            scope.form.playing = false;
                                        }
                                        else if(event.data === 1) {
                                            // Video playing
                                            videoOverlay.show();
                                            show();
                                            scope.onSuccessfulPlay();
                                        }
                                    }
                                }
                            });
                        });
                    };

                    if(!youtubeService.ready) {
                        scope.$on('youtubeReady', function() {
                            create();
                        });
                    }
                    else {
                        create();
                    }
                };

                scope.calculateDimensions = function() {
                    var dimensions = videoService.calculateDimension(element, scope.maxHeight);
                    scope.width = dimensions.width;
                    scope.height = dimensions.height;


                    scope.createPlayer();
                };

                // Wait until we have rendered the directive before we calculate the dimensions or else
                // we won't have element.parent()'s width which we'll need
                $timeout(function() {
                    scope.calculateDimensions();
                });


                scope.youtubeUrl = formatterService.getYouTubeUrl(scope.videoId);
            }
        };
    }]);