angular.module('app.Directives')
    .directive('communityPageRouter', ['$rootScope', 'communityService', 'route', '$timeout', 'headerService', 'ionicHelperService', function ($rootScope, communityService, route, $timeout, headerService, ionicHelperService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="!filePath"><loading></loading> Loading...</div>' +
                    '<div ng-if="filePath" ng-include="filePath"></div>' +
                '</div>',
            // NOTE THAT WE DO NOT ISOLATE THE SCOPE (so that we can pass on controller variables)
            link: function (scope, element, attrs) {

                ionicHelperService.setNavView(scope, element);



                scope.$watch('communityService.page.name', function(newValue, oldValue) {
                    if(!newValue) {
                        return;
                    }

                    if(scope.viewName) {
                        if(newValue !== scope.viewName) {
                            // Save our scroll position if we're leaving our view
                            if(scope.scrollInstance && oldValue === scope.viewName) {
                                scope.scrollPosition = scope.scrollInstance.getScrollPosition();
                            }

                            // This page is not applicable to us, so let's make our view inactive
                            ionicHelperService.deactivateView(element);
                            return;
                        }
                        else {
                            // reload our scroll position
                            if(scope.scrollInstance && scope.scrollPosition) {
                                scope.scrollInstance.scrollTo(scope.scrollPosition.left, scope.scrollPosition.top, /*animate to the move*/false);
                            }
                        }
                    }

                    if(communityService.community && headerService.setTitle)
                        headerService.setTitle(communityService.community.Name);
                    if(headerService.options) {
                        headerService.options.buttons = [];
                    }


                    // Abort if we're not on a community page
                    if(!communityService.page.isCommunityPage) {
                        scope.filePath = null;

                    }

                    scope.pageName = newValue;

                    // Determine the new file path
                    var newFilePath = null;
                    var folder = communityService.getCommunityFolderName();
                    if(scope.pageName === 'stream')
                        newFilePath = 'sites/' + folder + '/app-templates/stream.html';
                    else if(scope.pageName === 'wiki')
                        newFilePath = 'sites/' + folder + '/app-templates/wiki.html';
                    else if(scope.pageName === 'profile')
                        newFilePath = 'sites/' + folder + '/app-templates/profile.html';
                    else if(scope.pageName === 'post')
                        newFilePath = 'sites/' + folder + '/app-templates/post.html';
                    else if(scope.pageName === 'map')
                        newFilePath = 'sites/' + folder + '/app-templates/map.html';
                    else if(scope.pageName === 'submit')
                        newFilePath = 'sites/' + folder + '/app-templates/submit.html';
                    else if(scope.pageName === 'learn')
                        newFilePath = 'sites/' + folder + '/app-templates/learn.html';
                    else if(scope.pageName === 'playlists')
                        newFilePath = 'sites/' + folder + '/app-templates/playlists.html';
                    else if(scope.pageName === 'landing') {
                        if(route.routeParams.topic) {
                            newFilePath = 'sites/' + folder + '/app-templates/landing/' + route.routeParams.topic + '.html';
                        }
                        else {
                            newFilePath = 'sites/' + folder + '/app-templates/landing.html';
                        }
                    }
                    else if(scope.pageName === 'tool')
                        newFilePath = 'sites/' + folder + '/app-templates/tool.html';
                    else if(scope.pageName === 'maps')
                        newFilePath = 'app-templates/maps/maps.html';
                    else if(scope.pageName === 'compatibility')
                        newFilePath = 'app-templates/compatibility/compatibility.html';
                    else if(scope.pageName === 'search')
                        newFilePath = 'app-templates/search/search.html';
                    else
                        newFilePath = 'sites/' + folder + '/app-templates/community.html';

                    var broadcastLoaded = function() {
                        $rootScope.$broadcast('router:' + scope.pageName + 'PageLoaded', communityService.page);
                    };
                    if(newFilePath !== scope.filePath) {
                        scope.filePath = null;
                        // ng-include the file path after a timeout so that we can process the
                        // rendering of the change of the header menu (so that the UI feels snappier).
                        $timeout(function() {
                            scope.filePath = newFilePath;
                            $timeout(function() {
                                broadcastLoaded();
                            });
                        });
                    }
                    else {
                        // The file path has not changed so no need to change anything
                        broadcastLoaded();
                    }


                });

            }
        };
    }]);