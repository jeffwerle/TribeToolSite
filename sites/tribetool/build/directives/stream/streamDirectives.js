angular.module('app.Directives')
    .directive('streamPage', ['accountService', 'communityService', 'navigationService', 'tourService', 'mediaService', 'headerService', '$timeout',  function (accountService, communityService, navigationService, tourService, mediaService, headerService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="stream-page">' +
                    '<video-or-photo-header ng-if="!hideBanner" class="hidden-xs"></video-or-photo-header>' +
                    '<div class="col-md-3 col-sm-2"></div>' +
                    '<div class="col-md-6 col-sm-8" style="padding-right: 0px;">' +
                        //'<community-nav-header class="underneath-phone-header visible-xs-block"></community-nav-header>' +
                        '<universal-search-bar ng-if="showSearchBar" id="universalSearchBar" class="nav-search-bar universal-search-bar phone-universal-search-bar" ng-class="{\'underneath-phone-header\': mediaService.isPhone}"></universal-search-bar>' +
                        '<div ng-if="isLoggedIn">' +
                            '<stream></stream>' +
                        '</div>' +
                        '<div ng-if="!isLoggedIn">' +
                            '<h3 class="centered" style="margin-top: 20px; margin-bottom: 10px;">You\'re just a login away from seeing what your friends have to say about {{community.Options.Topic}}!</h3>' +
                            '<div class="centered" style="margin-bottom: 10px;">' +
                                '<button class="btn btn-primary" ng-click="goToCommunity()">Browse the Community</button>' +
                            '</div>' +
                            '<sign-up-inline></sign-up-inline>' +

                        '</div>' +
                    '</div>' +
                    /*
                    '<div class="col-sm-4 hidden-sm">' +
                        '<div class="dark-well stream-sidebar" style="margin-top:10px;">' +
                            '<news-items></news-items>' +
                        '</div>' +
                    '</div>' +
                    */
                    '<stream-tour></stream-tour>' +
                '</div>',
            scope: {
            },
            controller: ['$scope', function($scope) {
                headerService.options.showSearchBar = !mediaService.isPhone;
                $scope.mediaService = mediaService;
            }],
            link: function (scope, element, attrs) {
                $timeout(function() {
                    scope.showSearchBar = mediaService.isPhone;
                    scope.$watch('mediaService.isPhone', function(newValue) {
                        scope.showSearchBar = mediaService.isPhone;
                    });
                });
                scope.community = communityService.community;
                scope.isLoggedIn = accountService.isLoggedIn();

                scope.goToCommunity = function() {
                    navigationService.goToCommunity(communityService.community.Url);
                };


                scope.startTour = function() {
                    tourService.startTour();
                };
            }
        };
    }])
    .directive('stream', ['streamDirectiveService', function (streamDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<status-input ng-show="showStatusInput" options="statusInputOptions"></status-input>' +

                    '<div id="streamContainer" style="margin-right: 10px;" infinite-scroll="getMoreItems()" infinite-scroll-disabled="scrollingDone || processing" infinite-scroll-distance="2">' +
                        '<div style="margin-left: 5px;" ng-repeat="streamItem in streamItems">' +
                            '<div class="row">' +
                                '<div ng-if="streamItem.ItemType === \'Status\'">' +
                                    '<status-entry status="streamItem.Status"></status-entry>' +
                                '</div>' +
                                '<div ng-if="streamItem.ItemType === \'Event\'">' +
                                    '<stream-event stream-event="streamItem.Event"></stream-event>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div ng-show="processing"><loading></loading> Retrieving Stream...</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                streamDirectiveService.initializeStreamScope(scope);




                scope.$on('routeChangeSuccess', function() {
                    scope.reInitializeStream();
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