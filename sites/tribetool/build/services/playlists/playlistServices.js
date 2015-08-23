angular.module('app.Services')
    .factory('playlistService', ['$rootScope', 'commService', 'accountService', 'communityService', 'modalService', function($rootScope, commService, accountService, communityService, modalService) {
        return {
            getTagPagePlaylists: function(pageNumber, countPerPage, onSuccess, onFailure) {
                commService.postWithParams('playlist', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetPlaylistsOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    OnlyGetTagPagePlaylists: true,
                    RequestType: 'GetPlaylists'
                }, onSuccess, onFailure);
            },
            getRandomPlaylists: function(countPerPage, onSuccess, onFailure) {
                commService.postWithParams('playlist', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetPlaylistsOptions: {
                        PageNumber: 1,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetRandomPlaylists'
                }, onSuccess, onFailure);
            },
            savePlaylist: function(playlist, tag, onSuccess, onFailure) {
                commService.postWithParams('playlist', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Playlist: playlist,
                    Tag: tag,
                    RequestType: 'SavePlaylist'
                }, onSuccess, onFailure);
            },
            deletePlaylist: function(playlist, onSuccess, onFailure) {
                commService.postWithParams('playlist', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Playlist: playlist,
                    RequestType: 'DeletePlaylist'
                }, onSuccess, onFailure);
            },
            editPlaylists: function(options) {
                modalService.open({
                    templateUrl: 'app-templates/playlists/edit-playlists.html',
                    controller: 'editPlaylistsController',
                    windowClass: 'edit-playlists-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                });
            },
            /* Returns {
                isValid: bool,
                videoId: string // youtube video url
            * }
            * */
            isValidYoutubeUrl: function(url) {
                var regex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
                var matches = regex.exec(url);
                if(matches && matches.length > 1)
                {
                    return {
                        isValid: true,
                        videoId: matches[1]
                    };
                }

                return {
                    isValid: false
                };
            }
        };
    }]);