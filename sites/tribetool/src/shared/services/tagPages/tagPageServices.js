angular.module('app.Services')
    .factory('tagPageService', ['$rootScope', 'commService', 'accountService', 'communityService', 'albumService', function($rootScope, commService, accountService, communityService, albumService) {
        return {
            // A cache of tag pages
            tagPages: [],
            /* If true, tag pages will be automatically redirected if applicable */
            performRedirects: false,
            minimumLevelToEdit: 1,
            initialize: function() {

            },
            recache: function() {
                this.populateTagPages();
            },
            /* populates this.tagPages. This will be called whenever the community
             * changes. */
            populateTagPages: function() {
                var my = this;
                this.getTagPages(function(data) {
                    // Success
                    my.tagPages = data.TagPages;
                    $rootScope.$broadcast('tagPagesChanged', my.tagPages);
                }, function(data) {
                    // Failure
                });
            },
            setRedirect: function(tagPage, redirect, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TagPage: tagPage,
                    Redirect: redirect,
                    RequestType: 'SetRedirect'
                }, onSuccess, onFailure);
            },
            removeRedirect: function(tagPage, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TagPage: tagPage,
                    RequestType: 'RemoveRedirect'
                }, onSuccess, onFailure);
            },
            getTagPages: function(onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetTagPagesOptions: {
                        RequestType: 'Cache'
                    },
                    RequestType: 'GetTagPages'
                }, onSuccess, onFailure);
            },
            getRecentlyUpdatedTagPages: function(pageNumber, countPerPage, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetTagPagesOptions: {
                        RequestType: 'RecentlyUpdated',
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetTagPages'
                }, onSuccess, onFailure);
            },
            getTagPage: function(tag, options, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Tag: tag,
                    GetTagPageOptions: options,
                    RequestType: 'GetTagPage'
                }, onSuccess, onFailure);
            },
            editTagPage: function(tagPage, tag, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TagPage: tagPage,
                    Tag: tag,
                    RequestType: 'EditTagPage'
                }, onSuccess, onFailure);
            },
            getTagPageStream: function(pageNumber, countPerPage, tag, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Tag: tag,
                    GetTagPageStreamOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetTagPageStream'
                }, onSuccess, onFailure);
            },
            getTagPageRelated: function(tag, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Tag: tag,
                    RequestType: 'GetTagPageRelated'
                }, onSuccess, onFailure);
            },
            setMainImage: function(imageFileEntry, tag, tagPage, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Tag: tag,
                    TagPage: tagPage,
                    MainImage: imageFileEntry,
                    RequestType: 'SetMainImage'
                }, onSuccess, onFailure);
            },
            requestLock: function(lock, tagPage, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TagPage: tagPage,
                    Lock: lock,
                    RequestType: 'RequestLock'
                }, onSuccess, onFailure);
            },
            removeLock: function(tagPage, onSuccess, onFailure) {
                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TagPage: tagPage,
                    RequestType: 'RemoveLock'
                }, onSuccess, onFailure);
            },
            getTagPageImageFromCache: function(tag) {
                if(tag.Tag) {
                    tag = tag.Tag;
                }
                // Do we have the tag in the cache?
                for(var i = 0; i < this.tagPages.length; i++) {
                    var tagPage = this.tagPages[i];
                    if(tagPage.Tag.toLowerCase() === tag.toLowerCase()) {
                        // match
                        if(tagPage.AlbumStack) {
                            var images = albumService.getAllImages(tagPage.AlbumStack);
                            if(images && images.length > 0) {
                                return images[Math.floor(Math.random()*images.length)];
                            }
                        }
                        if(tagPage.MainImage) {
                            return tagPage.MainImage;
                        }
                        break;
                    }
                }

                return null;
            },
            getTagPageImage: function(tag, onSuccess, onFailure) {
                var image = this.getTagPageImageFromCache(tag);

                if(image) {
                    onSuccess({
                        Image: image
                    });
                    return;
                }

                commService.postWithParams('tagpage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Tag: tag,
                    RequestType: 'GetTagPageImage'
                });
            }

        };
    }]);