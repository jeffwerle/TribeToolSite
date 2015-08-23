angular.module('app.Services')
    .factory('sessionService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            destroySession: function(session, onSuccess, onFailure) {
                commService.postWithParams('session', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Session: session,
                    RequestType: 'DestroySession'
                }, onSuccess, onFailure);
            }
        };
    }]);