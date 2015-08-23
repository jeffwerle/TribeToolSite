angular.module('app.Services')
    .factory('mobileNotificationService', ['$rootScope', 'communityService', '$socket', 'notificationService', '$cordovaLocalNotification', '$ionicPlatform', 'ionicHelperService', 'profileService', 'headerService', 'accountService', '$cordovaPush', 'commService', function($rootScope, communityService, $socket, notificationService, $cordovaLocalNotification, $ionicPlatform, ionicHelperService, profileService, headerService, accountService, $cordovaPush, commService) {
        var service = {
            getLocalNotificationData: function(notification) {
                var type = notification.NotificationType;

                var socialInteractionAccount = notification.SocialInteractionAccount;
                var accountName = socialInteractionAccount ? profileService.getProfileFullName(socialInteractionAccount) : '';
                if(type === 'ReceivedPostReply') {
                    return {
                        title: 'You Received a Post Reply',
                        text: accountName + ' replied to your post: \"' + notification.Post.Title + '\".'
                    };
                }
                else if(type === 'ReceivedCommentReply') {
                    return {
                        title: 'You Received a Comment Reply',
                        text: accountName + ' replied to your comment.'
                    };
                }
                else if(type === 'ReceivedStatusReply') {
                    return {
                        title: 'You Received a Status Reply',
                        text: accountName + ' replied to your status.'
                    };
                }
                else if(type === 'LevelUp') {
                    return {
                        title: 'You Leveled Up!',
                        text: notification.Message
                    };
                }
                else if(type === 'ReceivedEmotionVote') {
                    return {
                        title: 'You received an Emotion Vote!',
                        text: accountName + ' emotion voted on your content.'
                    };
                }
                else if(type === 'FriendRequestReceived') {
                    return {
                        title: 'You Received a Friend Request',
                        text: accountName + ' sent you a friend request!'
                    };
                }
                else if(type === 'MentionedInComment') {
                    return {
                        title: 'You Were Mentioned in a Comment',
                        text: accountName + ' mentioned you in a comment!'
                    };
                }
                else if(type === 'MentionedInStatus') {
                    return {
                        title: 'You Were Mentioned in a Status',
                        text: accountName + ' mentioned you in a status!'
                    };
                }
                else if(type === 'MentionedInPost') {
                    return {
                        title: 'You Were Mentioned in a Post',
                        text: accountName + ' mentioned you in a post!'
                    };
                }
                else if(type === 'ReceivedMessage') {
                    return {
                        title: 'You Received a Message',
                        text: accountName + ' send you a message!'
                    };
                }
                else if(type === 'ReceivedStatus') {
                    return {
                        title: 'You Received a Status',
                        text: accountName + ' posted a status on your profile!'
                    };
                }
                else if(type === 'ReceivedItemPinned') {
                    return {
                        title: 'Your Item was Pinned',
                        text: accountName + ' pinned your item!'
                    };
                }
            }
        };

        $rootScope.$on('$cordovaLocalNotification:click', function(event, notification, state) {
            headerService.showNotifications();
        });

        $socket.on('notification', function(arg) {

            var data = arg.data;


            if(!notificationService.isSocketNotificationApplicable(arg)) {
                return false;
            }

            var notification = data.notification;
            // Only show the notification if the app is in the foreground. If it's in the background
            // then push notifications will be shown.
            if(notification && ionicHelperService.isInForeground) {
                var localNotificationData = service.getLocalNotificationData(notification);
                if(localNotificationData) {
                    $ionicPlatform.ready(function () {
                        // http://ngcordova.com/docs/plugins/localNotification/
                        // https://github.com/katzer/cordova-plugin-local-notifications/wiki/04.-Scheduling#interface
                        var localNotification = angular.extend({
                            id: notification.Id,
                            data: { }
                        }, localNotificationData);

                        if(ionicHelperService.isAndroid()) {
                            localNotification.led = '387ef5';
                        }

                        // Send the local notification
                        $cordovaLocalNotification.schedule(localNotification)
                            .then(function (result) {
                                // notification clicked
                            }, function(result) {
                            });

                    });
                }
            }

        });



        $ionicPlatform.ready(function () {
            document.addEventListener('resume', function() {
                // The app is in the foreground
                ionicHelperService.isInForeground = true;
            });
            document.addEventListener('pause', function() {
                // The app is in the  background
                ionicHelperService.isInForeground = false;
            });

            if(ionicHelperService.isAndroid()) {
                // NOTE: Use Project Number, not Project Id
                // https://console.developers.google.com/project
                var androidConfig = {
                    "senderID": "750763559364"
                };

                $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
                    switch(notification.event) {
                        case 'registered':
                            if (notification.regid && notification.regid.length > 0 ) {
                                accountService.addAccountDevice(notification.regid, ionicHelperService.getDeviceType(), function(data) {
                                    // Success
                                }, function(data) {
                                    // Failure
                                });
                            }
                            break;

                        case 'message':
                            // this is the actual push notification. its format depends on the data model from the push server
                            //alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
                            // https://github.com/hollyschinsky/PushNotificationSample/blob/master/www/js/controllers.js
                            if(notification.foreground) {
                                // The app is in the foreground
                            }
                            else {
                                // The app is in the background
                            }
                            break;

                        case 'error':
                            console.log('GCM error = ' + notification.msg);
                            break;
                        default:
                            console.log('An unknown GCM event has occurred');
                            break;
                    }
                });


                $cordovaPush.register(androidConfig).then(function(result) {
                    // Success
                }, function(err) {
                    // Error
                    commService.showErrorAlert(err);
                });
            }
            else if(ionicHelperService.isIOS()) {
                var iosConfig = {
                    "badge": true,
                    "sound": true,
                    "alert": true
                };

                $cordovaPush.register(iosConfig).then(function(deviceToken) {
                    accountService.addAccountDevice(deviceToken, ionicHelperService.getDeviceType(), function(data) {
                        // Success

                    }, function(data) {
                        // Failure
                    });
                }, function(err) {
                    commService.showErrorAlert(err);
                });

                $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
                    // See https://github.com/hollyschinsky/PushNotificationSample/blob/master/www/js/controllers.js
                    if (notification.foreground == "1") {
                        // The app is open--don't show the notification
                    }
                    else {
                        // The app is not open.

                        /* if (notification.alert) {
                         $window.navigator.notification.alert(notification.alert);
                         }

                         if (notification.badge) {
                         $cordovaPush.setBadgeNumber(notification.badge).then(function(result) {
                         // Success!
                         }, function(err) {
                         // An error occurred. Show a message to the user
                         });
                         }

                         if (notification.sound) {
                         var snd = new Media(event.sound);
                         snd.play();
                         }*/
                    }

                });
            }
        });


        return service;
    }]);