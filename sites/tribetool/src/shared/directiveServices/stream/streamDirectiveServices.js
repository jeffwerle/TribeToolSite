angular.module('app.Services')
    .factory('streamDirectiveService', ['$timeout', '$location', 'navigationService', 'statusService', 'streamService', 'commService', 'profileService', 'accountService', '$rootScope', 'communityService', 'route', function($timeout, $location, navigationService, statusService, streamService, commService, profileService, accountService, $rootScope, communityService, route) {
        return {
            initializeStreamScope: function(scope) {

                scope.initializeStream = function() {
                    // Get the stream

                    if(scope.statusId) {
                        scope.processing = true;
                        // We're going to display one single status
                        // Let's get it
                        statusService.getStatus(scope.statusId, function(data) {
                            // Success
                            scope.streamItems = [ {
                                Status: data.Status,
                                ItemType: 'Status'
                            } ];
                            scope.processing = false;
                            scrollToCommentIfNecessary();
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        });
                    }
                    else {
                        scope.getMoreItems();
                    }
                };

                scope.reInitializeStream = function() {
                    if(scope.$$destroyed) {
                        return;
                    }

                    scope.showStatusInput = true;
                    scope.statusId = route.routeParams.status;

                    if(scope.statusId) {
                        // We're going to display a single status
                        // so don't show the input textbox
                        scope.showStatusInput = false;
                    }

                    scope.statusInputOptions = {
                        onComplete: function(status) {
                            // Insert the new status into the stream
                            scope.streamItems.splice(0, 0, {
                                Status: status,
                                ItemType: 'Status'
                            });

                            // scroll to the status the next render cycle
                            $timeout(function() {
                                navigationService.scrollToHash('status' + status.Id);
                            }, 0);
                        }
                    };

                    scope.pageNumber = 1;
                    scope.countPerPage = 10;
                    scope.scrollingDone = scope.statusId; // Don't do infinite scrolling if a specific status was requested
                    scope.serviceRetrievalDone = scope.scrollingDone;
                    scope.streamCache = [];
                    scope.streamItems = [];

                    scope.initializeStream();
                };



                var countToLoadFromCache = 3;

                var scrollToCommentIfNecessary = function() {
                    var commentId = route.routeParams.comment;
                    if(commentId) {
                        $timeout(function() {
                            navigationService.scrollToComment(commentId);
                        }, 0);
                    }
                };

                scope.getMoreItems = function() {
                    if(scope.processing || scope.scrollingDone || !accountService.account) {
                        return;
                    }

                    var pullFromCache = function() {
                        // Retrieve the items from the cache
                        var cacheLength = scope.streamCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.streamItems.push(scope.streamCache.shift());
                        }
                        if(scope.streamCache.length <= 0 && scope.serviceRetrievalDone) {
                            scope.scrollingDone = true;
                            $rootScope.$broadcast('scroll.infiniteScrollDisable');
                        }
                        $rootScope.$broadcast('scroll.infiniteScrollComplete');
                    };

                    if(scope.streamCache.length < countToLoadFromCache && !scope.serviceRetrievalDone) {
                        scope.processing = true;
                        streamService.getStream(scope.pageNumber,
                            scope.countPerPage,
                            profileService.currentProfile ? profileService.currentProfile.Id : null, /* targetAccountId */
                            function(data) {
                                // Success
                                if(data.StreamItems && data.StreamItems.length > 0)
                                    scope.streamCache = scope.streamCache.concat(data.StreamItems);

                                scope.serviceRetrievalDone = !data.StreamItems || data.StreamItems.length < scope.countPerPage;
                                pullFromCache();

                                $timeout(function() {
                                    scope.processing = false;
                                });

                                scope.pageNumber++;
                            }, function(data) {
                                // Failure
                                scope.processing = false;
                                commService.showErrorAlert(data);
                            });
                    }
                    else {
                        scope.processing = true;
                        $timeout(function() {
                            pullFromCache();
                            scope.processing = false;
                        });
                    }
                };
                scope.$on('scroll.infiniteScrollBegin', function(e, d) {
                    // Are we on the stream or profile page? We only want to intercept infinite scrolling if we're
                    // indeed on the stream or profile page
                    if(communityService.isOnStreamPage() || communityService.isOnProfilePage()) {
                        scope.getMoreItems();
                    }
                });


                scope.reInitializeStream();
            }
        };
    }]);