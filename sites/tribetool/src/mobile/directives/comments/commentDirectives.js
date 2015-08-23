angular.module('app.Directives')
    .directive('commentInput', ['$timeout', 'accountService', 'communityService', 'commentService', 'commService', 'navigationService', 'uiService', 'mediaService', 'commentDirectiveService', function ($timeout, accountService, communityService, commentService, commService, navigationService, uiService, mediaService, commentDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess" class="comment-input-container">' +
                    '<a id="commentInputAnchor"></a>' +
                    '<a id="{{votableIdAnchor}}"></a>' +


                    // We use ng-if="isReady" to make the loading of the input box feel snappier (we'll load on the
                    // next digest).
                        '<form ng-show="!processing" ng-submit="submitComment()" novalidate="novalidate">' +

                            '<div ng-if="isReady" style="clear:both;">' +
                                    // Use $parent because ng-if creates its own scope
                                    '<content-editor is-required="isLoggedIn" id="{{votableIdInputAnchor}}" options="formattingHelperOptions" text="$parent.commentText" placeholder="placeholder"></content-editor>' +
                            '</div>' +
                            '<div>' +
                                '<div ng-show="focused"><button class="button button-block button-positive col-80 col-offset-10" type="submit">Submit Comment</button></div>' +
                                '<div ng-show="focused" ng-if="options && options.onCancel"><button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button></div>' +
                            '</div>' +
                        '</form>' +
                '</div>',
            scope: {
                parentComment: '=?',
                /*
                 {
                 onCancel: function(),
                 onSubmitionSuccess: function(),
                 commentText: string (If provided, the initial text will be set to this value),
                 focus(value) // Focuses the comment input box. This method will be set in options by this directive so that it can be called outside of this directive,
                 scrollTo() // Scrolls to the input box. This method will be set in options by this directive so that it can be called outside of this directive,

                 onInitialized() // If provided, this will be called when this input box is initialized.

                 post: '=?',
                 postContent: '=?',
                 status: '=?',
                 imageFileEntry: '=?',
                 }
                 */
                options: '='
            },
            controller: ['$scope', function($scope) {
            }],
            link: function (scope, element, attrs) {

                scope.mediaService = mediaService;
                commentDirectiveService.initializeCommentInputScope(scope);
            }
        };
    }])

    .directive('commentReplies', ['commentDirectiveService', function (commentDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="comment-replies">' +
                    '<div ng-if="!isCollapsed && commentable" ng-class="{\'comment-replies-container\': commentable.Comments && commentable.Comments.length > 0}">' +
                        '<div ng-if="showReply">' +
                            '<div class="comment-layer" >' +
                                '<comment-input options="commentInputOptions" parent-comment="comment"></comment-input>' +
                            '</div>' +
                        '</div>' +

                        '<div ng-if="(!options.post || options.post.CommentSystemType !== \'Thread\') && commentable.Comments && commentable.Comments.length > 0" class="comment-layer">' +

                            '<div ng-repeat="childComment in commentable.Comments">' +
                                '<div ng-if="!childComment.isNotReady">' +
                                    // Only show the comment if it's not trashed OR (if it is trashed and) it has child comments
                                    '<comment-entry ng-if="!childComment.IsTrashed || (childComment.Comments && childComment.Comments.length > 0)" level="{{::nextLevel}}" index="$index" parent-comment="comment" comment="childComment" options="options"></comment-entry>' +
                                '</div>' +
                                '<div ng-if="childComment.isNotReady">' +
                                    '<loading></loading> Loading...' +
                                '</div>' +

                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                level: '@',

                comment: '=',
                status: '=',

                /*
                 {
                 status: '=?',
                 post: '=?',
                 postContent: '=?',

                 imageFileEntry: '=?',
                 tagPage: '=?', // The TagPage to which the image belongs on which we are commenting
                 stepPage: '=?', // The StepPage to which the image belongs on which we are commenting
                 specialization: '=?', // SpecializationEntry -- the specialization of the StepPage, if provided
                 }
                 */
                options: '=',

                showReply: '=',
                isCollapsed: '=',
                commentInputOptions: '='
            },
            controller: ['$scope', function($scope) {
               $scope.nextLevel = ($scope.level * 1) + 1;
            }],
            link: function (scope, element, attrs) {
                commentDirectiveService.initializeCommentRepliesScope(scope);
            }
        };
    }])
    .directive('commentEntry', ['accountService', 'RecursionHelper', 'commentDirectiveService', '$ionicPopup', '$filter', function (accountService, RecursionHelper, commentDirectiveService, $ionicPopup, $filter) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="comment-entry">' +
                    '<div  ng-class="{\'status-comment-well\': !useCommentWell, \'comment-well\': useCommentWell, \'post-answer-accepted\': isAcceptedAnswer}">' +
                        '<a id="comment{{comment.Id}}"></a>' +

                        '<div ng-show="!comment.IsTrashed">' +
                            '<div class="list card" emotion-color="comment.Statistics.EmotionStatistics.EmotionType">' +
                                '<div class="item item-avatar">' +
                                    '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                                    '<div class="row">' +
                                        '<div class="col-15 comment-reply-icon-container" ng-show="level > 0">' +
                                            '<i class="icon ion-reply comment-reply-icon"></i>' +
                                            '<div class="comment-reply-level">{{::level}}</div>' +
                                        '</div>' +
                                        '<div class="col-15 comment-entry-picture-container">' +
                                            '<comment-picture votable="comment"></comment-picture>' +
                                        '</div>' +
                                        '<div class="col">' +
                                            '<p class="post-submitted-by-text"><profile-name votable="comment"></profile-name> <interaction-summary votable="comment"></interaction-summary></p>' +
                                            //'<p class="post-submitted-by-text"></p>' +
                                            '<p class="post-submitted-by-text info-text">{{infoText}}</p>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +

                                '<div class="item item-body">' +




                                    '<div class="row" ng-show="!showEdit">' +
                                        '<div ng-if="(canAcceptAnswers || isAcceptedAnswer) && !disableInteraction && hasWriteAccess">' +
                                            '<div class="col-20">' +
                                                '<div ng-click="setPostAnswer()" ng-style="{\'cursor\': canAcceptAnswers ? \'pointer\' : \'inherit\'}"><i class="fa fa-check fa-2x post-answer-icon" ng-class="{\'post-answer-accepted-icon\': isAcceptedAnswer, \'post-answer-unaccepted-icon\': !isAcceptedAnswer}"></i></div>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="col" btf-markdown="comment.FormattedText" markdown-options="markdownOptions"></div>' +
                                    '</div>' +

                                    '<div ng-if="showEdit && hasWriteAccess">' +
                                        '<form ng-submit="submitEdit()" novalidate="novalidate">' +
                                            '<div ng-show="!processingEdit">' +
                                                '<content-editor options="contentEditorOptions" text="$parent.comment.FormattedText" placeholder="\'Write a comment...\'"></content-editor>' +
                                                '<div style="clear:both;">' +
                                                    '<button class="button button-block button-positive col-80 col-offset-10" type="submit">Save</button>' +
                                                    '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancelEdit()">Cancel</button>' +
                                                '</div>' +
                                            '</div>' +
                                        '</form>' +
                                    '</div>' +
                                '</div>' +



                                '<action-bar ng-if="!disableInteraction && hasWriteAccess" options="actionBarOptions" comment="comment" status="options.status" post="options.post" image-file-entry="options.imageFileEntry" requester-emotion="comment.RequesterEmotion"></action-bar>' +

                            '</div>' +
                        '</div>' +

                        '<div ng-if="comment.IsTrashed" class="list card">' +
                            '<div class="bold" style="margin-left: 10px;">{{infoText}}</div>' +
                        '</div>' +


                        '<div ng-if="showRepliesWithinWell">' +
                            '<comment-replies level="{{::level}}" show-reply="$parent.showReply" is-collapsed="$parent.isCollapsed" comment="$parent.comment" options="$parent.options" comment-input-options="$parent.commentInputOptions"></comment-replies>' +
                        '</div>' +

                    '</div>' +

                    '<div ng-if="!showRepliesWithinWell">' +
                        '<comment-replies level="{{::level}}" show-reply="$parent.showReply" is-collapsed="$parent.isCollapsed" comment="$parent.comment" options="$parent.options" comment-input-options="$parent.commentInputOptions"></comment-replies>' +
                    '</div>' +

                '</div>',
            scope: {
                level: '@',

                /* The comment to display */
                comment: '=',
                parentComment: '=?',

                index: '=?',
                /*
                 {
                 status: '=?',
                 post: '=?',
                 postContent: '=?',

                 imageFileEntry: '=?',
                 tagPage: '=?', // The TagPage to which the image belongs on which we are commenting
                 stepPage: '=?', // The StepPage to which the image belongs on which we are commenting
                 specialization: '=?', // SpecializationEntry -- the specialization of the StepPage, if provided
                 }
                 */
                options: '=',

                disableInteraction: '=?',
                useCommentWell: '=?',
                hidePin: '=?'
            },
            controller: ['$scope', function($scope) {
            }],
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            compile: function(cElement, cAttrs, transclude) {
                return RecursionHelper.compile(cElement,
                    // Linking function
                    function(scope, element, attrs) {

                        scope.actionBarOptions = {
                            onShare: function() {

                            },
                            onComment: function() {
                                scope.reply();
                            }
                        };

                        commentDirectiveService.initializeCommentEntryScope(scope);

                        scope.updateInfoText = function() {
                            scope.infoText = scope.comment.IsTrashed ? 'Comment Deleted' : scope.comment.AgeString + ', ' + $filter('dateRobust')(scope.comment.CreationDate, 'medium') + (scope.comment.IsEdited ? ' *Edited' : '');
                        };
                        scope.updateInfoText();

                        if(scope.isAccountComment && scope.hasWriteAccess) {
                            scope.moreOptions = {
                                title: 'Comment Options',
                                buttons: [{
                                    text: 'Edit Comment',
                                    onClick: function() {
                                        scope.edit();
                                    }
                                }]
                            };
                            scope.moreOptions.delete = {
                                text: 'Delete Comment',
                                onClick: function() {
                                    var confirmPopup = $ionicPopup.confirm({
                                        title: 'Delete Comment Forever?',
                                        template: 'Are you sure you want to delete this Comment forever?',
                                        okText: 'Delete',
                                        okType: 'button-assertive'
                                    });
                                    confirmPopup.then(function(res) {
                                        if(res) {
                                            // Delete comment
                                            scope.submitDelete();
                                        } else {
                                            // Cancelled
                                        }
                                    });
                                }
                            };
                        }
                    });
            }
        };
    }]);