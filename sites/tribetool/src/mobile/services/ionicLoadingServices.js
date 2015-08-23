angular.module('app.Services')
    .factory('ionicLoadingService', ['$ionicLoading',function($ionicLoading) {
        return {
            show: function(options) {
                options.hideOnStateChange = true;
                return $ionicLoading.show(options);
            },
            hide: function() {
                return $ionicLoading.hide();
            }
        };
    }]);