// Mocking $ionicPlatform
angular.module('app.Services')
    .factory('$ionicPlatform', [function() {
        return {
            ready: function(func) {
                return func();
            }
        };
    }])
    .factory('$ionicHistory', [function() {
        return {
        };
    }])
    .factory('$ionicBackdrop', [function() {
        return {
        };
    }])
    .factory('$ionicGesture', [function() {
        return {
        };
    }])
    .factory('$ionicNavBarDelegate', [function() {
        return {
            title: function() {

            }
        };
    }])
    .factory('$ionicScrollDelegate', [function() {
        return {
        };
    }])
    .factory('$ionicNavViewDelegate', [function() {
        return {
        };
    }])
    .factory('$ionicActionSheet', [function() {
        return {
        };
    }])
    .factory('$cordovaAppAvailability', [function() {
        return {
        };
    }])
    .factory('$cordovaGoogleAnalytics', [function() {
        return {
        };
    }])
    .factory('$ionicConfig', [function() {
        return {
        };
    }])
    .factory('$cordovaSQLite', [function() {
        return {
        };
    }])

    .factory('$ionicLoading', [function() {
        return {
            hide: function() { },
            show: function() { }
        };
    }]);



