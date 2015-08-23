angular.module('app.Directives')
    .directive('streamPage', [  function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<stream></stream>' +
                '</div>',
            scope: {
            },
            controller: ['$scope', function($scope) {
            }],
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('stream', ['streamDirectiveService', 'communityService', function (streamDirectiveService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<status-input ng-show="showStatusInput" options="statusInputOptions"></status-input>' +

                    '<ion-list id="streamContainer">' +
                        '<div ng-repeat="streamItem in streamItems">' +
                            '<div ng-if="streamItem.ItemType === \'Status\'">' +
                                '<status-entry status="streamItem.Status"></status-entry>' +
                            '</div>' +
                            '<div ng-if="streamItem.ItemType === \'Event\'">' +
                                '<stream-event stream-event="streamItem.Event"></stream-event>' +
                            '</div>' +
                        '</div>' +
                    '</ion-list>' +

                    //'<ion-infinite-scroll ng-if="!scrollingDone" on-infinite="getMoreItems()" icon="ion-loading-c" distance="10%">' +
                    //'</ion-infinite-scroll>' +

                    '<div ng-show="processing"><loading></loading> Retrieving Stream...</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                streamDirectiveService.initializeStreamScope(scope);

                scope.$on('router:streamPageLoaded', function() {
                    scope.reInitializeStream();
                });
                scope.$on('routeChangeSuccess', function() {
                    if(communityService.isOnStreamPage()) {
                        scope.reInitializeStream();
                    }
                });
            }
        };
    }])
    .directive('streamEvent', ['communityService', 'streamService', 'commService', function (communityService, streamService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '{{streamEvent.Title}}' +
                '</div>',
            scope: {
                streamEvent: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }]);