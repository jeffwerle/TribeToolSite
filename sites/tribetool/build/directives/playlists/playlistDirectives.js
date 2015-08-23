angular.module('app.Directives')
    .directive('playlistsPage', ['$routeParams', 'communityService', 'playlistService', 'commService', '$timeout', 'navigationService', 'mediaService', function ($routeParams, communityService, playlistService, commService, $timeout, navigationService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!mediaService.isPhone" class="col-xs-12">' +
                        '<community-cover-photo></community-cover-photo>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +

                    '<div class="col-xs-12">' +
                        '<h1 class="wiki-header wiki-header-1">Tag Page Playlists</h1>' +
                        '<div id="playlistsContainer" infinite-scroll="getMoreItems()" infinite-scroll-disabled="scrollingDone || processing">' +
                            '<div ng-repeat="playlist in playlists">' +
                                '<div class="row">' +
                                    '<div class="well">' +
                                        '<tag-picture tag="playlist.Tag"></tag-picture> <span class="pointer" style="font-weight: bold; font-size:26px;" ng-click="goToTagPage(playlist.Tag.Tag)">{{playlist.Tag.Tag}}</span>' +
                                        '<playlist playlist="playlist"></playlist>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-show="processing"><loading></loading> Retrieving Playlists...</div>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.communityUrl = communityService.community.Url;

                var countToLoadFromCache = 2;
                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.scrollingDone = false;
                scope.serviceRetrievalDone = scope.scrollingDone;
                scope.playlistsCache = [];
                scope.playlists = [];

                scope.getMoreItems = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    var pullFromCache = function() {
                        // Retrieve the items from the cache
                        var cacheLength = scope.playlistsCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.playlists.push(scope.playlistsCache.shift());
                        }
                        if(scope.playlistsCache.length <= 0 && scope.serviceRetrievalDone) {
                            scope.scrollingDone = true;
                        }
                    };

                    if(scope.playlistsCache.length < countToLoadFromCache && !scope.serviceRetrievalDone) {
                        scope.processing = true;
                        playlistService.getTagPagePlaylists(scope.pageNumber,
                            scope.countPerPage,
                            function(data) {
                                // Success
                                if(data.Playlists && data.Playlists.length > 0)
                                    scope.playlistsCache = scope.playlistsCache.concat(data.Playlists);

                                scope.serviceRetrievalDone = !data.Playlists || data.Playlists.length < scope.countPerPage;
                                pullFromCache();

                                $timeout(function() {
                                    scope.processing = false;
                                });

                                scope.pageNumber++;
                            }, function(data) {
                                // Failure
                                scope.processing = false;
                                commService.showErrorAlert(data);
                            });
                    }
                    else {
                        scope.processing = true;
                        $timeout(function() {
                            pullFromCache();
                            scope.processing = false;
                        });
                    }
                };
                scope.getMoreItems();

                scope.goToTagPage = function(tag) {
                    navigationService.goToTagPage(tag, communityService.community);
                };
            }
        };
    }])
    .directive('editPlaylistsArea', ['communityService', function (communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="col-xs-12" style="float: none; margin-bottom:20px; margin-top: 20px;">' +
                    '<playlist-selection options="options"></playlist-selection>' +
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                /* {
                 playlists: [], (collection of PlaylistEntry).
                 onCancelled(),
                 tagPage: TagPageEntry (if provided, we will upload playlists to this tag page. If not provided, we will upload playlists to the logged-in account),
                 stepPage: StepPageEntry (if provided, we will upload playlists to this step page. If not provided, we will upload playlists to the logged-in account),
                 mapLocation: MapLocation (if provided, we will upload playlists to this Map Location. If not provided, we will upload playlists to the logged-in account),
                 }
                 */
                options: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('getYoutubeUrl', ['playlistService', function (playlistService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<label>YouTube Url:</label> <input type="text" required class="form-control" ng-model="url" ng-change="urlChanged()" placeholder="YouTube Url">' +
                    '<div class="centered">' +
                        '<div ng-show="url && !validUrl" style="color: red;">Invalid YouTube Url</div>' +
                        '<div ng-show="url && validUrl" style="color: green;">Valid YouTube Url!</div>' +
                        '<img ng-show="validUrl" ng-src="https://img.youtube.com/vi/{{videoId}}/1.jpg">' +
                    '</div>' +
                '</div>',
            scope: {
                videoId: '='
            },
            link: function (scope, element, attrs) {
                scope.validUrl = false;
                scope.urlChanged = function() {
                    // Is it a valid YouTube Url?
                    var result = playlistService.isValidYoutubeUrl(scope.url);
                    scope.validUrl = result.isValid;
                    if(scope.validUrl) {
                        scope.videoId = result.videoId;
                    }
                    else {
                        scope.videoId = null;
                    }
                };


                if(scope.videoId) {
                    scope.url = 'https://www.youtube.com/watch?v=' + scope.videoId;
                    scope.urlChanged();
                }
            }
        };
    }])
    .directive('editPlaylistItem', ['playlistService', function (playlistService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="position:absolute;left:5px;top:5px;">{{index + 1}}</div>' +
                    '<div style="position:absolute;right:5px;top:5px;" class="red-icon" ng-click="remove()"><i class="fa fa-times"></i></div>' +
                    '<div ng-show="!isEditing" class="centered">' +
                        '<div>{{playlistItem.Title}}</div>' +
                        '<img ng-src="https://img.youtube.com/vi/{{playlistItem.VideoId}}/1.jpg">' +
                        '<div><button type="button" style="margin-top:5px;" class="btn btn-primary" ng-click="isEditing = true" >Edit</button></div>' +
                    '</div>' +
                    '<div ng-show="isEditing">' +
                        '<label>Video Title:</label> <input type="text" required class="form-control" ng-model="playlistItem.Title" placeholder="Video Title">' +
                        '<get-youtube-url video-id="playlistItem.VideoId"></get-youtube-url>' +
                    '</div>' +
                '</div>',
            scope: {
                playlistItem: '=',
                index: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.isEditing = scope.playlistItem.editing;

                scope.remove = function() {
                    if(scope.options && scope.options.removePlaylistItem) {
                        scope.options.removePlaylistItem(scope.playlistItem);
                    }
                };
            }
        };
    }])
    .directive('editPlaylist', ['playlistService', 'commService', function (playlistService, commService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isDeleting">' +
                        '<loading></loading> Deleting...' +
                    '</div>' +
                    '<div ng-show="isSaving"><loading></loading> Saving...</div>' +
                    '<div ng-show="!isSaving">' +
                        '<div class="col-xs-12">' +
                            '<form ng-submit="save()">' +
                                '<div>' +
                                    '<label>Playlist Title:</label> <input type="text" required class="form-control" ng-model="playlist.Title" placeholder="Playlist Title">' +

                                    '<div style="margin-top: 20px;">' +
                                        '<div ng-repeat="playlistItem in playlist.Items">' +
                                            '<div class="col-sm-4 edit-playlist-item-well">' +
                                                '<edit-playlist-item index="$index" playlist-item="playlistItem" options="options"></edit-playlist-item>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div style="clear: both;">' +
                                        '<button style="margin-top:5px;" type="button" class="btn btn-primary" ng-click="addNewPlaylistItem()" ><i class="fa fa-plus"></i> New Item</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div style="margin-top:20px; clear:both;" class="centered">' +
                                    '<button class="btn btn-primary" type="submit" style="margin-right: 20px;">Save Playlist</button>' +
                                    '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                                '</div>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '=',
                playlist: '='
            },
            link: function (scope, element, attrs) {

                // copy
                scope.playlist = angular.copy(scope.playlist);

                scope.cancel = function() {
                    commService.showWarningAlert('Any unsaved changes were lost.');
                    scope.options.onEndEditing();
                };

                scope.options.removePlaylistItem = function(playlistItem) {
                    var indexOfPlaylistItem = scope.playlist.Items.indexOf(playlistItem);
                    if(indexOfPlaylistItem >= 0) {
                        scope.playlist.Items.splice(indexOfPlaylistItem, 1);
                    }
                };

                scope.addNewPlaylistItem = function() {
                    scope.playlist.Items.push({
                        Title: '',
                        VideoId: '',
                        editing: true
                    });
                };

                scope.save = function() {

                    // Make sure all playlist items have valid VideoIds
                    for(var i = 0; i < scope.playlist.Items.length; i++) {
                        var playlistItem = scope.playlist.Items[i];
                        if(!playlistItem.VideoId) {
                            commService.showErrorAlert('Please provide a valid YouTube Url for "' + playlistItem.Title + '".');
                            return;
                        }
                    }

                    scope.isSaving = true;

                    scope.playlist.TagPageId = scope.options.tagPage ? scope.options.tagPage.Id : null;
                    scope.playlist.StepPageId = scope.options.stepPage ? scope.options.stepPage.Id : null;
                    scope.playlist.MapLocationId = scope.options.mapLocation ? scope.options.mapLocation.Id : null;
                    scope.playlist.MapId = scope.options.mapLocation ? scope.options.mapLocation.MapId : null;

                    // Creating playlist
                    playlistService.savePlaylist(scope.playlist,
                        scope.options.tagPage ? scope.options.tagPage.Tag : null,
                        function(data) {
                            // success
                            commService.showSuccessAlert('Playlist saved successfully!');
                            scope.isSaving = false;
                            scope.options.onEndEditing(data.Playlist);
                        }, function(data) {
                            // failure
                            scope.isSaving = false;
                            commService.showErrorAlert(data);
                        });

                };
            }
        };
    }])
    .directive('playlistSelection', ['commService', 'accountService', 'communityService', 'playlistService', function(commService, accountService, communityService, playlistService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div >' +
                    '<div ng-show="isDeleting"><loading></loading> Deleting...</div>' +
                    '<div ng-show="!isDeleting">' +
                        '<div ng-if="isEditing || isCreating">' +
                            '<edit-playlist playlist="playlistToEdit" options="options"></edit-playlist>' +
                        '</div>' +
                        '<div ng-if="!isEditing && !isCreating">' +
                            '<div ng-repeat="playlist in playlists">' +
                                '<div class="row">' +
                                    '<div class="col-xs-12 edit-playlist-well">' +
                                        '<playlist playlist="playlist"></playlist>' +

                                        '<div style="clear:both;">' +
                                            '<button style="margin-top:20px;" ng-show="!consideringDeletion" class="btn btn-primary" ng-click="editPlaylist(playlist)" >Edit</button>' +
                                            '<a style="margin-top:20px;" class="action-link-grey pull-right" ng-show="!consideringDeletion" ng-click="consideringDeletion = true">Delete</a>' +

                                            '<div ng-show="consideringDeletion">' +
                                                '<div style="font-weight: bold; color: red; margin-top: 10px;">Are you sure you want to delete this playlist and all of its items?</div>' +
                                                '<button class="btn btn-warning" type="button" ng-click="consideringDeletion = false" style="margin-top: 5px; margin-right: 10px;">Cancel</button>' +
                                                '<button class="btn btn-danger" type="button" ng-click="deletePlaylist(playlist)" style="margin-top: 5px;">Delete Playlist</button>' +
                                            '</div>' +
                                        '</div>' +

                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            '<div class="col-xs-12" style="margin-top: 10px;">' +
                                '<button class="btn btn-primary" type="button" ng-click="addNewPlaylist()"><i class="fa fa-plus"></i> Add New Playlist</button>' +
                            '</div>' +

                            '<div class="row" style="clear:both;">' +
                                '<div class="col-xs-12">' +
                                    '<button class="btn btn-warning pull-right" tpe="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button>' +
                                    '<button class="btn btn-primary pull-right" type="button" style="margin-top:20px; margin-right: 10px;" ng-click="cancel()">Okay</button>' +
                                '</div>' +
                            '</div>' +

                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                /* {
                     playlists: [], (collection of PlaylistEntry).
                     onCancelled(),
                     tagPage: TagPageEntry (if provided, we will upload playlists to this tag page. If not provided, we will upload playlists to the logged-in account),
                     stepPage: StepPageEntry (if provided, we will upload playlists to this step page. If not provided, we will upload playlists to the logged-in account),
                    mapLocation: MapLocation (if provided, we will upload playlists to this Map Location. If not provided, we will upload playlists to the logged-in account),
                 }
                 */
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.playlists = scope.options.playlists || [];
                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };


                scope.isEditing = false;
                scope.isCreating = false;
                scope.options.onEndEditing = function(playlist) {
                    if(playlist) {
                        if(scope.isCreating) {
                            // We created a playlist--add it to the list of playlists
                            scope.playlists.splice(0, 0, playlist);
                        }
                        else {
                            // We edited a playlist
                            var indexOfEditedPlaylist = scope.playlists.indexOf(scope.playlistToEdit);
                            scope.playlists[indexOfEditedPlaylist] = playlist;
                        }
                    }
                    scope.isEditing = false;
                    scope.isCreating = false;
                };

                scope.addNewPlaylist = function() {
                    scope.playlistToEdit = {
                        Title: '',
                        Items: []
                    };
                    scope.isCreating = true;
                    scope.isEditing = false;
                };

                scope.editPlaylist = function(playlist) {
                    scope.playlistToEdit = playlist;
                    scope.isEditing = true;
                    scope.isCreating = false;
                };

                scope.deletePlaylist = function(playlist) {
                    scope.isDeleting = false;
                    playlist.TagPageId = scope.options.tagPage ? scope.options.tagPage.Id : null;
                    playlist.StepPageId = scope.options.stepPage ? scope.options.stepPage.Id : null;
                    playlistService.deletePlaylist(playlist,
                        function(data) {
                            // success

                            // Remove the playlist from our list of playlists
                            var indexOfPlaylist = scope.playlists.indexOf(playlist);
                            if(indexOfPlaylist >= 0) {
                                scope.playlists.splice(indexOfPlaylist, 1);
                            }

                            commService.showSuccessAlert('Playlist deleted successfully!');
                            scope.isDeleting = false;

                        }, function(data) {
                            // failure
                            scope.isDeleting = false;
                            commService.showErrorAlert(data);
                        });
                };
            }
        };
    }])
    .directive('playlistItem', ['toolbarService', 'formatterService', function (toolbarService, formatterService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="centered">' +
                        '<div>{{playlistItem.Title}}</div>' +
                        '<img style="cursor: pointer;" ng-click="startPlaylistItem()" ng-src="https://img.youtube.com/vi/{{playlistItem.VideoId}}/1.jpg">' +
                        '<div>' +
                            '<button type="button" class="btn toolbar-button toolbar-button-hoverable video-play-link" ng-class="{\'btn-success\': playing}" ng-click="startPlaylistItem()"><i class="fa fa-play"></i></button>' +
                            '<button type="button" class="btn toolbar-button toolbar-button-hoverable video-play-link" ng-class="{\'btn-success\': playing}" ng-click="addToQueue()"><i class="fa fa-plus"></i></button>' +
                        '</div>' +
                        '<div><pin-link formatted-text="youtubeUrl" type="\'Video\'"></pin-link></div>' +
                    '</div>' +
                '</div>',
            scope: {
                playlistItem: '='
            },
            link: function (scope, element, attrs) {
                scope.youtubeUrl = formatterService.getYouTubeUrl(scope.playlistItem.VideoId);
                scope.playing = false;
                scope.startPlaylistItem = function() {
                    toolbarService.startPlaylistItem(scope.playlistItem);
                    scope.playing = true;
                };
                scope.addToQueue = function() {
                    toolbarService.addPlaylistItem(scope.playlistItem);
                    scope.playing = true;
                };
            }
        };
    }])
    .directive('playlist', ['toolbarService', function (toolbarService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="playlist-well">' +
                    '<h4 style="margin-top: 0px; margin-bottom: 0px; font-weight: bold;">{{playlist.Title}}</h4>' +
                    '<div>' +
                        '<button type="button" class="btn toolbar-button toolbar-button-hoverable video-play-link" ng-class="{\'btn-success\': playing}" ng-click="startPlaylist()"><i class="fa fa-play"></i></button>' +
                        '<button type="button" class="btn toolbar-button toolbar-button-hoverable video-play-link" ng-class="{\'btn-success\': playing}" ng-click="addToQueue()"><i class="fa fa-plus"></i></button>' +
                    '</div>' +
                    //'<a style="margin-right: 20px;" class="action-link" ng-click="startPlaylist()">Play</a><a style="margin-right: 20px;" class="action-link" ng-click="addToQueue()">Add To Queue</a>' +
                    '<div class="col-xs-12" style="margin-top:10px; margin-left: 20px;">' +
                        '<div>' +
                            '<div ng-repeat="playlistItem in playlist.Items">' +
                                '<div class="col-sm-3 playlist-item-well" style="margin-bottom: 0px;">' +
                                    '<playlist-item playlist-item="playlistItem"></playlist-item>' +
                                '</div>' +

                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                playlist: '='
            },
            link: function (scope, element, attrs) {
                scope.playing = false;
                scope.startPlaylist = function() {
                    toolbarService.startPlaylist(scope.playlist);
                    scope.playing = true;
                };
                scope.addToQueue = function() {
                    toolbarService.addPlaylist(scope.playlist);
                    scope.playing = true;
                };
            }
        };
    }])
    .directive('playlists', ['communityService', function (communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-repeat="playlist in playlists">' +
                        '<playlist id="{{playlist.playlistElementId}}" playlist="playlist"></playlist>' +
                    '</div>' +
                '</div>',
            scope: {
                playlists: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }]);