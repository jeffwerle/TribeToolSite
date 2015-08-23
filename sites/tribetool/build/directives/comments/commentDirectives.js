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
                    '<div ng-if="isReady" class="comment-input-well" style="clear:both;">' +
                        '<div ng-show="processing"><loading></loading> Posting Comment...</div>' +
                        '<form ng-show="!processing" ng-submit="submitComment()">' +
                            '<div style="float: left;"><comment-picture options="commentPictureOptions"></comment-picture></div>' +

                            '<div class="comment-input-content">' +
                                // Use $parent because ng-if creates its own scope
                                '<content-editor is-required="isLoggedIn" show-toolbar="!status && focused" id="{{votableIdInputAnchor}}" options="formattingHelperOptions" text="$parent.commentText" placeholder="placeholder"></content-editor>' +

                                '<div style="clear:both;">' +
                                    '<div ng-show="focused" class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Post</button></div>' +
                                    '<div ng-show="focused" ng-if="options && options.onCancel" class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancel()" style="margin-top: 10px;">Cancel</button></div>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div style="clear:both;"></div>' +
                    '</div>' +
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
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();
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
                '<div>' +
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
                                    '<comment-entry ng-if="!childComment.IsTrashed || (childComment.Comments && childComment.Comments.length > 0)" index="$index" parent-comment="comment" comment="childComment" options="options"></comment-entry>' +
                                '</div>' +
                                '<div ng-if="childComment.isNotReady">' +
                                    '<loading></loading> Loading...' +
                                '</div>' +

                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
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
            link: function (scope, element, attrs) {
                commentDirectiveService.initializeCommentRepliesScope(scope);
            }
            /*
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            compile: function(cElement, cAttrs, transclude) {
                return RecursionHelper.compile(cElement,
                    function (scope, element, attrs) {


                });
            }
            */
        };
    }])
    .directive('commentEntry', ['accountService', 'RecursionHelper', 'mediaService', 'commentDirectiveService', '$filter', 'modalService', function (accountService, RecursionHelper, mediaService, commentDirectiveService, $filter, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="comment-entry">' +
                    //'<div class="comment-container" emotion-color="comment.Statistics.EmotionStatistics.EmotionType" ng-class="{\'status-comment-well\': !useCommentWell, \'comment-well\': useCommentWell, \'post-answer-accepted\': isAcceptedAnswer}">' +
                    '<div class="comment-container" ng-class="{\'status-comment-well\': !useCommentWell, \'comment-well\': useCommentWell, \'post-answer-accepted\': isAcceptedAnswer}">' +
                        '<a id="comment{{comment.Id}}"></a>' +

                        '<div ng-if="!comment.IsTrashed">' +
                            '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                            '<pin-link ng-hide="hidePin" comment="comment" pinned-item="comment.PinnedItem" ng-class="{\'has-more-options\': moreOptions}"></pin-link>' +

                            '<div ng-if="(canAcceptAnswers || isAcceptedAnswer) && !disableInteraction && hasWriteAccess">' +
                                '<div style="float: left;">' +
                                    '<div ng-click="setPostAnswer()" ng-style="{\'cursor\': canAcceptAnswers ? \'pointer\' : \'inherit\'}"><i class="fa fa-check fa-2x post-answer-icon" ng-class="{\'post-answer-accepted-icon\': isAcceptedAnswer, \'post-answer-unaccepted-icon\': !isAcceptedAnswer}"></i></div>' +
                                '</div>' +
                            '</div>' +

                            '<div class="comment-content-container">' +
                                '<div class="comment-header">' +
                                    '<div class="comment-picture-container">' +
                                        '<comment-picture votable="comment"></comment-picture>' +
                                    '</div>' +

                                    '<div class="post-submitted-by-text comment-header-content">' +
                                        '<div>' +
                                            '<span><profile-name votable="comment"></profile-name> </span>' +
                                            '{{infoText}}' +
                                        '</div>' +
                                    '</div>' +

                                '</div>' +

                                '<div class="comment-body" ng-show="!showEdit">' +
                                    '<div class="comment-content" btf-markdown="comment.FormattedText" markdown-options="markdownOptions"></div>' +
                                    '<div ng-show="!showDelete" class="comment-control-area">' +
                                        '<div class="col-sm-12"><interaction-summary votable="comment"></interaction-summary></div>' +
                                        '<div ng-if="comment.Tags && comment.Tags.length > 0" class="pull-right comment-tag-container">' +
                                            '<comment-picture-tags tags="comment.Tags"></comment-picture-tags>' +
                                        '</div>' +


                                        '<div class="toolbar-container pull-left col-sm-6">' +
                                            '<div class="toolbar-item">' +
                                                '<emotion-vote-mechanism class="emotion-vote-mechanism" comment="comment" emotion="comment.RequesterEmotion" disable-interaction="disableInteraction"></emotion-vote-mechanism>' +
                                            '</div>' +
                                            '<div ng-show="!disableInteraction && hasWriteAccess" class="toolbar-item">' +
                                                '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-click="reply()"><i class="icon ion-chatbox"></i></button>' +
                                            '</div>' +
                                            '<div ng-show="!disableInteraction && hasWriteAccess" class="toolbar-item">' +
                                                '<share-link class="medium-toolbar-button" comment="comment" permalink="permalink"></share-link>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="clearfix"></div>' +

                                    '</div>' +

                                '</div>' +
                                '<form ng-if="showEdit && hasWriteAccess" ng-submit="submitEdit()">' +
                                    '<div ng-show="processingEdit"><loading></loading> Submitting Edit...</div>' +
                                    '<div ng-show="!processingEdit">' +
                                        '<content-editor options="contentEditorOptions" text="$parent.comment.FormattedText" placeholder="\'Write a comment...\'"></content-editor>' +
                                        '<div style="clear:both;">' +
                                            '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save</button></div>' +
                                            '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancelEdit()" style="margin-top: 10px;">Cancel</button></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</form>' +
                                '<div ng-show="processingDelete"><loading></loading> Deleting...</div>' +
                            '</div>' +


                        '</div>' +
                        '<div ng-if="comment.IsTrashed" style="margin-left:10px;">' +
                            '<div>{{infoText}}</div>' +
                        '</div>' +


                    '</div>' +

                    '<div>' +
                        '<comment-replies show-reply="showReply" comment="comment" options="options" comment-input-options="commentInputOptions"></comment-replies>' +
                    '</div>' +

                '</div>',
            scope: {
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
            // Use the compile function from the RecursionHelper,
            // And return the linking function(s) which it returns
            compile: function(cElement, cAttrs, transclude) {
                return RecursionHelper.compile(cElement,
                    // Linking function
                    function(scope, element, attrs) {
                        scope.mediaService = mediaService;

                        commentDirectiveService.initializeCommentEntryScope(scope);


                        scope.voteString = scope.comment.Statistics.VoteCount.toString() + (scope.comment.Statistics.VoteCount === 1 ? ' Vote' : ' Votes');

                        scope.updateInfoText = function() {
                            scope.infoText = scope.comment.IsTrashed ? 'Comment Deleted' : $filter('dateRobust')(scope.comment.CreationDate, 'medium') + (scope.comment.IsEdited ? ' *Edited' : '');                        };
                        scope.updateInfoText();

                        scope.showDelete = false;
                        scope.delete = function() {
                            if(!scope.hasWriteAccess)
                                return;

                            scope.showDelete = true;
                        };
                        scope.cancelDelete = function() {
                            scope.showDelete = false;
                        };

                        scope.report = function() {

                        };


                        var buttons = [];
                        buttons.push({
                            text: 'Go To Permalink',
                            onClick: function() {
                                scope.goToPermalink();
                            }
                        });

                        if((scope.isAccountComment && scope.hasWriteAccess) || scope.isModerator) {
                            buttons.push({
                                text: 'Edit Comment',
                                onClick: function() {
                                    scope.edit();
                                }
                            });
                        }

                        buttons.push({
                            text: 'Report',
                            onClick: function() {
                                scope.report();
                            }
                        });

                        scope.moreOptions = {
                            title: 'Comment Options',
                            buttons: buttons
                        };

                        if(!scope.isAnswerComment && (scope.isModerator || (scope.isAccountComment && scope.hasWriteAccess))) {
                            scope.moreOptions.deleteButton = {
                                onClick: function() {
                                    modalService.confirmDelete('Delete Forever?', 'Are you sure you want to delete this comment forever?', function(result) {
                                        if(result) {
                                            scope.submitDelete();
                                        }
                                        else {
                                            scope.cancelDelete();
                                        }
                                    });
                                },
                                text: 'Delete Comment'
                            };
                        }
/*
                        scope.collapsedInfo = scope.comment.Comments ? scope.comment.Comments.length === 1 ? '1 Direct Reply' : scope.comment.Comments.length.toString() + ' Direct Replies' : '';
                        if(scope.comment.Comments && scope.comment.Statistics.CommentCount > scope.comment.Comments.length) {
                            scope.collapsedInfo += ', ' + scope.comment.Statistics.CommentCount.toString() + ' Total Replies';
                        }
                        scope.isCollapsed = true;
                        scope.toggleCollapsed = function() {
                            if(scope.isCollapsed) {
                                scope.isCollapsed = false;
                                scope.collapseString = '[-]';
                            }
                            else {
                                scope.isCollapsed = true;
                                scope.collapseString = '[+]';
                            }
                        };
                        scope.toggleCollapsed();
                        */

                    });
            }
        };
    }])
    .directive('linkToComment', ['navigationService', 'communityService', function (navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-href="{{commentUrl}}" class="action-link-black">{{text}}</a>',
            scope: {
                comment: '=',
                text: '='
            },
            link: function (scope, element, attrs) {
                scope.commentUrl = navigationService.getCommentUrl(scope.comment, {
                    status: scope.comment.StatusId ? { Id: scope.comment.StatusId } : null,
                    post: scope.comment.PostId ? { Id: scope.comment.PostId } : null,
                    imageFileEntry: scope.comment.ImageFileEntryId ? { Id: scope.comment.ImageFileEntryId } : null,
                    community: communityService.community
                });
            }
        };
    }]);