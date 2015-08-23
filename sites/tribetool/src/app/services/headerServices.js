angular.module('app.Services')
    .factory('headerService', ['$rootScope', '$http', 'commService', function($rootScope, $http, commService) {
        return {
            options: {
                showSearchBar: true,
                isToolbarOpen: false,
                useMinimalHeader: false,
                isCollapsed: true
                // showToolbar (populated later)
            }

        };
    }]);