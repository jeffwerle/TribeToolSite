angular.module('app.Directives')
    .directive('achievement', ['achievementService', function (achievementService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<a id="achievement{{achievement.Id}}"></a>' +
                    '<div class="pull-right achievement-time">{{achievement.DateEarned | dateRobust:\'medium\'}}</div>' +
                    '<div style="font-weight: bold;">{{achievement.Name}}</div>' +
                    '<div>{{achievement.Description}}</div>' +

                    '<achievement-data achievement="achievement"></achievement-data>' +
                '</div>',
            scope: {
                achievement: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('achievementData', ['commentService', 'statusService', 'postService', 'navigationService', 'communityService', 'mapService', 'profileService', function (commentService, statusService, postService, navigationService, communityService, mapService, profileService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="achievement.AchievementDataType === \'CommentId\' && comment">' +
                        'Comment: <a ng-href="{{commentUrl}}" class="action-link-black">"{{comment.Description}}"</a>' +
                    '</div>' +
                    '<div ng-if="achievement.AchievementDataType === \'StatusId\' && status">' +
                        'Status: <a ng-href="{{statusUrl}}" class="action-link-black">"{{status.Description}}"</a>' +
                    '</div>' +
                    '<div ng-if="achievement.AchievementDataType === \'PostId\' && post">' +
                        'Post: <a ng-href="{{postUrl}}" class="action-link-black">"{{post.Description}}"</a>' +
                    '</div>' +
                    '<div ng-if="achievement.AchievementDataType === \'MapId\' && map">' +
                        'Map: <a ng-href="{{mapUrl}}" class="action-link-black">"{{map.Name}}"</a>' +
                    '</div>' +
                '</div>',
            scope: {
                achievement: '='
            },
            link: function (scope, element, attrs) {
                if(scope.achievement.AchievementDataType !== 'Other') {
                    if(scope.achievement.AchievementDataType === 'CommentId') {
                        commentService.getComment(scope.achievement.AchievementData,
                            function(data) {
                                // Success
                                if(data.Comment) {
                                    scope.comment = data.Comment;
                                    scope.commentUrl = navigationService.getCommentUrl(data.Comment, {
                                        status: data.Status,
                                        post: data.Post,
                                        imageFileEntry: data.ImageFileEntry,
                                        community: communityService.community,
                                        account: profileService.currentProfile
                                    });
                                }
                            }, function(data) {
                                // Failure
                            });
                    }
                    else if(scope.achievement.AchievementDataType === 'StatusId') {
                        statusService.getStatus(scope.achievement.AchievementData,
                            function(data) {
                                // Success
                                if(data.Status) {
                                    scope.status = data.Status;
                                    scope.statusUrl = navigationService.getStatusUrl(data.Status, communityService.community);
                                }
                            }, function(data) {
                                // Failure
                            });
                    }
                    else if(scope.achievement.AchievementDataType === 'PostId') {
                        postService.getPostById(scope.achievement.AchievementData, /*getSummary*/true,
                            function(data) {
                                // Success
                                if(data.Posts && data.Posts.length > 0) {
                                    scope.post = data.Posts[0];
                                    scope.postUrl = navigationService.getPostUrl(scope.post, communityService.community);
                                }
                            }, function(data) {
                                // Failure
                            });
                    }
                    else if(scope.achievement.AchievementDataType === 'MapId') {
                        mapService.getMapById(scope.achievement.AchievementData,
                            function(data) {
                                // Success
                                scope.map = data.Map;
                                scope.mapUrl = navigationService.getMapUrl(scope.map, communityService.community);
                            }, function(data) {
                                // Failure
                            });
                    }
                }
            }
        };
    }]);