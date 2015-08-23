angular.module('app.Controllers')
    .controller('headerController', ['$scope', '$rootScope', '$timeout', 'modalService', 'notificationService', 'communityService', 'accountService', '$socket', 'commService', 'friendService', 'profileService', 'mediaService', 'toolbarService', 'formatterService', 'messageService', 'navigationService', 'marketingService', '$window', 'headerService', 'socketService', function($scope, $rootScope, $timeout, modalService, notificationService, communityService, accountService, $socket, commService, friendService, profileService, mediaService, toolbarService, formatterService, messageService, navigationService, marketingService, $window, headerService, socketService) {


        //var compiledHtml = $compile('<div>N<br/><ul><li>F</li></ul><h1 class="wiki-header wiki-header-1">Test</h1></div>')($scope);


        $scope.communityService = communityService;
        $scope.isPhone = mediaService.isPhone;
        $scope.isTeacher = accountService.isTeacher();
        $scope.toolbarIconClicked = function() {
            $scope.headerService.options.showToolbar = true;
            $scope.headerService.options.isToolbarOpen = true;
        };
        $scope.headerService = headerService;

        $scope.headerService.options.showToolbar = !$scope.isPhone;

        $scope.$on('$routeChangeStart', function() {
            $scope.headerService.options.useMinimalHeader = false;
            headerService.options.showSearchBar = true;
        });

        $scope.$on('communityPageLoaded', function(event, page) {
            if(page.name === 'landing') {
                $scope.headerService.options.useMinimalHeader = true;
                if(!$scope.isPhone) {
                    $scope.headerService.options.showToolbar = false;
                }
            }
        });


        $scope.initialized = function() {
        };

        toolbarService.callbacks.push({
            onToolbarClosed: function() {
                $scope.headerService.options.showToolbar = false;
                $scope.headerService.options.isToolbarOpen = false;
                $scope.updateSearchBarWidth();
            },
            onToolbarOpened: function() {
                $scope.headerService.options.showToolbar = true;
                $scope.headerService.options.isToolbarOpen = true;
                $scope.updateSearchBarWidth();
            }
        });




        $scope.notificationCount = 0;
        $scope.friendRequestCount = 0;
        $scope.messageCount = 0;

        $scope.updateMessageCount = function() {
            // See if we have any unread messages
            messageService.getUnreadMessageCount(function(data) {
                // Success
                $scope.messageCount = data.MessageCount;
            }, function(data) {
                // Failure
            });
        };
        messageService.callbacks.push({
            conversationRead: function() {
                $scope.updateMessageCount();
            },
            conversationMessageReceived: function(data) {
                $scope.updateMessageCount();
            }
        });

        $scope.updateNotificationCount = function() {
            // See if we have any outstanding notifications
            notificationService.getNotificationsCount(function(data) {
                // Success
                $scope.notificationCount = data.NotificationCount;
            }, function(data) {
                // Failure
            });
        };

        $scope.updateFriendRequestCount = function() {
            // See if we have any outstanding notifications
            friendService.getPendingFriendRequests(/*populateRequesterData*/false,
                /*populateRecipientData*/false,
                function(data) {
                // Success
                $scope.friendRequestCount = data.RecipientFriendRequests.length;
            }, function(data) {
                // Failure
            });
        };

        $scope.updateAlerts = function() {
            $scope.updateNotificationCount();
            $scope.updateFriendRequestCount();
            $scope.updateMessageCount();
        };


        $scope.updateSearchBarWidth = function() {
            if(!mediaService.isPhone && !$scope.headerService.options.useMinimalHeader) {
                $timeout(function() {
                    if($scope.headerService.options.useMinimalHeader) {
                        return;
                    }

                    // Only resize the inline search bar
                    var universalSearchBar = $('.inline-universal-search-bar');
                    if(universalSearchBar.length <= 0) {
                        return;
                    }

                    var leftElement = $('#profileHeaderMenu');
                    if(leftElement.length <= 0) {
                        leftElement = $('#wikiHeaderMenu');
                    }

                    var rightElement = $('#toolbarIconHeader');
                    if(rightElement.length <= 0) {
                        rightElement = $('#notificationsHeader');
                    }
                    if(rightElement.length <= 0) {
                        rightElement = $('#headerSignUpButton');
                    }

                    // +40 for the profile picture in the header
                    var searchBarWidth = rightElement[0].getBoundingClientRect().left - (leftElement[0].getBoundingClientRect().right + 40);

                    var minWidth = 50;
                    if(searchBarWidth <= minWidth) {
                        searchBarWidth = minWidth ;
                    }
                    universalSearchBar.width(searchBarWidth);
                });
            }
        };
        var $$window = $($window);
        $$window.bind('resize', function() {
            $scope.updateSearchBarWidth();
        });

        $scope.updateSearchBarWidth();

        $rootScope.$on('sessionCreate', function(event, account) {
            $scope.isTeacher = accountService.isTeacher();
            $scope.updateAlerts();
            $scope.updateSearchBarWidth();
        });
        $scope.$on('$routeChangeSuccess', function() {
            $scope.updateSearchBarWidth();
        });


        $rootScope.$on('communityChanged', function(event, community) {
            $scope.community = community;

            formatterService.updateMarkdownCommunityReferences();
            $scope.recache();
            $scope.updateSearchBarWidth();
        });

        $rootScope.$on('communityControllerLoaded', function(event, controller) {
            $scope.updateSearchBarWidth();
        });



        if(accountService.isLoggedIn()) {
            $scope.updateAlerts();
        }


        $scope.recache = function() {
            socketService.recache();
        };
        $scope.recache();

        $socket.on('notification', function(arg) {
            var data = arg.data;

            if(!notificationService.handleSocketNotification(arg)) {
                return;
            }



            // Notification received
            // data.notification
            $scope.updateNotificationCount();

            if(data && data.notification && data.notification.NotificationType) {
                var socialInteractionProfileName = data.notification.SocialInteractionAccount ? profileService.getProfileFullName(data.notification.SocialInteractionAccount) : 'Someone';
                if(data.notification.NotificationType === 'Achievement') {
                    // User has received an achievement
                    commService.showInfoAlert('You\'ve received an achievement!', {
                        onlyIfUnique: true
                    });
                }
                else if(data.notification.NotificationType === 'ReceivedCommentReply') {
                    // Someone replied to our comment
                    commService.showInfoAlert(socialInteractionProfileName + ' replied to your comment!', {
                        onCloseClick: function(d) {
                            // Go to comment
                            navigationService.goToPath(navigationService.getCommentUrl(data.notification.Comment, {
                                community: data.notification.Community || communityService.community,
                                status: data.notification.Status,
                                post: data.notification.Post,
                                imageFileEntry: data.notification.ImageFileEntry
                            }));
                        }
                    });
                }
                else if(data.notification.NotificationType === 'ReceivedStatus') {
                    // Someone posted a status on the current user's profile
                    commService.showInfoAlert(socialInteractionProfileName + ' posted a status on your profile!', {
                        onCloseClick: function(d) {
                            // Go to status
                            navigationService.goToPath(navigationService.getStatusUrl(data.notification.Status, data.notification.Community || communityService.community));
                        }
                    });
                }
                else if(data.notification.NotificationType === 'ReceivedStatusReply') {
                    // Someone replied to our status
                    commService.showInfoAlert(socialInteractionProfileName + ' replied to your status!', {
                        onCloseClick: function(d) {
                            // Go to status
                            navigationService.goToPath(navigationService.getStatusUrl(data.notification.Status, data.notification.Community || communityService.community));
                        }
                    });
                }
                else if(data.notification.NotificationType === 'ReceivedPostReply') {
                    // Someone replied to our post
                    commService.showInfoAlert(socialInteractionProfileName + ' replied to your post!', {
                        onCloseClick: function(d) {
                            // Go to post
                            navigationService.goToPath(navigationService.getPostUrl(data.notification.Post, data.notification.Community || communityService.community));
                        }
                    });
                }
                else if(data.notification.NotificationType === 'FriendRequestReceived') {
                    // Friend request received--update friend request count
                    $scope.updateFriendRequestCount();
                }

                if(data.notification.XP > 0) {
                    commService.showSuccessAlert('+' + data.notification.XP + ' XP', {
                        layout: 'bottomRight'
                    });
                }
            }
        });



        $scope.viewingNotifications = false;
        $scope.showNotifications = function() {
            $scope.viewingNotifications = true;
            modalService.open({
                templateUrl: 'app-templates/notifications/notifications.html',
                controller: 'notificationController',
                windowClass: 'notifications-modal',
                resolve: {
                    items: function () {
                        return [{
                            updateNotificationCount: $scope.updateNotificationCount,
                            notificationCount: $scope.notificationCount
                        }];
                    }
                }
            }, function (data) {
                $scope.viewingNotifications = false;

                // Modal OK
                /*
                 if(onSelect)
                 onSelect(data);
                 */
            }, function () {
                $scope.viewingNotifications = false;
                // Modal dismissed
                // Update the notification count since we may have just read notifications
                $timeout(function() {
                    $scope.updateNotificationCount();
                }, 1000);
            });
        };

        $scope.viewingFriendRequests = false;
        $scope.showFriendRequests = function() {
            $scope.viewingFriendRequests = true;
            modalService.open({
                templateUrl: 'app-templates/friends/friend-requests.html',
                controller: 'friendRequestsController',
                windowClass: 'notifications-modal',
                resolve: {
                    items: function () {
                        return [];
                    }
                }
            }, function (data) {
                $scope.viewingFriendRequests = false;
                // Update the friend request count since we just processed friend requests
                $scope.updateFriendRequestCount();
                /*
                 // Modal OK
                 if(onSelect)
                 onSelect(data);
                 */
            }, function () {
                $scope.viewingFriendRequests = false;
                // Modal dismissed
                // Update the friend request count since we just processed friend requests
                $scope.updateFriendRequestCount();
            });

        };


        $scope.signUp = function() {
            navigationService.goToPath('/register');
            $timeout(function() {
                var marketingActionEntry = {
                    Action: 'HeaderSignUpButtonClicked',
                    Data: []
                };

                marketingService.logMarketingAction(marketingActionEntry);
            });

        };

        $scope.logoClicked = function() {
            if(!accountService.isLoggedIn()) {
                // If we're already on the landing page then go to the community page
                if(communityService.page.name === 'landing') {
                    navigationService.goToPath('/community');
                }
                else {
                    // Go the landing page since we're not logged in and the user
                    // wants to know about the community
                    navigationService.goToPath('/landing');
                }

            }
        };


    }]);