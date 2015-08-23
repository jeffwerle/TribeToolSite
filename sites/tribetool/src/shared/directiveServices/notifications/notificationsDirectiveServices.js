angular.module('app.Services')
    .factory('notificationsDirectiveService', ['notificationService', 'commService', function(notificationService, commService) {
        return {
            initializeNotificationsScope: function(scope) {

                if(!scope.options) {
                    scope.options = { };
                }

                scope.options.allMarkedRead = false;
                scope.options.onNotificationMarkedRead = function() {
                    // See if all of our notifications are read now
                    var anyUnread = false;
                    for(var i = 0; i < scope.notifications.length; i++) {
                        if(!scope.notifications[i].IsRead) {
                            anyUnread = true;
                            break;
                        }
                    }
                    if(!anyUnread) {
                        scope.allMarkedRead = true;
                    }
                };

                scope.options.markNotificationRead = function(notification) {
                    notificationService.markRead(notification.Id, function(data) {
                        // Success
                        notification.IsRead = true;

                        if(scope.options && scope.options.onNotificationMarkedRead) {
                            scope.options.onNotificationMarkedRead();
                        }

                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });
                };


                scope.markAllRead = function() {
                    notificationService.markAllRead(function(data) {
                        // Success
                        for(var i = 0; i < scope.notifications.length; i++) {
                            scope.notifications[i].IsRead = true;
                        }
                        scope.allMarkedRead = true;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });
                };
            }
        };
    }]);