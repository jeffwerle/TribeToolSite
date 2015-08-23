angular.module('app.Services')
    .factory('vcRecaptchaService', ['$rootScope', function($rootScope) {
        return {
            getResponse: function() {
                return 'mObile_@#183ttribe-ls231jAigm38ahC';
            }
        };
    }]);