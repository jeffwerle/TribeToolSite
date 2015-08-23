var appDirectivesModule = angular.module('app.Directives', []);

appDirectivesModule
    .filter('encodeUri', ['$window', function ($window) {
        return $window.encodeURIComponent;
    }]);




