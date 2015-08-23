angular.module('app.Directives')
    .directive('breadcrumbBackButton', ['breadcrumbService', function (breadcrumbService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="breadcrumbService.options.allowBackButton && breadcrumbService.history.length > 1" class="button back-button buttons button-clear" ng-click="goBack()"><i class="icon ion-ios-arrow-back"></i></div>',
            controller: ['$scope', function($scope) {
                $scope.breadcrumbService = breadcrumbService;
            }],
            link: function (scope, element, attrs) {

                scope.goBack = function() {
                    breadcrumbService.goBack();
                };
            }
        };
    }]);