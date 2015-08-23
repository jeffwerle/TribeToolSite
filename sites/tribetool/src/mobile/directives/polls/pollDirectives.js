angular.module('app.Directives')
    .directive('poll', ['pollDirectiveService', function (pollDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>' +
                        '<div class="card list">' +
                            /* Display the poll question if the poll is not the first post content or if the post content's question
                             * is different than the Post's Title. */
                            '<div ng-if="index !== 0 || postContent.CurrentVersion.Question !== post.Title">' +
                                '<post-content-question-content question="postContent.CurrentVersion.Question"></post-content-question-content>' +
                            '</div>' +


                            // The user is logged in and has not voted
                            '<div ng-if="isLoggedIn && !postContent.CurrentVersion.Poll.SelectedPollOption">' +
                                '<div ng-show="!processing">' +
                                    '<h3 class="bold centered">Poll</h3>' +
                                    '<form name="pollForm" ng-submit="submit()" novalidate="novalidate">' +
                                        '<div class="form-group">' +

                                            '<div class="list">' +
                                                '<label class="item item-radio pointer" ng-repeat="pollOption in postContent.CurrentVersion.Poll.PollOptions">' +
                                                    '<input type="radio" name="pollSelection" ng-model="$parent.$parent.selectedPollOption" ng-value="pollOption"/>' +
                                                    '<div class="item-content">{{pollOption.Text}}</div>' +
                                                    '<i class="radio-icon ion-checkmark"></i>' +
                                                '</label>' +
                                            '</div>' +

                                            '<div><button class="button button-block button-positive col-80 col-offset-10" type="submit">Submit</button></div>' +
                                        '</div>' +
                                    '</form>' +
                                '</div>' +
                            '</div>' +
                            // The user is not logged in or has already voted
                            '<div ng-if="!isLoggedIn || postContent.CurrentVersion.Poll.SelectedPollOption">' +
                                '<h3 class="bold centered">Poll Results</h3>' +
                                '<div ng-repeat="pollOption in postContent.CurrentVersion.Poll.PollOptions">' +
                                    '<div class="row">' +

                                        '<div class="col col-30"><span ng-class="{\'bold\': pollOption.Id === postContent.CurrentVersion.Poll.SelectedPollOption}">{{pollOption.Text}}</span></div>' +
                                        '<div class="col col-40">' +
                                            '<div id="{{pollOption.Id}}container" style="margin-top: 8px;" class="poll-option-progress-bar-container">' +
                                                '<div id="{{pollOption.Id}}bar" class="poll-option-progress-bar"></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="col col-20">' +
                                            '<div>{{pollOption.percentage}}%</div>' +
                                        '</div>' +
                                        '<div class="col col-10">' +
                                            '<div>{{pollOption.voteCount}}</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            '<div ng-if="!isLoggedIn">' +
                                '<div><button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="showSignup()">Login To Vote</button></div>' +
                            '</div>' +

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
