angular.module('app.Services')
    .factory('albumService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            createAlbum: function(albumEntry, tagPageId, tag, stepPageId, onSuccess, onFailure, community) {
                commService.postWithParams('album', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Album: albumEntry,
                    TagPageId: tagPageId,
                    Tag: tag,
                    StepPageId: stepPageId,
                    RequestType: 'CreateAlbum'
                }, onSuccess, onFailure);
            },
            editAlbum: function(albumEntry, tagPageId, stepPageId, onSuccess, onFailure, community) {
                commService.postWithParams('album', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Album: albumEntry,
                    TagPageId: tagPageId,
                    StepPageId: stepPageId,
                    RequestType: 'EditAlbum'
                }, onSuccess, onFailure);
            },
            deleteAlbum: function(albumEntry, tagPageId, stepPageId, onSuccess, onFailure, community) {
                commService.postWithParams('album', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Album: albumEntry,
                    TagPageId: tagPageId,
                    StepPageId: stepPageId,
                    RequestType: 'DeleteAlbum'
                }, onSuccess, onFailure);
            },
            getAllAlbums: function(albumStack) {
                var allAlbums = [];
                allAlbums.push(albumStack.ProfilePictures);
                allAlbums.push(albumStack.CoverImages);
                allAlbums = allAlbums.concat(albumStack.ContentAlbums);
                return allAlbums;
            },
            getAllImages: function(albumStack) {
                var albums = this.getAllAlbums(albumStack);
                var images = [];
                for(var i = 0; i < albums.length; i++) {
                    var album = albums[i];
                    if(album.Images) {
                        for(var j = 0; j < album.Images.length; j++) {
                            var image = album.Images[j];
                            images.push(image);
                        }
                    }
                }
                return images;
            }
        };
    }]);