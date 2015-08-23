angular.module('app.Services')
    .factory('contactService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            sendEmail: function(name, email, contents, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('contact', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Message: {
                        Name: name,
                        Email: email,
                        Text: contents
                    }
                }, function(result) {
                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            }
        };
    }]);