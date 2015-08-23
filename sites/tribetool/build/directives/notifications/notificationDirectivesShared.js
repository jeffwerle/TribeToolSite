angular.module('app.Directives')

    .directive('notification', ['commService', 'notificationService', function (commService, notificationService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="pull-right notification-time">{{notification.AgeString}}, {{notification.DateReceived | dateRobust:\'medium\'}}</div>' +

                    '<div>' +

                        '<div ng-if="notification.NotificationType===\'PostSubmitted\'">' +
                            '<notification-post-submitted notification="notification" options="options"></notification-post-submitted>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'StatusSubmitted\'">' +
                            '<notification-status-submitted notification="notification" options="options"></notification-status-submitted>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'Achievement\'">' +
                            '<notification-achievement notification="notification" options="options"></notification-achievement>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedPostReply\'">' +
                            '<notification-received-post-reply notification="notification" options="options"></notification-received-post-reply>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedStatusReply\'">' +
                            '<notification-received-status-reply notification="notification" options="options"></notification-received-status-reply>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReceivedStatus\'">' +
                            '<notification-received-status notification="notification" options="options"></notification-received-status>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReceivedCommentReply\'">' +
                            '<notification-received-comment-reply notification="notification" options="options"></notification-received-comment-reply>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedImageReply\'">' +
                            '<notification-received-image-reply notification="notification" options="options"></notification-received-image-reply>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedVote\'">' +
                            '<notification-received-vote notification="notification" options="options"></notification-received-vote>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedEmotionVote\'">' +
                            '<notification-received-emotion-vote notification="notification" options="options"></notification-received-emotion-vote>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'LevelUp\'">' +
                            '<notification-level-up notification="notification" options="options"></notification-level-up>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'FriendRequestAccepted\'">' +
                            '<notification-friend-request-accepted notification="notification" options="options"></notification-friend-request-accepted>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'MentionedInComment\'">' +
                            '<notification-mentioned-in-comment notification="notification" options="options"></notification-mentioned-in-comment>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'MentionedInPost\'">' +
                            '<notification-mentioned-in-post notification="notification" options="options"></notification-mentioned-in-post>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'MentionedInStatus\'">' +
                            '<notification-mentioned-in-status notification="notification" options="options"></notification-mentioned-in-status>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'TagPageCreated\'">' +
                            '<notification-tag-page-created notification="notification" options="options"></notification-tag-page-created>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'PollVoteReceived\'">' +
                            '<notification-poll-vote-received notification="notification" options="options"></notification-poll-vote-received>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'PostAnswerAccepted\'">' +
                            '<notification-post-answer-accepted notification="notification" options="options"></notification-post-answer-accepted>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'PostAnswerUnaccepted\'">' +
                            '<notification-post-answer-unaccepted notification="notification" options="options"></notification-post-answer-unaccepted>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ChosePostAnswer\'">' +
                            '<notification-chose-post-answer notification="notification" options="options"></notification-chose-post-answer>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'UnchosePostAnswer\'">' +
                            '<notification-unchose-post-answer notification="notification" options="options"></notification-unchose-post-answer>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReceivedNewScheduledLesson\'">' +
                            '<notification-received-new-scheduled-lesson notification="notification" options="options"></notification-received-new-scheduled-lesson>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedCancelledLesson\'">' +
                            '<notification-received-cancelled-lesson notification="notification" options="options"></notification-received-cancelled-lesson>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReceivedMessage\'">' +
                            '<notification-received-message notification="notification" options="options"></notification-received-message>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'MapCreated\'">' +
                            '<notification-map-created notification="notification" options="options"></notification-map-created>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReceivedQuotedComment\'">' +
                            '<notification-received-quoted-comment notification="notification" options="options"></notification-received-quoted-comment>' +
                        '</div>' +
                        '<div ng-if="notification.NotificationType===\'ReceivedQuotedStatus\'">' +
                            '<notification-received-quoted-status notification="notification" options="options"></notification-received-quoted-status>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReferralMade\'">' +
                            '<notification-referral-made notification="notification" options="options"></notification-referral-made>' +
                        '</div>' +

                        '<div ng-if="notification.NotificationType===\'ReceivedItemPinned\'">' +
                            '<notification-received-item-pinned notification="notification" options="options"></notification-received-item-pinned>' +
                        '</div>' +

                        '<div>' +
                            '{{notification.NotificationType}}' +
                        '</div>' +

                    '</div>' +

                    '<div ng-if="initiallyUnread" class="pull-right">' +
                        '<button ng-show="!notification.IsRead" class="btn btn-primary" ng-click="markRead($event);">Mark Read</button>' +
                        '<span ng-show="notification.IsRead" style="color: green;"><i class="fa fa-check" ></i> Read</span>' +
                    '</div>' +

                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.initiallyUnread = !scope.notification.IsRead;
                scope.markRead = function(e) {
                    scope.options.markNotificationRead(scope.notification);

                    if(e)
                        e.stopPropagation();
                };
            }
        };
    }])

    .directive('notificationChosePostAnswer', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div>You accepted an answer to your post! <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationUnchosePostAnswer', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>You unaccepted an answer on your post. <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReferralMade', ['navigationService', function (navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div>Your referral was used by <profile-name options="profileNameOptions" community="notification.Community" account="notification.SocialInteractionAccount"></profile-name>!</div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            controller: ['$scope', function($scope) {

                $scope.profileNameOptions = {
                    onClick: function() {
                        $scope.options.markNotificationRead($scope.notification);
                    }
                };
                $scope.notification.onClick = function() {
                    navigationService.goToPath($scope.profileNameOptions.url);
                };
            }],
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationPostAnswerAccepted', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div>Your answer was accepted by <profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name>!</div>' +
                    '<div>Check out your answer: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationPostAnswerUnaccepted', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>Your answer was unaccepted.</div>' +
                    '<div>You may want to ask the owner of the post what happened. (It may be a mistake!) Check out your answer: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationExperienceEarned', ['profileService', 'accountService', function (profileService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="notification.XP > 0">' +
                    'You earned <notification-link-to-profile notification="notification" text="text" options="options"></notification-link-to-profile>!' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.text = scope.notification.XP + ' XP';
            }
        };
    }])
    .directive('notificationPollVoteReceived', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>Your poll received a vote: "{{notification.PollOption.Text}}"</div>' +
                    '<div>Check it out at your post: <notification-link-to-post main-action="true" notification="notification" options="options"></notification-link-to-post></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationPostSubmitted', ['postService', function (postService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>You submitted a post: <notification-link-to-post main-action="true" notification="notification" options="options"></notification-link-to-post></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationMapCreated', ['mapService', 'accountService', 'navigationService', 'communityService', function (mapService, accountService, navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;" ng-show="map && map.MainImage">' +
                    '<map-picture map="notification.Map"></map-picture>' +
                    '</div>' +
                    '<div>You created the <a ng-click="mapLinkClicked()" class="action-link-black pointer">"{{map.Name}}"</a> map!</div>' +
                    '<div style="margin-top:20px;"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.map = scope.notification.Map;
                scope.mapUrl = navigationService.getMapUrl(scope.map, scope.notification.Community || communityService.community);

                scope.mapLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.mapUrl);
                };
                scope.notification.onClick = function() {
                    navigationService.goToPath(scope.mapUrl);
                };
            }
        };
    }])
    .directive('notificationTagPageCreated', ['tagPageService', 'accountService', 'navigationService', 'communityService', function (tagPageService, accountService, navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;" ng-show="tagPage && tagPage.MainImage">' +
                    '<tag-picture tag-page="notification.TagPage"></tag-picture>' +
                    '</div>' +
                    '<div>You created the <a ng-click="tagPageLinkClicked()" class="action-link-black pointer">"{{tagPage.Tag}}"</a> page!</div>' +
                    '<div style="margin-top:20px;"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.tagPage = scope.notification.TagPage;
                scope.tagPageUrl = navigationService.getTagPageUrl(scope.tagPage, scope.notification.Community || communityService.community);

                scope.tagPageLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.tagPageUrl);
                };
                scope.notification.onClick = function() {
                    navigationService.goToPath(scope.tagPageUrl);
                };
            }
        };
    }])
    .directive('notificationAchievement', ['achievementService', 'accountService', 'navigationService', function (achievementService, accountService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>You earned an achievement!</div>' +
                    '<div style="margin-top:20px;"><a ng-click="achievementLinkClicked()" class="pointer action-link-black">"{{notification.Achievement.Name}}"</a></div>' +
                    '<div><span>{{notification.Achievement.Description}}</span></div>' +
                    '<div style="margin-top:20px;"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.achievementUrl = achievementService.getAchievementUrl(accountService.account, scope.notification.Achievement, scope.notification.Community);
                scope.achievementLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.achievementUrl);
                };
                scope.notification.onClick = function() {
                    navigationService.goToPath(scope.achievementUrl);
                };
            }
        };
    }])
    .directive('notificationFriendRequestAccepted', ['achievementService', 'accountService', 'navigationService', function (achievementService, accountService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><i class="fa fa-check"></i> You and <profile-name options="profileNameOptions" community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> are now friends!</div>' +
                    '<div ng-if="notification.XP > 0" style="margin-top:20px;"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.profileNameOptions = {
                    onClick: function() {
                        scope.options.markNotificationRead(scope.notification);
                    }
                };
                scope.notification.onClick = function() {
                    navigationService.goToPath(scope.profileNameOptions.url);
                };
            }
        };
    }])
    .directive('notificationStatusSubmitted', ['statusService', 'navigationService', function (statusService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>You submitted a status: <notification-link-to-status notification="notification" main-action="true" options="options"></notification-link-to-status></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedPostReply', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> replied to your post: <notification-link-to-post notification="notification" options="options"></notification-link-to-post></div>' +
                    '<div>Check out their comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedStatus', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> posted a status on your profile. <notification-link-to-status main-action="true" notification="notification" options="options"></notification-link-to-status></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedStatusReply', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> replied to your status: <notification-link-to-status notification="notification" options="options"></notification-link-to-status></div>' +
                    '<div>Check out their comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedQuotedStatus', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> quoted your status: <notification-link-to-status notification="notification" options="options"></notification-link-to-status></div>' +
                    '<div>Check out their comment: <notification-link-to-commentmain-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedImageReply', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '<div><img class="comment-profile-picture" ng-src="{{notification.ImageFileEntry.Small.Url | trusted}}" /></div>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> posted a comment on your picture: <notification-link-to-image image-file-entry="notification.ImageFileEntry" notification="notification" options="options"></notification-link-to-image></div>' +
                    '<div>Check out their reply: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedQuotedComment', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> quoted your comment: <notification-link-to-comment comment="notification.ParentComment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<div>Check out their comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedCommentReply', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> replied to your comment: <notification-link-to-comment comment="notification.ParentComment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<div>Check out their reply: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationMentionedInComment', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> mentioned you in a comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationMentionedInPost', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community"  account="notification.SocialInteractionAccount"></profile-name> mentioned you in a post: <notification-link-to-post main-action="true" notification="notification" options="options"></notification-link-to-post></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationMentionedInStatus', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> mentioned you in a status: <notification-link-to-status main-action="true" notification="notification" options="options"></notification-link-to-status></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedVote', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community"  account="notification.SocialInteractionAccount"></profile-name> voted for your ' +
                    '<span ng-if="notification.Comment">Comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></span>' +
                    '<span ng-if="notification.Post">Post: <notification-link-to-post main-action="true" notification="notification" options="options"></notification-link-to-post></span>' +
                    '<span ng-if="notification.Status">Status: <notification-link-to-status main-action="true" notification="notification" options="options"></notification-link-to-status></span>' +
                    '<span ng-if="notification.ImageFileEntry">Picture: <notification-link-to-image main-action="true" image-file-entry="notification.ImageFileEntry" notification="notification" options="options"></notification-link-to-image></span>' +
                    '<span ng-if="notification.Tag">Tag: <notification-link-to-tag main-action="true" notification="notification" options="options"></notification-link-to-tag></span>' +
                    '</div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedEmotionVote', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="centered"><emotion-face emotion-type="notification.EmotionVote.EmotionType"></emotion-face></div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community"  account="notification.SocialInteractionAccount"></profile-name> feels your ' +
                    '<span ng-if="notification.Comment"> Comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></span>' +
                    '<span ng-if="notification.Post"> Post: <notification-link-to-post main-action="true" notification="notification" options="options"></notification-link-to-post></span>' +
                    '<span ng-if="notification.Status"> Status: <notification-link-to-status main-action="true" notification="notification" options="options"></notification-link-to-status></span>' +
                    '<span ng-if="notification.ImageFileEntry"> Picture: <notification-link-to-image main-action="true" image-file-entry="notification.ImageFileEntry" notification="notification" options="options"></notification-link-to-image></span>' +

                    '</div>' +
                    '<div ng-show="notification.XP > 0"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('notificationLevelUp', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community"></comment-picture>' +
                    '</div>' +
                    '<div style="font-weight: bold;">{{notification.Message}}</div>' +
                    '<div>Check out your <notification-link-to-profile main-action="true" notification="notification" options="options" text="profileLinkText"></notification-link-to-profile>!' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.profileLinkText = 'progress';
            }
        };
    }])

    .directive('notificationLinkToPost', ['postService', 'navigationService', function (postService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-click="postLinkClicked()" class="action-link-black pointer">"{{notification.Post.Title}}"</a>',
            scope: {
                notification: '=',
                options: '=',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                scope.postUrl = navigationService.getPostUrl(scope.notification.Post, scope.notification.Community);

                scope.postLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.postUrl);
                };
                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.postUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationLinkToStatus', ['navigationService', function (navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-click="statusLinkClicked()" class="action-link-black pointer">"{{notification.Status.Description}}"</a>',
            scope: {
                notification: '=',
                options: '=',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                scope.statusUrl = navigationService.getStatusUrl(scope.notification.Status, scope.notification.Community);
                scope.statusLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.statusUrl);
                };
                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.statusUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationLinkToMessage', ['messageService', 'navigationService', function (messageService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-click="messageLinkClicked()" class="action-link-black pointer">"{{notification.ConversationMessage.Description}}"</a>',
            scope: {
                notification: '=',
                options: '=',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                scope.messageUrl = messageService.getMessageUrl(scope.notification.Conversation, scope.notification.ConversationMessage);
                scope.messageLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.messageUrl);
                };

                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.messageUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationLinkToImage', ['imageService', 'communityService', 'navigationService', function (imageService, communityService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-click="imageLinkClicked()" class="action-link-black pointer"><img ng-src="{{imageFileEntry.Small.Url | trusted}}"/></a>',
            scope: {
                imageFileEntry: '=',
                notification: '=',
                options: '=',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                if(!scope.notification.Community) {
                    scope.notification.Community = communityService.community;
                }

                scope.imageUrl = navigationService.getImageUrl(scope.imageFileEntry, {
                    account: scope.imageFileEntry.Account,
                    tagPage: scope.imageFileEntry.TagPage,
                    stepPage: scope.imageFileEntry.StepPage,
                    specialization: scope.imageFileEntry.Specialization,
                    community: scope.notification.Community
                });
                scope.imageLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.imageUrl);
                };

                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.imageUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationLinkToTag', ['communityService', 'navigationService', function (communityService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-click="tagLinkClicked()" class="action-link-black pointer"><tag-picture tag="notification.Tag"></tag-picture></a>',
            scope: {
                notification: '=',
                options: '=',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                if(!scope.notification.Community) {
                    scope.notification.Community = communityService.community;
                }

                scope.tagUrl = navigationService.getTagUrl(scope.notification.Tag, {
                    post: scope.notification.Tag.Post,
                    community: scope.notification.Community
                });
                scope.tagLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.tagUrl);
                };

                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.tagUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationLinkToComment', ['navigationService', 'communityService', function (navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-click="commentLinkClicked()" class="action-link-black pointer">"{{comment.Description}}"</a>',
            scope: {
                comment: '=',
                notification: '=',
                options: '=',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                scope.commentUrl = navigationService.getCommentUrl(scope.comment, {
                    status: scope.notification.Status,
                    post: scope.notification.Post,
                    imageFileEntry: scope.notification.ImageFileEntry,

                    /* For images */
                    tagPage: scope.notification.ImageFileEntry ? scope.notification.ImageFileEntry.TagPage : null,
                    stepPage: scope.notification.ImageFileEntry ? scope.notification.ImageFileEntry.StepPage : null,
                    specialization: scope.notification.ImageFileEntry ? scope.notification.ImageFileEntry.Specialization : null,
                    account: scope.notification.ImageFileEntry ? scope.notification.ImageFileEntry.Account : null,

                    community: scope.notification.Community || communityService.community
                });
                scope.commentLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.commentUrl);
                };

                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.commentUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationLinkToProfile', ['profileService', 'accountService', 'communityService', 'navigationService', function (profileService, accountService, communityService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a class="action-link-black pointer" ng-click="profileLinkClicked()">{{text}}</a>',
            scope: {
                options: '=',
                text: '=',
                account: '=?',
                notification: '=?',
                mainAction: '@'
            },
            link: function (scope, element, attrs) {
                if(!scope.account)
                    scope.account = accountService.account;

                scope.profileUrl = profileService.getProfileUrl(scope.account, scope.notification.Community);
                scope.profileLinkClicked = function() {
                    scope.options.markNotificationRead(scope.notification);
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                    navigationService.goToPath(scope.profileUrl);
                };

                if(scope.mainAction) {
                    scope.notification.onClick = function() {
                        navigationService.goToPath(scope.profileUrl);
                    };
                }
            }
        };
    }])
    .directive('notificationReceivedMessage', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> sent you a message!</div>' +
                    '<div>Check out their message: <notification-link-to-message main-action="true" notification="notification" options="options"></notification-link-to-message></div>' +
                    '<notification-experience-earned notification="notification" options="options"></notification-experience-earned>' +
                    '<div style="clear: both;"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('notificationReceivedItemPinned', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><profile-name community="notification.Community"  account="notification.SocialInteractionAccount"></profile-name> pinned your ' +
                    '<span ng-if="notification.Comment"> Comment: <notification-link-to-comment main-action="true" comment="notification.Comment" notification="notification" options="options"></notification-link-to-comment></span>' +
                    '<span ng-if="notification.Post"> Post: <notification-link-to-post main-action="true" notification="notification" options="options"></notification-link-to-post></span>' +
                    '<span ng-if="notification.Status"> Status: <notification-link-to-status main-action="true" notification="notification" options="options"></notification-link-to-status></span>' +
                    '<span ng-if="notification.ImageFileEntry"> Picture: <notification-link-to-image main-action="true" image-file-entry="notification.ImageFileEntry" notification="notification" options="options"></notification-link-to-image></span>' +

                    '</div>' +
                    '<div ng-show="notification.XP > 0"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }])

    .directive('notificationReceivedNewScheduledLesson', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div><i class="fa fa-graduation-cap"></i> <profile-name options="profileNameOptions" community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> just scheduled a lesson with you at {{notification.Appointment.Date | dateRobust:\'medium\'}}!</div>' +
                    '<div ng-if="notification.XP > 0" style="margin-top:20px;"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                    '<div class="clearfix"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {

                scope.profileNameOptions = {
                    onClick: function() {
                        scope.options.markNotificationRead(scope.notification);
                    }
                };
            }
        };
    }])
    .directive('notificationReceivedCancelledLesson', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                    '<comment-picture community="notification.Community" account="notification.SocialInteractionAccount"></comment-picture>' +
                    '</div>' +
                    '<div style="color:red;"><profile-name options="profileNameOptions" community="notification.Community" account="notification.SocialInteractionAccount"></profile-name> just cancelled their lesson with you, previously scheduled at {{notification.Appointment.Date | dateRobust:\'medium\'}}.</div>' +
                    '<div ng-if="notification.XP > 0" style="margin-top:20px;"><notification-experience-earned notification="notification" options="options"></notification-experience-earned></div>' +
                    '<div class="clearfix"></div>' +
                    '</div>',
            scope: {
                notification: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.profileNameOptions = {
                    onClick: function() {
                        scope.options.markNotificationRead(scope.notification);
                    }
                };
            }
        };
    }]);