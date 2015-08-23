angular.module('app.Controllers')
    .controller('communityViewController', ['$rootScope', '$scope', 'route', 'navigationService', 'commService', 'communityService', 'accountService', 'postService', 'profileService', 'OPTIONS', 'tagPageService', 'metaService', 'ionicHelperService', '$element', '$timeout', function($rootScope, $scope, route, navigationService, commService, communityService, accountService, postService, profileService, OPTIONS, tagPageService, metaService, ionicHelperService, $element, $timeout) {

        if(OPTIONS.isMobile)
            ionicHelperService.setNavView($scope, $element);

        var onDoneLoadingCommunity = function() {
            $scope.hasCommunityUrl = !!route.routeParams.communityUrl;
            if($scope.hasCommunityUrl) {
                communityService.resetLoadingFlag();
            }
        };
        onDoneLoadingCommunity();

        var runController = function() {

            if(metaService.prerenderUnready)
                metaService.prerenderUnready();


            $scope.hasCommunityUrl = !!route.routeParams.communityUrl;

            var path;
            if($scope.hasCommunityUrl) {
                var communityOptions = communityService.getCommunityOptionsFromUrl(route.routeParams.communityUrl);
                if(communityOptions.loading) {
                    // We're already loading this community so abort!
                    return;
                }

                // We have entered a community page
                communityService.page.isCommunityPage = true;

                $scope.loadCommunity = function(community, accountCommunity, communityChanged) {

                    $scope.community = community;

                    // Begin retrieving the posts for the community
                    if(OPTIONS.isMobile) {
                        postService.getPosts();
                    }

                    var onCommunityLoaded = function() {
                        // If we're not explicitly going to the wiki page then let's perform redirects
                        // of tags
                        if(!communityService.isOnWikiPage()) {
                            tagPageService.performRedirects = true;
                        }

                        // Indicate that we're no longer loading the community
                        onDoneLoadingCommunity();
                        $rootScope.$broadcast('communityPageLoaded', communityService.page);

                        // If this is a post page, get the post!
                        if(communityService.isOnPostPage()) {
                            // Do we already have the proper profile loaded? If so, no need to do anything
                            // Get the post!
                            postService.getPost(route.routeParams.postUrlId, route.routeParams.postUrl,
                                function(data) {
                                    // Success
                                    postService.post = data.Posts[0];
                                },
                                function(data) {
                                    // Failure
                                    commService.showErrorAlert(data);
                                });
                        }
                        else {
                            // Not a post page
                            // Tell the post service we're not on a post
                            postService.post = null;

                            // Tell the profile service we're not on a profile
                            profileService.currentProfile = null;

                            if(communityService.isOnProfilePage()) {
                                // Do we already have the proper profile loaded? If so, no need to do anything
                                if(!profileService.currentProfile || (profileService.currentProfile.Username.toLowerCase() !== route.routeParams.username.toLowerCase())) {
                                    // Get the profile!
                                    profileService.getProfile(route.routeParams.username,
                                        function(data) {
                                            // Success
                                            // Let the profile service know whose profile we're on
                                            $timeout(function() {
                                                profileService.setProfile(data.Profile);
                                            });

                                        },
                                        function(data) {
                                            // Failure
                                            commService.showErrorAlert(data);
                                        });
                                }
                            }
                        }
                    };

                    if(communityChanged) {
                        communityService.loadCommunityFiles(null, function(data) {
                            onCommunityLoaded(data);
                            communityService.onCommunityModulesLoaded(data);
                        });
                    }
                    else {
                        onCommunityLoaded();
                    }


                };



                // If we're redirecting to the profile page and we've been given a community name
                // but not a username then get the username or go to the standard profile page without
                // specifying the community.
                if(communityService.isOnProfilePage() &&
                    !route.routeParams.username) {

                    path = 'profile';
                    if(accountService.isLoggedIn()) {
                        path += '/' + route.routeParams.communityUrl + '/' + accountService.account.Username;
                    }
                    navigationService.goToPath(path, {
                        replaceHistory: true
                    });
                    return;
                }

                // Mark that the community is loading
                communityOptions.loading = true;


                communityService.getCommunity(route.routeParams.communityUrl,
                    function(data) {
                        // Success
                        $scope.loadCommunity(data.Community, data.AccountCommunity, data.communityChanged);


                    }, function(data) {

                        // Failure
                        commService.showErrorAlert('Could not find community ' + route.routeParams.communityUrl + '.');
                        communityService.getDefaultCommunity(function(d) {
                                // Success
                                $scope.loadCommunity(d.Community, d.AccountCommunity, d.communityChanged);
                            },
                            function(d) {
                                // Failure
                            });
                    });
            }

        };

        var shouldTakeAction = function() {
            return !$scope.viewName || (communityService.page && communityService.page.name === $scope.viewName);
        };

        $scope.$on('routeChangeSuccess', function(e, state) {
            // Only update the controller if applicable (if it's for our view)
            if(shouldTakeAction())
                runController();
        });
        $scope.$on('communityController:refreshView', function(e) {
            if(shouldTakeAction()) {
                $scope.hasCommunityUrl = false;

                // We need to remove the index.html div but we don't want to recreate it until we
                // know it's gone so we'll poll for its existence.
                var poll = function() {
                    $timeout(function() {
                        // Is the index file path root still here?
                        var indexFilePathRoot = $element.find('#communityIndexFilePathRoot');
                        if(!indexFilePathRoot || indexFilePathRoot.length <= 0) {
                            // Recreate the root
                            $scope.hasCommunityUrl = true;
                            runController();
                            $rootScope.$broadcast('scroll.refreshComplete');
                        }
                        else {
                            poll();
                        }

                    }, 100);
                };
                poll();


            }
        });
        runController();

    }])
    .controller('communityController', ['$timeout', '$rootScope', '$scope', 'route', 'navigationService', 'commService', 'communityService', 'accountService', 'headerService', function($timeout, $rootScope, $scope, route, navigationService, commService, communityService, accountService, headerService) {

        $scope.communityService = communityService;


        $scope.communityServiceCallbacks = {
            onCommunityModulesLoaded: function(data) {
                $scope.communityOptions = data.communityOptions;

                if(!$scope.$root) {
                    $timeout(function() {
                        communityService.removeCallback($scope.communityServiceCallbacks);
                    });
                }
            }
        };


        $scope.resetInfiniteScroll = function() {
            $scope.disableInfiniteScrolling = false;
            $rootScope.$broadcast('scroll.infiniteScrollComplete');
        };

        $scope.$on('routeChangeSuccess', function(e, state) {
            $scope.resetInfiniteScroll();
            $scope.hasCommunityUrl = !!route.routeParams.communityUrl;

            var isCommunityPage = route.isUsingState ? !angular.isDefined(state.params.isCommunityPage) || state.params.isCommunityPage : route.current && route.current.$$route ? route.current.$$route.templateUrl.indexOf('community.tpl.html') >= 0 : false;
            if(isCommunityPage) {
                if(!$scope.hasCommunityUrl) {
                    // We're supposed to have a community url since we're on a community page, so let's redirect!

                    communityService.page = null;

                    // Add the community name to the route params and reload
                    var communityUrl = accountService.account && accountService.account.PreferredCommunityUrl ? accountService.account.PreferredCommunityUrl : communityService.getDefaultCommunityUrl();

                    var page = communityService.page;
                    if(!page) {
                        page = communityService.getPage();
                    }
                    path = page.name + '/' + communityUrl;
                    if(page.name === 'profile' &&
                        accountService.isLoggedIn()) {
                        path += '/' + accountService.account.Username;
                    }
                    navigationService.goToPath(path, {
                        replaceHistory: true
                    });
                }
                else {
                    // We'll be staying on this route so set the page
                    communityService.setPage(state);
                }
            }
            else {
                // not a community page
                communityService.page = null;
            }
        });

        $scope.$on('$destroy', function() {
            communityService.removeCallback($scope.communityServiceCallbacks);
        });
        communityService.callbacks.push($scope.communityServiceCallbacks);


        $scope.communityControllerForm = {
            isRefreshing: false
        };
        $scope.refreshView = function() {
            $scope.resetInfiniteScroll();
            headerService.updateNotificationCount();

            if(communityService.page && communityService.isOnCommunityPage()) {
                postService.posts = [];
            }

            $rootScope.$broadcast('communityController:refreshView');
        };


        $scope.onInfiniteScroll = function() {
            $rootScope.$broadcast('scroll.infiniteScrollBegin');
        };
        $scope.disableInfiniteScrolling = false;
        $scope.$on('scroll.infiniteScrollDisable', function(e, d) {
            $scope.disableInfiniteScrolling = true;
        });
    }]);