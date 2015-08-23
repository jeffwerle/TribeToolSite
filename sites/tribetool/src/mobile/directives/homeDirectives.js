angular.module('app.Directives')
    .directive('headerSearch', ['headerService', '$timeout', '$animate', 'communityService', 'navigationService', function(headerService, $timeout, $animate, communityService, navigationService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<span>' +
                    '<span ng-show="!headerService.options.showSearchBar">' +
                        '<button ng-repeat="b in headerService.options.buttons" style="margin-right: 10px;" class="button icon {{::b.iconClass}}" ng-click="b.onClick()"></button>' +
                    '</span>' +

                    '<button ng-show="!headerService.options.showSearchBar" ng-class="{ active: headerService.options.viewingNotifications, \'has-notifications\': headerService.options.notificationCount > 0}" class="notification-button button icon glyphicon glyphicon-globe pointer" ng-click="showNotifications()" title="Notifications"><div class="notification-number" ng-show="headerService.options.notificationCount > 0">{{headerService.options.notificationCount}}</div></a>' +
                    //'<button ng-class="{ active: viewingNotifications }" class="notification-button button icon glyphicon glyphicon-globe pointer has-notifications" ng-click="showNotifications()" title="Notifications"> <div class="notification-number">3</div></a>' +

                    '<button ng-show="!headerService.options.showSearchBar" class="button icon ion-ios-search" ng-click="searchButtonClicked()"></button>' +
                    '<div class="item-input-inset" ng-show="headerService.options.showSearchBar">' +
                        '<label class="item-input-wrapper">' +
                            '<i class="icon ion-ios-search placeholder-icon"></i>' +
                            '<input class="search-bar" ng-style="{width: headerService.options.searchBarActive ? headerService.options.maxWidth : minWidth}" ng-class="{\'focused\': headerService.options.searchBarActive}" ng-autofocus="headerService.options.autofocus" ng-blur="searchBarLostFocused()" ng-model="headerService.options.searchText" type="search" placeholder="Search">' +
                        '</label>' +
                    '</div>' +

                '</span>',
            controller: ['$scope', function($scope) {
                $scope.headerService = headerService;




                $scope.showNotifications = function() {
                    headerService.showNotifications();
                };
            }],
            link: function(scope, element, attrs) {

                // Is there already a header?
/*
                var navBarBlocks = $('.nav-bar-block');
                if(navBarBlocks.length >= 1) {
                    if(navBarBlocks[0]['$attr-nav-bar'] === 'cached') {
                        //navBarBlocks.remove();
                    }
                    // There is already a navbar, so we don't need to create this one.

                    scope.ready = true;
                }
                else {
                    return;
                }*/

                scope.minWidth = 50;




                scope.searchButtonClicked = function() {
                    // If the search button was clicked and we're not on the search page then
                    // go to the search page
                    if(communityService.page && communityService.page.name !== 'search') {
                        navigationService.goToPath('/search/' + communityService.community.Url);
                    }

                };

                scope.$on('communityPageLoaded', function() {
                    if(!communityService.page || communityService.page.name !== 'search') {
                        // Close the search bar
                        scope.searchBarLostFocused();
                    }
                });

                scope.$on('router:searchPageLoaded', function() {

                    // On the search page we should open up the search bar and autofocus it.
                    // But only do this if this header isn't cached
                    var navBarBlocks = element.parents('.nav-bar-block');
                    if(navBarBlocks.length >= 1) {
                        if(navBarBlocks[0]['$attr-nav-bar'] !== 'active' &&
                            navBarBlocks[0]['$attr-nav-bar'] !== 'entering') {
                            return;
                        }
                    }

                    //headerService.options.autofocus = true;
                    headerService.options.autofocus = false;
                    headerService.options.showSearchBar = true;

                    $timeout(function() {

                        var headers = $('.nav-bar-block .bar-header');
                        var header = null;
                        for(var i = headers.length - 1; i >= 0; i--) {
                            if(headers[i].clientWidth > 0) {
                                header = headers[i];
                                break;
                            }
                        }
                        if(header)
                            headerService.options.maxWidth = $(header).width() - 150;
                        else {
                            headerService.options.maxWidth = 200;
                        }

                        scope.headerService.setSearchBarActive(true);

                        $animate.addClass($('.search-bar'), 'draw').then(function() {
                            // The animation is complete
                            scope.$apply(function() {
                                $timeout(function() {
                                    headerService.options.autofocus = true;
                                }, 500);
                            });
                        });
                    });
                });

                scope.searchBarLostFocused = function() {
                    if(!communityService.page || communityService.page.name !== 'search') {
                        headerService.options.autofocus = false;
                        scope.headerService.setSearchBarActive(false);

                        $animate.removeClass($('.search-bar'), 'draw').then(function() {
                            // The animation is complete
                            scope.$apply(function() {
                                headerService.options.showSearchBar = false;
                            });
                        });
                    }
                };
            }
        };
    }])
    .directive('mainPageContentView', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div ng-if="!accountService.account.Confirmed">' +
                        '<ion-view>' +
                            '<ion-content class="has-header has-subheader">' +
                                '<unconfirmed-account></unconfirmed-account>' +
                            '</ion-content>' +
                        '</ion-view>' +
                    '</div>' +
                '</div>',
            link: function(scope, elem, attrs) {
            }
        };
    }])
    .directive('mainPageContent', ['$rootScope', 'headerService', 'communityService', 'accountService', function($rootScope, headerService, communityService, accountService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<ion-nav-bar class="bar-positive" ng-controller="headerController">' +
                        //'<ion-nav-back-button ng-click="back()"></ion-nav-back-button>' +

                        //'<ion-nav-back-button class="button-clear" ng-click="goBack()"><i class="icon ion-ios-arrow-back"></i> Back</ion-nav-back-button>' +


                        '<ion-nav-buttons side="left">' +
                            '<breadcrumb-back-button></breadcrumb-back-button>' +
                            '<button class="button button-icon button-clear ion-navicon" menu-toggle="left">' +
                            '</button>' +

                        '</ion-nav-buttons>' +

                        '<ion-nav-buttons side="right">' +
                            '<header-search></header-search>' +
                        '</ion-nav-buttons>' +



                    '</ion-nav-bar>' +

                    '<div class="bar bar-subheader">' +
                        '<h2 class="title">{{headerService.options.title}}</h2>' +
                    '</div>' +

                    '<main-page-content-view></main-page-content-view>' +

                    '<div ng-if="accountService.account.Confirmed">' +

                        '<ion-nav-view></ion-nav-view>' +

                        '<ion-nav-view name="community"></ion-nav-view>' +
                        '<ion-nav-view name="stream"></ion-nav-view>' +
                        '<ion-nav-view name="profile"></ion-nav-view>' +
                        '<ion-nav-view name="search"></ion-nav-view>' +
                    '</div>' +
                '</div>',
            controller: ['$scope', function($scope) {
                $scope.headerService = headerService;
                $scope.communityService = communityService;
                $scope.accountService = accountService;
            }],
            link: function(scope, elem, attrs) {

            }
        };
    }])
    .directive('indexContent', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +

                    /* We want to ng-if the login view so that we don't have the ion-nav-view when we're logged in (because
                     * we don't want to load content here--we want to load it in our other ion-nav-views) */
                    '<div ng-if="!isLoggedIn">' +
                        '<ion-nav-view></ion-nav-view>' +
                    '</div>' +

                    /* We don't want to ng-if the main content because ionic won't re-initialize itself if we're
                    * logging out and logging back in */
                    '<div ng-show="isLoggedIn">' +
                        '<ion-side-menus enable-menu-with-back-views="true">' +
                            '<div ng-include="\'app-templates/side-menu.html\'"></div>' +

                            '<ion-side-menu-content>' +

                                '<main-page-content></main-page-content>' +

                                '<div ng-include="\'app-templates/footer.html\'"></div>' +
                            '</ion-side-menu-content>' +
                        '</ion-side-menus>' +
                    '</div>' +

                '</div>',
            link: function(scope, elem, attrs) {
            }
        };
    }])
    .directive('loading', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<ion-spinner icon="android"></ion-spinner>',
            link: function(scope, elem, attrs) {
            }
        };
    }]);