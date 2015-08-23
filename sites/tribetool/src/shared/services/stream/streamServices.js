angular.module('app.Services')
    .factory('streamService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            getStream: function(pageNumber, itemsPerPage, targetAccountId, onSuccess, onFailure) {
                if(!accountService.account) {
                    if(onFailure)
                        onFailure('Please login.');
                    return;
                }

                commService.postWithParams('stream', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetStreamOptions: {
                        PageNumber: pageNumber,
                        ItemsPerPage: itemsPerPage,
                        TargetAccountId: targetAccountId
                    },
                    RequestType: 'GetStream'
                }, function(data) {

                    $rootScope.$broadcast('streamRetrieved', data.StreamItems);

                    if(onSuccess) {
                        onSuccess(data);
                    }

                }, onFailure);
            }
        };
    }]);