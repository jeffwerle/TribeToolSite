angular.module('app.Services')
    .factory('commentService', ['$rootScope', 'commService', 'accountService', 'communityService', 'statusService', 'postService', 'navigationService', function($rootScope, commService, accountService, communityService, statusService, postService, navigationService) {
        return {
            comment: function(commentEntry, onSuccess, onFailure) {
                if(!commentEntry.AccountId) {
                    commentEntry.AccountId = accountService.account.Id;
                }
                commService.postWithParams('comment', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Comment: commentEntry,
                    RequestType: 'Create'
                }, onSuccess, onFailure);
            },
            getComment: function(commentId, onSuccess, onFailure) {
                commService.postWithParams('comment', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Comment: {
                        Id: commentId,
                        AccountId: accountService.account ? accountService.account.Id : null,
                        CommunityId: communityService.community ? communityService.community.Id : null
                    },
                    RequestType: 'GetComment'
                }, onSuccess, onFailure);
            },
            getComments: function(pageNumber, countPerPage, accountId, onSuccess, onFailure) {
                commService.postWithParams('comment', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Comment: {
                        AccountId: accountId,
                        CommunityId: communityService.community ? communityService.community.Id : null
                    },
                    GetCommentsOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetComments'
                }, onSuccess, onFailure);
            },
            editComment: function(commentEntry, onSuccess, onFailure) {
                if(!commentEntry.AccountId) {
                    commentEntry.AccountId = accountService.account.Id;
                }
                commService.postWithParams('comment', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Comment: commentEntry,
                    RequestType: 'Edit'
                }, onSuccess, onFailure);
            },
            deleteComment: function(commentEntry, onSuccess, onFailure) {
                if(!commentEntry.AccountId) {
                    commentEntry.AccountId = accountService.account.Id;
                }
                commService.postWithParams('comment', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Comment: commentEntry,
                    RequestType: 'Delete'
                }, onSuccess, onFailure);
            },
            getCommentOptions: function(comment) {
                return {
                    status: comment.Status,
                    post: comment.Post,
                    imageFileEntry: comment.ImageFileEntry,
                    tagPage: comment.TagPage ? comment.TagPage : comment.ImageFileEntry ? comment.ImageFileEntry.TagPage : null
                };
            }
        };
    }]);