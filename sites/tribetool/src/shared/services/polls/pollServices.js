angular.module('app.Services')
    .factory('pollService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            selectPollOption: function(postId, pollOptionId, onSuccess, onFailure) {
                commService.postWithParams('poll', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PostId: postId,
                    PollOptionId: pollOptionId,
                    RequestType: 'SelectOption'
                }, onSuccess, onFailure);
            }
        };
    }]);