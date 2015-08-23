angular.module('app.Services')
    .factory('headerService', ['$rootScope', '$socket', 'notificationService', 'modalService', '$timeout', function($rootScope, $socket, notificationService, modalService, $timeout) {

        var service = {
            options: {
                notificationCount: 0,
                viewingNotifications: false,

                searchBarActive: false,
                showSearchBar: false,
                maxSearchBarWidth: 200,
                searchText: '',
                autofocus: false,
                title: 'TribeTool',
                /*
                 {
                 iconClass: string // 'ion-ios-search', for example
                 onClick:
                 }
                 */
                buttons: []
            },
            setSearchBarActive: function(active) {
                this.options.searchBarActive = active;
            },
            setTitle: function(title) {
                this.options.title = title;
            },
            updateNotificationCount: function() {
                // See if we have any outstanding notifications
                var self = this;
                notificationService.getNotificationsCount(function(data) {
                    // Success
                    self.options.notificationCount = data.NotificationCount;
                }, function(data) {
                    // Failure
                });
            },
            showNotifications: function() {
                this.viewingNotifications = true;
                var self = this;
                modalService.open({
                    templateUrl: 'app-templates/notifications/notifications.html',
                    controller: 'notificationsController',
                    windowClass: 'notifications-modal',
                    resolve: {
                        items: function () {
                            return [{
                                notificationCount: self.options.notificationCount
                            }];
                        }
                    }
                }, function (data) {
                    self.viewingNotifications = false;

                    // Modal OK
                }, function () {
                    self.viewingNotifications = false;
                    // Modal dismissed
                    // Update the notification count since we may have just read notifications
                    $timeout(function() {
                        self.updateNotificationCount();
                    }, 1000);
                });
            }
        };

        $socket.on('notification', function(arg) {
            var data = arg.data;

            if(!notificationService.handleSocketNotification(arg)) {
                return;
            }

            // Notification received
            // data.notification
            service.updateNotificationCount();

        });

        $rootScope.$on('sessionCreate', function(event, account) {
            service.updateNotificationCount();
        });


        return service;
    }]);