angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryToolRouter', ['$routeParams', function ($routeParams) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="route===\'bazzle\'">' +
                        '<dmusiclibrary-bazzle></dmusiclibrary-bazzle>' +
                    '</div>' +
                    '<div ng-if="route===\'vc\'">' +
                        '<dmusiclibrary-virtual-cowriter></dmusiclibrary-virtual-cowriter>' +
                    '</div>' +
                    '<div ng-if="!route">' +
                        '<dmusiclibrary-browse-tools></dmusiclibrary-browse-tools>' +
                    '</div>' +
                '</div>',
            scope: {

            },
            link: function (scope, element, attrs) {
                scope.routeParams = $routeParams;
                scope.$watch('routeParams.toolRoute', function(newValue){
                    scope.route = newValue;
                    if(scope.route) {
                        scope.route = scope.route.toLowerCase();
                    }
                });

            }
        };
    }])
    .directive('dmusiclibraryBrowseTools', ['$routeParams', function ($routeParams) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    'Tools!' +
                '</div>',
            scope: {

            },
            link: function (scope, element, attrs) {

            }
        };
    }]);