angular.module('app.Directives')
    .directive('toolbar', ['communityService', '$sce', 'toolbarService', '$timeout', 'matchmedia', 'playlistService', 'commService', 'mediaService', '$window', function (communityService, $sce, toolbarService, $timeout, matchmedia, playlistService, commService, mediaService, $window) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div id="toolbar" class="toolbar" ng-class="{\'open\': isOpen, \'phone\': mediaService.isPhone}">' +
                    '<div id="toolbarTop" class="well toolbar-top" ng-swipe-down="swipeDown($event)" ng-class="{\'open\': isOpen, \'playing\': playing, \'paused\': !playing}" hm-tap="toggleIsOpen()">' +
                        '<span ng-style="{\'margin-left\': isOpen && playlistShowing ? width/2 : 0}" hm-tap="showPlaylist()"><i class="fa fa-bars" ng-class="{\'grey-white-icon\': !playing && !playlistShowing, \'white-icon\': playing || (isOpen && playlistShowing)}"></i></span>' +
                        '<span ng-show="canGetPrevious" hm-tap="previous()"><i class="fa fa-step-backward" ng-class="{\'grey-icon\': !playing, \'white-icon\': playing}"></i></span>' +
                        '<span ng-show="!playing" hm-tap="play()"><i class="fa fa-play"  ng-class="{\'grey-icon\': !playing, \'white-icon\': playing}"></i></span>' +
                        '<span ng-show="playing" hm-tap="pause()"><i class="fa fa-pause" ng-class="{\'grey-icon\': !playing, \'white-icon\': playing}"></i></span>' +
                        '<span hm-tap="next()" ng-show="canGetNext" ><i class="fa fa-step-forward" ng-class="{\'grey-icon\': !playing, \'white-icon\': playing}"></i></span>' +

                        '<span ng-if="!mediaService.isPhone" hm-tap="randomize()" ><i class="fa fa-random"  ng-class="{\'grey-icon\': !playing, \'white-icon\': playing}"></i></span>' +
                        '<span style="display: inline; overflow: hidden;" ng-show="playlistItem">{{playlistItem.truncatedTitle}}</span>' +

                        '<span class="pull-right" style="display: inline;" hm-tap="closeToolbar()"><i class="fa fa-times grey-icon"></i></span>' +

                    '</div>' +
                    '<div ng-show="isOpen">' +
                        '<div id="toolbarVideoAreaContainer" class="well" style="margin-bottom: 0px; width: 100%; height: 100%; padding: 0px;">' +
                            '<toolbar-video-area options="videoOptions"></toolbar-video-area>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                showToolbar: '=',
                isOpen: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;

                if(!mediaService.isPhone) {
                    var populatePlaylist = function() {
                        if(!toolbarService.playlist || !toolbarService.playlist.Items ||
                            toolbarService.playlist.Items <= 0) {
                            toolbarService.playRandomPlaylist();
                        }
                    };
                    if(communityService.community) {
                        populatePlaylist();
                    }
                    scope.$on('communityChanged', function(community) {
                        populatePlaylist();
                    });
                }

                scope.updateTruncatedTitle = function() {
                    if(scope.playlistItem && scope.playlistItem.Title) {
                        var truncationLength = scope.isOpen ? mediaService.isPhone ? 10 : 27 : mediaService.isPhone ? 5 : scope.playlist.Items.length > 1 ? 12 : 15;
                        var title = scope.playlistItem.Title;
                        scope.playlistItem.truncatedTitle = title.substring(0, Math.min(truncationLength, title.length));
                    }
                };

                scope.videoOptions = {
                    setAspectRatio: function(aspectRatio) {
                        scope.toolbarElement.resizable('option', 'aspectRatio', aspectRatio);
                    },
                    getWidth: function() {
                        return scope.toolbarElement.width();
                    },
                    setWidth: function(width) {
                        scope.width = width;
                        scope.toolbarElement.width(width);
                    },
                    setHeight: function(height) {
                        scope.toolbarElement.height(height);
                    }
                };

                scope.playlistShowing = false;
                scope.showPlaylist = function() {
                    var isOpen = scope.isOpen;
                    var collapsed = isOpen ? scope.playlistShowing  : false;
                    scope.openIfNecessary();
                    scope.skipToggle = true;

                    if(scope.playlistShowing && !isOpen) {
                        // If we're currently closed and we're opening (and the playlist is
                        // already showing) then no need to set the collapsed value
                        return;
                    }

                    scope.videoOptions.setCollapsed(collapsed);

                    scope.playlistShowing = !collapsed;
                };

                scope.toolbarElement = null;
                scope.initializeResizable = function() {
                    scope.toolbarElement = $('#toolbar');
                    scope.toolbarElement.resizable({
                        //aspectRatio: toolbarService.aspectRatio,
                        //alsoResize: '#toolbarVideoAreaContainer',
                        helper: "toolbar-resizable-helper",
                        handles: 'n, w, nw',
                        stop: function( event, ui ) {
                            scope.videoOptions.onResize(scope.toolbarElement, event, ui);

                            scope.$apply(function() {
                                scope.width = scope.toolbarElement.width();
                            });
                        }
                    });

                    scope.startResizable();

                    $timeout(function() {
                        scope.refresh();
                    });
                };

                scope.startResizable = function() {
                    if(scope.height)
                        scope.toolbarElement.css('height', scope.height);
                    if(scope.width)
                        scope.toolbarElement.css('width', scope.width);

                    scope.toolbarElement.resizable('option', 'disabled', false);
                };

                scope.height = toolbarService.getOpenHeight();
                scope.width = toolbarService.getOpenWidth();
                scope.stopResizable = function() {
                    if(!scope.toolbarElement) {
                        scope.initializeResizable();
                    }

                    scope.height = scope.toolbarElement.height();
                    scope.width = scope.toolbarElement.width();
                    scope.toolbarElement.height('auto');
                    scope.toolbarElement.width(toolbarService.getClosedWidth());
                    scope.toolbarElement.resizable('option', 'disabled', true);
                };

                scope.openIfNecessary = function() {
                    if(!scope.isOpen) {
                        scope.toggleIsOpen();
                    }
                };

                scope.refresh = function() {
                    scope.isOpen = !scope.isOpen;
                    scope.toggleIsOpen();

                    scope.videoOptions.onResize(scope.toolbarElement);
                };

                scope.skipToggle = false;
                scope.toggleIsOpen = function() {
                    if(scope.skipToggle) {
                        scope.skipToggle = false;
                        return;
                    }

                    scope.isOpen = !scope.isOpen;

                    scope.updateTruncatedTitle();

                    if(scope.isOpen) {
                        if(!scope.toolbarElement) {
                            scope.initializeResizable();
                        }
                        else {
                            scope.startResizable();
                        }
                    }
                    else {
                        scope.stopResizable();
                    }
                };


                scope.isOpen = false;
                scope.closeToolbar = function() {
                    scope.showToolbar = false;
                    scope.skipToggle = true;

                    toolbarService.onToolbarClosed();
                };

                scope.play = function() {
                    scope.skipToggle = true;

                    toolbarService.playPlaylistItem();
                };
                scope.pause = function() {
                    scope.skipToggle = true;

                    toolbarService.pausePlaylistItem();
                };

                scope.previous = function() {
                    scope.skipToggle = true;
                    toolbarService.previousPlaylistItem();
                };
                scope.next = function() {
                    scope.skipToggle = true;
                    toolbarService.nextPlaylistItem();
                };

                scope.playing = false;
                scope.playlist = null;
                scope.playlistItem = null;
                scope.playlistItemIndex = null;

                scope.toolbarCallbacks = {
                    pausePlaylistItem: function() {
                        $timeout(function() { scope.playing = false; } );
                    },
                    playPlaylistItem: function() {
                        $timeout(function() {
                            scope.playing = true;
                            scope.openIfNecessary();
                        });
                    },
                    onToolbarOpened: function() {
                        scope.showToolbar = true;
                        scope.openIfNecessary();
                    },
                    refresh: function() {
                        scope.playing = toolbarService.playing;
                        scope.playlist = toolbarService.playlist;
                        scope.playlistItem = toolbarService.playlistItem;
                        scope.playlistItemIndex = toolbarService.playlistItemIndex;

                        scope.canGetPrevious = toolbarService.canGetPrevious();
                        scope.canGetNext = toolbarService.canGetNext();

                        scope.updateTruncatedTitle();

                        if(scope.playing) {
                            scope.openIfNecessary();
                        }
                    }
                };
                toolbarService.callbacks.push(scope.toolbarCallbacks);

                scope.$on('$destroy', function() {
                    toolbarService.removeCallback(scope.toolbarCallbacks);
                });

                angular.element($window).bind('resize', function() {
                    scope.refresh();
                });

                scope.randomize = function() {
                    scope.skipToggle = true;

                    toolbarService.playRandomPlaylist(function(data) {
                        // Success
                        toolbarService.play();
                    }, function(data) {
                        commService.showErrorAlert(data);
                    });
                };

                scope.swipeDown = function(e) {
                    if(scope.isOpen) {
                        scope.toggleIsOpen();
                    }
                };
                scope.swipeUp = function(e) {
                    if(!scope.isOpen) {
                        scope.toggleIsOpen();
                    }
                };

                toolbarService.loadState();


            }
        };
    }])
    .directive('toolbarPlaylistArea', ['communityService', '$sce', 'toolbarService', '$timeout', function (communityService, $sce, toolbarService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-repeat="playlistItem in playlist.Items" id="{{playlistItem.Id}}">' +
                        '<div class="playlist-item" title="{{playlistItem.Title}}" ng-class="{\'selected\': playlistItem.selected, \'playing\': playing, \'paused\': paused}" ng-click="playlistItemClicked(playlistItem)">' +
                            '<div class="col-xs-1" style="margin-right: 10px;"><i ng-show="!playlistItem.selected"></i><i ng-show="!playing && playlistItem.selected" class="fa fa-play"></i><i ng-show="playing && playlistItem.selected" class="fa fa-pause"></i></div>' +
                            '<div class="col-xs-8" style="height: 20px; overflow: hidden;">{{playlistItem.Title}}</div>' +
                            '<div class="col-xs-1" style="margin-right: 10px;" ng-click="removePlaylistItem(playlistItem)"><i class="fa fa-times grey-icon"></i></div>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                element.sortable({
                    revert: true,
                    start: function(event, ui) {
                        scope.isSorting = true;
                        var start_index = ui.item.index();
                        ui.item.data('start_index', start_index);
                    },
                    stop: function(event, ui) {
                        scope.isSorting = false;
                    },
                    update: function(event, ui) {
                        var start_index = ui.item.data('start_index');
                        var end_index = ui.item.index();

                        // Move the playlist item
                        toolbarService.movePlaylistItem(start_index, end_index);
                    }
                });
                scope.playlist = null;
                scope.playlistItem = null;
                scope.playlistItemIndex = null;

                scope.removePlaylistItem = function(playlistItem) {
                    toolbarService.removePlaylistItem(playlistItem);
                };

                scope.playlistItemClicked = function(playlistItem) {
                    // Don't affect what's playing if we're sorting.
                    if(scope.isSorting) {
                        return;
                    }

                    if(playlistItem.selected) {
                        if(scope.playing) {
                            toolbarService.pausePlaylistItem();
                        }
                        else {
                            toolbarService.playPlaylistItem();
                        }
                    }
                    else {
                        toolbarService.setPlaylistItem(scope.playlist, playlistItem);
                    }


                };

                scope.playing = false;

                scope.toolbarCallbacks = {
                    pausePlaylistItem: function() {
                        $timeout(function() { scope.playing = false; } );
                    },
                    playPlaylistItem: function() {
                        $timeout(function() { scope.playing = true; } );
                    },
                    refresh: function() {
                        scope.playing = toolbarService.playing;
                        scope.playlist = toolbarService.playlist;
                        scope.playlistItem = toolbarService.playlistItem;
                        scope.playlistItemIndex = toolbarService.playlistItemIndex;

                        for(var i = 0; i < scope.playlist.Items.length; i++) {
                            var item = scope.playlist.Items[i];
                            item.selected = i === scope.playlistItemIndex;
                        }
                    }
                };
                toolbarService.callbacks.push(scope.toolbarCallbacks);

                scope.$on('$destroy', function() {
                    toolbarService.removeCallback(scope.toolbarCallbacks);
                });

            }
        };
    }])
    .directive('toolbarVideoArea', ['$rootScope', 'communityService', '$sce', 'toolbarService', 'youtubeService', 'matchmedia', 'mediaService', '$window', '$timeout', 'commService', 'videoService', function ($rootScope, communityService, $sce, toolbarService, youtubeService, matchmedia, mediaService, $window, $timeout, commService, videoService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="position: relative;">' +

                    '<div id="toolbarPlaylistAreaContainer" ng-show="!isCollapsed">' +
                        '<perfect-scrollbar class="scroller centered" style="width:100%; height: 80%;" suppress-scroll-x="true" >' +
                            '<toolbar-playlist-area id="toolbarPlaylistArea" style="width: 100%; height: 100%;"></toolbar-playlist-area>' +
                        '</perfect-scrollbar>' +
                    '</div>' +
                    '<div id="toolbarVideoPlayerContainer">' +
                        //'<iframe id="toolbarVideoPlayer" class="toolbar-video-player centered" src="{{youtubeUrl | trusted}}" width="100%" scrolling="no" frameborder="0" allowfullscreen="1" autohide="1" webkitallowfullscreen="1"></iframe>' +
                        '<div id="toolbarVideoPlayer" class="toolbar-video-player centered" style="width: 100%;"></div>' +
                    '</div>' +


                '</div>',
            scope: {
                /*
                    {
                        onResize: // populated by this directive--should be called when the toolbar is resized,
                        setCollapsed: // populated by this directive
                    }
                 */
                options: '='
            },
            link: function (scope, element, attrs) {
                //scope.youtubeUrl = 'https://www.youtube.com/embed/Abp3O8nMM_g?enablejsapi=1&origin=' + $window.location.origin;
                scope.$watch('options', function(newValue) {
                    if(newValue) {
                        scope.options.onResize = function(toolbarElement, event, ui) {
                            var toolbarHeight = toolbarElement.height();

                            // constrain the height
                            var maxHeight = $window.innerHeight - 40;
                            if(toolbarHeight > maxHeight) {
                                toolbarHeight = maxHeight;
                                scope.options.setHeight(toolbarHeight);
                                scope.options.setAspectRatio(toolbarService.aspectRatio);
                            }

                            // -35 to leave room for youtube volume controls
                            $('#toolbarVideoPlayer').height(toolbarHeight - 35);

                            $('#toolbarVideoAreaContainer').height(toolbarHeight);
                            $('#toolbarPlaylistAreaContainer').height(toolbarHeight);

                            scope.constrainToolbarWidth();
                            scope.recalculateContainerWidth();

                        };

                        scope.options.setCollapsed = scope.setCollapsed;
                    }
                });

                scope.isCollapsed = true;
                scope.setCollapsed = function(isCollapsed) {
                    scope.isCollapsed = isCollapsed;

                    scope.recalculateToolbarWidth();
                    scope.recalculateContainerWidth();
                };

                scope.recalculateContainerWidth = function() {
                    var toolbarWidth = scope.options.getWidth();
                    var containerWidth = toolbarWidth - 2;
                    if(!scope.isCollapsed) {
                        $('#toolbarVideoPlayerContainer').width(containerWidth / 2);
                        $('#toolbarPlaylistAreaContainer').width(containerWidth / 2);
                    }
                    else {
                        $('#toolbarVideoPlayerContainer').width(containerWidth);
                    }
                };

                scope.recalculateToolbarWidth = function() {
                    if(scope.isCollapsed) {
                        scope.setToolbarWidth(scope.options.getWidth()/2);
                        scope.options.setAspectRatio(toolbarService.aspectRatio);
                    }
                    else {
                        var newWidth = scope.options.getWidth() * 2;
                        scope.setToolbarWidth(newWidth);
                        scope.options.setAspectRatio(toolbarService.aspectRatio * 2);
                    }
                };

                scope.constrainToolbarWidth = function() {
                    scope.setToolbarWidth(scope.options.getWidth());
                };

                scope.setToolbarWidth = function(width) {
                    var maxWidth = $window.innerWidth - 40;
                    if(width > maxWidth) {
                        width = maxWidth;
                    }
                    scope.options.setWidth(width);
                };

                scope.player = null;

                // The VideoId of the currently loaded video
                scope.videoId = null;

                //var width = $('#toolbarVideoPlayer').width();

                scope.$on('$destroy', function() {
                    if(scope.player) {
                        scope.player.destroy();
                    }
                    scope.player = null;

                    toolbarService.removeCallback(scope.toolbarCallbacks);
                });

                scope.lastSaveStateTime = null;
                scope.isAnyVideoPlaying = false;
                scope.createPlayer = function(videoId) {
                    scope.player = youtubeService.createPlayer('toolbarVideoPlayer', {
                        height: mediaService.isPhone ? '100' : '150',
                        width: toolbarService.getOpenWidth(), // 300 minimum width to show volume controls
                        playerVars: videoService.getPlayerVars(), // This is where params go https://developers.google.com/youtube/player_parameters#controls
                        videoId: videoId,
                        events: {
                            'onReady': function(event) {

                                // Player ready


                                // Do not auto-play if on iOS device--they can't.
                                // Also don't autoplay if on a phone
                                if(!mediaService.isiPad &&
                                    !mediaService.isiPhone &&
                                    !mediaService.isiPod &&
                                    !mediaService.isPhone &&
                                    toolbarService.playing) {
                                    // Not iOS device--autoplay
                                    scope.player.playVideo();
                                }
                                else {
                                    toolbarService.stop();
                                }
                            },
                            'onError': function(event) {

                            },
                            'onStateChange': function(event) {
                                if(event.data === 0) {
                                    scope.isAnyVideoPlaying = false;
                                    // Video done
                                    toolbarService.playlistItem.progress = 0;
                                    toolbarService.saveState();
                                    toolbarService.playlistItemDone();
                                }
                                else if(event.data === 2) {
                                    scope.isAnyVideoPlaying = false;
                                    // Video Paused
                                    toolbarService.pausePlaylistItem();
                                }
                                else if(event.data === 5 || event.data === -1) {
                                    // Video unstarted or cued
                                    if(scope.playlistItem.progress) {
                                        scope.player.seekTo(scope.playlistItem.progress, /*allowSeekAhead*/true);
                                    }
/*
                                    else if(event.data === 5 && toolbarService.playing) {
                                        if(!scope.isAnyVideoPlaying) {
                                            $timeout(function() {
                                                scope.player.playVideo();
                                            });
                                        }
                                    }
*/
                                    scope.isAnyVideoPlaying = false;
                                }
                                else if(event.data === 1) {
                                    scope.isAnyVideoPlaying = true;
                                    var refreshProgress = function(forceSave) {
                                        if(toolbarService.playing || forceSave) {
                                            var now = new Date();
                                            // If we saved the state within the last 500ms then something has gone wrong. The video
                                            // may be playing and pausing incessantly. We need to stop it.
                                            if(scope.lastSaveStateTime && (now - scope.lastSaveStateTime) <= 500) {
                                                scope.stopVideo();
                                                toolbarService.playing = false;
                                                toolbarService.refresh(/*skipSaveState*/true);
                                                return false;
                                            }
                                            else {
                                                // update the progress of the video
                                                var currentTime = scope.player.getCurrentTime();
                                                if(toolbarService.playlistItem.progress != currentTime) {
                                                    toolbarService.playlistItem.progress = currentTime;
                                                    toolbarService.saveState();
                                                    scope.lastSaveStateTime = now;
                                                }
                                            }

                                        }
                                        return true;
                                    };

                                    if(!commService.isAutoRefreshRunning(scope)) {
                                        commService.autoRefresh(scope, $timeout, 15 * 1000, refreshProgress);
                                    }

                                    if(!refreshProgress(true)) {
                                        return;
                                    }

                                    if(!scope.playlistItem.Title) {
                                        var d = scope.player.getVideoData();
                                        toolbarService.playlistItem.Title = d.title;
                                        toolbarService.refresh();
                                    }
                                    // Video playing
                                    toolbarService.playPlaylistItem();
                                }
                            }
                        }
                    });
                };

                scope.stopVideo = function() {
                    if(scope.player)
                        scope.player.stopVideo();
                };
                scope.pauseVideo = function() {
                    if(scope.player)
                        scope.player.pauseVideo();
                };
                scope.playVideo = function() {
                    if(scope.player) {
                        if(!scope.isAnyVideoPlaying && (mediaService.isiPad ||
                            mediaService.isiPhone ||
                            mediaService.isiPod)) {
                            // The video is not playing and this is an ipad/iphone/ipod which means
                            // if we attempt to auto-play then the video will blank out. The user must click the
                            // play button.
                        }
                        else {
                            // We can play!
                            scope.player.playVideo();
                        }
                    }
                    else if(youtubeService.ready) {
                        scope.createPlayer(scope.playlistItem.VideoId);
                    }
                };

                scope.loadVideo = function(videoId) {
                    scope.videoId = videoId;

                    var loadVideoById = function() {
                        if(scope.player) {

                            if((mediaService.isiPad ||
                                mediaService.isiPhone ||
                                mediaService.isiPod)) {
                                // This is an ipad/iphone/ipod which means
                                // if we attempt to auto-play then the video will blank out. The user must click the
                                // play button if no video is playing. If a video is playing then we can load and play the next.
                                if(scope.isAnyVideoPlaying) {
                                    scope.player.loadVideoById(videoId);
                                }
                                else {
                                    scope.player.cueVideoById(videoId);
                                }
                            }
                            else {
                                scope.player.loadVideoById(videoId);
                            }

                        }
                        else {
                            scope.createPlayer(videoId);
                        }
                    };

                    if(!youtubeService.ready) {
                        $rootScope.$on('youtubeReady', function() {
                            loadVideoById();
                        });
                    }
                    else {
                        loadVideoById();
                    }
                };


                scope.toolbarCallbacks = {
                    onToolbarClosed: function() {
                        scope.pauseVideo();
                    },
                    pausePlaylistItem: function() {
                        scope.pauseVideo();
                    },
                    playPlaylistItem: function() {
                        scope.playVideo();
                    },
                    refresh: function() {

                        scope.playlist = toolbarService.playlist;
                        scope.playlistItem = toolbarService.playlistItem;
                        scope.playlistItemIndex = toolbarService.playlistItemIndex;

                        if(scope.playlistItem) {
                            if(scope.videoId !== scope.playlistItem.VideoId) {
                                scope.loadVideo(scope.playlistItem.VideoId);
                            }
                            else {
                                if(toolbarService.playing)
                                    scope.playVideo();
                            }
                        }
                        else {
                            scope.stopVideo();
                        }

                    }
                };

                toolbarService.callbacks.push(scope.toolbarCallbacks);


            }
        };
    }]);