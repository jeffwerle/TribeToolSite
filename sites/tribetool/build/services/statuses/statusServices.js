angular.module('app.Services')
    .factory('statusService', ['$rootScope', 'commService', 'accountService', 'communityService', 'streamService', function($rootScope, commService, accountService, communityService, streamService) {
        return {
            createStatus: function(statusEntry, onSuccess, onFailure) {
                if(!statusEntry.AccountId) {
                    statusEntry.AccountId = accountService.account.Id;
                }
                commService.postWithParams('status', {
                    Credentials: accountService.getCredentials(communityService.community),
                    StatusEntry: statusEntry,
                    RequestType: 'Create'
                }, onSuccess, onFailure);
            },
            deleteStatus: function(statusEntry, onSuccess, onFailure) {
                commService.postWithParams('status', {
                    Credentials: accountService.getCredentials(communityService.community),
                    StatusEntry: statusEntry,
                    RequestType: 'Delete'
                }, onSuccess, onFailure);
            },
            editStatus: function(statusEntry, onSuccess, onFailure) {
                commService.postWithParams('status', {
                    Credentials: accountService.getCredentials(communityService.community),
                    StatusEntry: statusEntry,
                    RequestType: 'Edit'
                }, onSuccess, onFailure);
            },
            getStatus: function(statusId, onSuccess, onFailure) {
                commService.postWithParams('status', {
                    Credentials: accountService.getCredentials(communityService.community),
                    StatusEntry: {
                        Id: statusId
                    },
                    RequestType: 'GetStatus'
                }, onSuccess, onFailure);
            }
        };
    }]);