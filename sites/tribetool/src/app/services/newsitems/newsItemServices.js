angular.module('app.Services')
    .factory('newsItemService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            getNewsItems: function(pageNumber, countPerPage, onSuccess, onFailure) {
                commService.postWithParams('newsitem', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetNewsItemsOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'Get'
                }, onSuccess, onFailure);
            },
            createNewsItem: function(newsItem, onSuccess, onFailure) {
                commService.postWithParams('newsitem', {
                    Credentials: accountService.getCredentials(communityService.community),
                    NewsItem: newsItem,
                    RequestType: 'Create'
                }, onSuccess, onFailure);
            },
            editNewsItem: function(newsItem, onSuccess, onFailure) {
                commService.postWithParams('newsitem', {
                    Credentials: accountService.getCredentials(communityService.community),
                    NewsItem: newsItem,
                    RequestType: 'Edit'
                }, onSuccess, onFailure);
            },
            discardNewsItem: function(newsItem, onSuccess, onFailure) {
                commService.postWithParams('newsitem', {
                    Credentials: accountService.getCredentials(communityService.community),
                    NewsItem: newsItem,
                    RequestType: 'Discard'
                }, onSuccess, onFailure);
            }
        };
    }]);