angular.module('app.Directives')
    .directive('poll', ['pollDirectiveService', function (pollDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="col-xs-12">' +
                        '<div class="poll-well">' +
                            /* Display the poll question if the poll is not the first post content or if the post content's question
                            * is different than the Post's Title. */
                            '<div ng-if="index !== 0 || postContent.CurrentVersion.Question !== post.Title">' +
                                '<post-content-question-content question="postContent.CurrentVersion.Question"></post-content-question-content>' +
                            '</div>' +


                            // The user is logged in and has not voted
                            '<div ng-if="isLoggedIn && !postContent.CurrentVersion.Poll.SelectedPollOption">' +
                                '<div ng-show="processing"><loading></loading> Submitting Vote...</div>' +
                                '<div ng-show="!processing">' +
                                    '<form name="pollForm" ng-submit="submit()">' +
                                        '<div class="form-group">' +
                                            '<div class="col-xs-2"></div>' +
                                            '<div class="col-xs-8">' +
                                                '<div ng-repeat="pollOption in postContent.CurrentVersion.Poll.PollOptions">' +
                                                    '<label style="cursor: pointer;" class="radio control-label">' +
                                                        // Use $parent.$parent because both ng-if and ng-repeat create their own scope
                                                        '<input type="radio" name="pollSelection" ng-model="$parent.$parent.selectedPollOption" ng-value="pollOption"/>' +
                                                        '<span>{{pollOption.Text}}</span>' +
                                                    '</label>' +
                                                '</div>' +
                                                '<div><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Submit</button></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="clearfix"></div>' +
                                    '</form>' +
                                '</div>' +
                            '</div>' +
                            // The user is not logged in or has already voted
                            '<div ng-if="!isLoggedIn || postContent.CurrentVersion.Poll.SelectedPollOption">' +

                                '<div class="row" ng-repeat="pollOption in postContent.CurrentVersion.Poll.PollOptions">' +
                                    '<div class="col-xs-4"><span ng-class="{\'bold\': pollOption.Id === postContent.CurrentVersion.Poll.SelectedPollOption}">{{pollOption.Text}}</span></div>' +
                                    '<div class="col-xs-6">' +
                                        '<div id="{{pollOption.Id}}container" style="margin-top: 8px;" class="poll-option-progress-bar-container">' +
                                            '<div id="{{pollOption.Id}}bar" class="poll-option-progress-bar"></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="col-xs-1">' +
                                        '<div>{{pollOption.percentage}}%</div>' +
                                    '</div>' +
                                    '<div class="col-xs-1">' +
                                        '<div>{{pollOption.voteCount}}</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            '<div ng-if="!isLoggedIn">' +
                                '<button class="btn btn-primary pull-right" style="margin-top: 10px;" ng-click="showSignup()">Login To Vote</button>' +
                            '</div>' +

                            '<div class="clearfix"></div>' +
                        '</div>' +

                    '</div>' +

                '</div>',
            scope: {
                post: '=',
                postContent: '=',
                /*
                    onSelected() // Called when the poll has been voted on
                * */
                options: '=',
                /*The index of the post content*/
                index: '='
            },
            link: function (scope, element, attrs) {
                pollDirectiveService.initializePollScope(scope, element);


            }
        };
    }]);
