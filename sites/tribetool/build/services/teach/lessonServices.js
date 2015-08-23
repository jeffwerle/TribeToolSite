angular.module('app.Services')
    .factory('lessonService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            submitLesson: function(privateLesson, onSuccess, onFailure) {
                commService.postWithParams('lesson', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PrivateLesson: privateLesson,
                    RequestType: 'SubmitLesson'
                }, onSuccess, onFailure);
            }
        };
    }]);