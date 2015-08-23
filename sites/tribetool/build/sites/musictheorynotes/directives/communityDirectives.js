angular.module('cmusictheorynotes.Directives')
    .directive('cmusictheorynotesCommunitySidebar', ['dmusiclibraryNavigationService', 'communityService', function(musicNavigationService, communityService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div class="centered"><button class="btn btn-primary" ng-click="goToBazzle()">Bazzle!</button></div>' +
                    '<div class="centered" style="margin-top: 10px;"><button class="btn btn-primary" ng-click="goToVirtualCowriter()">Virtual Co-writer</button></div>' +
                '</div>',
            controller: ['$scope', function($scope) {

            }],
            link: function(scope, elem, attrs) {
                scope.goToBazzle = function() {
                    musicNavigationService.goToBazzle();
                };
                scope.goToVirtualCowriter = function() {
                    musicNavigationService.goToVirtualCowriter();
                };
            }
        };
    }]);