angular.module('app.Services')
    .factory('searchService', ['accountService', 'communityService', 'commService', function(accountService, communityService, commService) {
        return {
            search: function(searchText, onSuccess, onFailure) {
                commService.postWithParams('search', {
                    Credentials: accountService.getCredentials(communityService.community),
                    SearchText: searchText,
                    SearchOptions: {
                        Communities: false,
                        TagPages: false,
                        Accounts: true,
                        Posts: true
                    },
                    RequestType: 'Search'
                }, onSuccess, onFailure);
            }
        };
    }]);