angular.module('app.Services')
    .factory('notificationService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            getNotifications: function(pageNumber, countPerPage, onSuccess, onFailure) {
                commService.postWithParams('notification', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetNotificationsOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetNotifications'
                }, onSuccess, onFailure);
            },
            getNotificationsCount: function(onSuccess, onFailure) {
                commService.postWithParams('notification', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetNotificationsCount'
                }, onSuccess, onFailure);
            },
            markRead: function(notificationId, onSuccess, onFailure) {
                commService.postWithParams('notification', {
                    Credentials: accountService.getCredentials(communityService.community),
                    NotificationId: notificationId,
                    RequestType: 'MarkRead'
                }, onSuccess, onFailure);
            },
            markAllRead: function(onSuccess, onFailure) {
                commService.postWithParams('notification', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'MarkAllRead'
                }, onSuccess, onFailure);
            },
            isSocketNotificationApplicable: function(arg) {
                if(arg.communityId) {
                    if(!communityService.community)
                        return false;

                    // Is this notification applicable?
                    if(communityService.community.Id !== arg.communityId) {
                        return false;
                    }
                }
                return true;
            },
            handleSocketNotification: function(arg) {
                var data = arg.data;

                if(!this.isSocketNotificationApplicable(arg)) {
                    return false;
                }

                if(arg.communityId) {


                    if(communityService.accountCommunity && communityService.accountCommunity.CommunityId === arg.communityId) {

                        if(data.Level > communityService.accountCommunity.Level.Level) {
                            commService.showInfoAlert('Level Up!', {
                                onlyIfUnique: true
                            });
                        }

                        communityService.updateAccountCommunityStatistics({
                            XP: data.XP,
                            Level: data.Level,
                            NextLevelXP: data.NextLevelXP,
                            BaseLevelXP: data.BaseLevelXP
                        });
                    }
                }

                return true;
            }
        };
    }]);