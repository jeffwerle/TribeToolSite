angular.module('app.Directives')
    .directive('notifications', ['commService', 'notificationService', '$timeout', 'friendService', 'notificationsDirectiveService', 'modalService', function (commService, notificationService, $timeout, friendService, notificationsDirectiveService, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="!processing && (!notifications || notifications.length <= 0)">' +
                        '<div>No new notifications received.</div>' +
                    '</div>' +
                    '<div ng-if="options.notificationCount > 0" style="margin-bottom: 10px;">' +
                        '<button ng-show="!allMarkedRead" class="btn btn-primary" ng-click="markAllRead()">Mark All Read</button>' +
                        '<span ng-show="allMarkedRead" style="color: green;"><i class="fa fa-check" ></i> All Read</span>' +
                    '</div>' +


                    // Show friend requests here
                    '<div ng-repeat="friendRequest in friendRequests">' +
                        '<div style="margin-bottom: 10px;" class="friend-request-well">' +
                            '<friend-request friend-request="friendRequest" options="friendRequestOptions"></friend-request>' +
                        '</div>' +
                    '</div>' +

                    '<ion-list>' +
                        '<div class="list">' +
                            '<a class="item pointer" ng-repeat="notification in notifications" ng-click="goToNotification(notification)">' +
                                '<div style="margin-bottom: 10px;" class="notification-well" ng-class="{\'unread\': !notification.IsRead}">' +
                                    '<notification notification="notification" options="options"></notification>' +
                                '</div>' +
                            '</a>' +
                        '</div>' +
                    '</ion-list>' +

                    '<ion-infinite-scroll ng-if="!scrollingDone" on-infinite="getMoreNotifications()" icon="ion-loading-c" distance="10%">' +
                    '</ion-infinite-scroll>' +


                    '<div ng-show="processing || processingFriendRequests">' +
                        '<loading></loading> Retrieving Notifications...' +
                    '</div>' +
                '</div>',
            scope: {
                notifications: '=',
                options: '='
            },
            link: function (scope, element, attrs) {

                notificationsDirectiveService.initializeNotificationsScope(scope);

                scope.goToNotification = function(notification) {
                    if(notification.onClick) {
                        notification.onClick();
                        modalService.closeAll();
                        scope.options.markNotificationRead(notification);
                    }
                };

                // Get the notifications
                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.scrollingDone = false;
                scope.notifications = [];

                /*
                scope.processingFriendRequests = true;
                friendService.getPendingFriendRequests(true,
                    false,
                    function(data) {
                        // Success
                        scope.friendRequests = data.RecipientFriendRequests;
                        scope.processingFriendRequests = false;
                    }, function(data) {
                        // Failure
                        scope.processingFriendRequests = false;
                        commService.showErrorAlert(data);
                    });
                */

                scope.getMoreNotifications = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    scope.processing = true;
                    notificationService.getNotifications(scope.pageNumber,
                        scope.countPerPage,
                        function(data) {
                            // Success

                            if(data.Notifications && data.Notifications.length > 0)
                                scope.notifications = scope.notifications.concat(data.Notifications);

                            // If there are unread messages then we're done scrolling (or if we were returned less
                            // notifications than we requested).
                            scope.scrollingDone = data.HasUnreadMessages || (!data.Notifications || data.Notifications.length < scope.countPerPage);

                            $timeout(function() {
                                scope.processing = false;
                                scope.$broadcast('scroll.infiniteScrollComplete');
                            });

                            scope.pageNumber++;
                            if(scope.options && scope.options.updateNotificationCount) {
                                scope.options.updateNotificationCount();
                            }
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                            scope.$broadcast('scroll.infiniteScrollComplete');
                        });
                };
                scope.getMoreNotifications();
            }
        };
    }]);