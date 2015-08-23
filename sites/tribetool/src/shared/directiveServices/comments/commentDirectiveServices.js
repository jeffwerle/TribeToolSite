angular.module('app.Services')
    .factory('commentDirectiveService', ['uiService', 'navigationService', 'accountService', 'commentService', 'communityService', 'commService', '$timeout', 'marketingService', 'modalService', '$ionicLoading', 'postService', '$filter', function(uiService, navigationService, accountService, commentService, communityService, commService, $timeout, marketingService, modalService, $ionicLoading, postService, $filter) {
        return {
            getCommentInputMarkdownOptions: function(scope) {
                return {
                    post: scope.options.post,
                    postContent: scope.options.postContent,
                    status: scope.options.status,
                    imageFileEntry: scope.options.imageFileEntry,
                    comment: scope.parentComment
                };
            },
            initializeCommentInputScope: function(scope) {
                var guid = uiService.getGuid();
                scope.votableIdAnchor = 'commentInputAnchor' + guid;
                scope.hasWriteAccess = communityService.hasWriteAccess();

                var self = this;
                var setMarkdownOptions = function() {
                    scope.formattingHelperOptions.markdownOptions = self.getCommentInputMarkdownOptions(scope);
                };

                scope.focusCallbacks = [];
                scope.$watch('options', function(newValue) {
                    if(newValue) {
                        scope.options = newValue;
                        scope.options.scrollTo = function() {
                            navigationService.scrollToHash(scope.votableIdAnchor);
                        };
                        scope.options.focus = function(val, callback) {
                            scope.formattingHelperOptions.autofocus = val;
                            scope.options.autofocus = true;
                            scope.focused = val;
                            if(callback) {
                                scope.focusCallbacks.push(callback);
                            }
                        };
                        setMarkdownOptions();
                    }
                });

                scope.isLoggedIn = accountService.isLoggedIn();
                scope.isReplyToAnswer = scope.options.postContent && scope.options.postContent.PostContentType === 'Question' && scope.parentComment;

                scope.isAnswerComment = scope.options.postContent && scope.options.postContent.PostContentType === 'Question' && !scope.parentComment;


                scope.votableIdInputAnchor = 'commentInputTextInputAnchor' + guid;

                scope.placeholder = scope.isAnswerComment ? 'Submit an answer...' : 'Write a comment...';
                scope.formattingHelperOptions = {
                    onFocus: function() {
                        scope.focused = true;
                        if(scope.focusCallbacks) {
                            for(var i = 0; i < scope.focusCallbacks.length; i++) {
                                scope.focusCallbacks[i]();
                            }
                        }
                        scope.focusCallbacks = [];
                    },
                    onToolbarClicked: function() {
                        scope.focused = true;
                    },
                    onInitialized: function() {
                        if(scope.options.onInitialized) {
                            scope.options.onInitialized();
                        }
                    },
                    autofocus: false
                };
                setMarkdownOptions();

                scope.cancel = function() {
                    scope.focused = false;
                    scope.formattingHelperOptions.hide();
                    if(scope.options && scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                };

                scope.commentText = scope.options ? scope.options.commentText : null;
                scope.submitComment = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService);
                        return;
                    }

                    if(!angular.isDefined(scope.commentText) ||
                        scope.commentText === null) {
                        return;
                    }

                    // Status comments and non-thread comments (i.e. Branch or Question comments) can be branched
                    var isBranchedComment = scope.parentComment && (!scope.options.post || scope.options.post.CommentSystemType !== 'Thread');
                    var commentEntry = {
                        FormattedText: scope.commentText,
                        CommunityId: communityService.community.Id
                    };

                    // If we're using a parent comment, ensure that if we're commenting on a post that
                    // that post allows branching (i.e. parent comments)
                    if(isBranchedComment) {
                        commentEntry.ParentCommentId = scope.parentComment.Id;
                        commentEntry.PostId = scope.parentComment.PostId;
                        commentEntry.PostContentId = scope.parentComment.PostContentId;
                        commentEntry.StatusId = scope.parentComment.StatusId;
                        commentEntry.ImageFileEntryId = scope.parentComment.ImageFileEntryId;
                    }
                    else {
                        if(scope.options.postContent) {
                            commentEntry.PostId = scope.options.post.Id;
                            commentEntry.PostContentId = scope.options.postContent.Id;
                        }
                        else if(scope.options.status) {
                            commentEntry.StatusId = scope.options.status.Id;
                        }
                        else if(scope.options.imageFileEntry) {
                            commentEntry.ImageFileEntryId = scope.options.imageFileEntry.Id;
                        }
                    }

                    scope.formattingHelperOptions.hide();

                    // Submit the comment
                    scope.processing = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Comment...'
                    });
                    commentService.comment(commentEntry, function(data) {
                        // Success
                        // Refresh the comments
                        scope.processing = false;
                        $ionicLoading.hide();

                        var comments;
                        if(isBranchedComment) {
                            comments = scope.parentComment.Comments;
                        }
                        else if(scope.options.postContent) {
                            comments = scope.options.postContent.Comments;
                        }
                        else if(scope.options.status) {
                            comments = scope.options.status.Comments;
                        }
                        else if(scope.options.imageFileEntry) {
                            comments = scope.options.imageFileEntry.Comments;
                        }
                        else {
                            commService.showErrorAlert('Not Implemented in commentInput directive.');
                        }

                        if(!comments) {
                            comments = [];
                        }
                        if(!comments.SumCommentCount) {
                            comments.SumCommentCount = 0;
                        }
                        comments.SumCommentCount++;
                        comments.push(data.Comment);


                        // Clear the comment
                        scope.commentText = '';

                        if(scope.options && scope.options.onCancel) {
                            scope.options.onCancel();
                        }


                        if(scope.options && scope.options.onSubmitSuccess) {
                            scope.options.onSubmitSuccess(data.Comment);
                        }

                        commService.showSuccessAlert('Comment Posted!');

                        // scroll to the comment the next render cycle
                        $timeout(function() {
                            navigationService.scrollToHash('comment' + data.Comment.Id);
                        }, 0);

                        scope.focused = false;
                        scope.formattingHelperOptions.hide();

                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                        $ionicLoading.hide();
                    });
                };

                scope.commentPictureOptions = {};
                if(!scope.isLoggedIn) {
                    scope.commentPictureOptions.constructLinkUrl = function(account, accountEntry, votableContent) {
                        return '';
                    };
                }

                $timeout(function() {
                    scope.isReady = true;
                });
            },
            loadCommentsProgressively: function(commentable) {

                if(commentable.Comments && commentable.Comments.length > 0) {
                    // Load the comments one at a time (start by marking them all as not ready)
                    // We do it this way so that when a new comment is added to the Comments array, we
                    // show the comment if isNotReady is not defined.
                    for(var i = 0; i < commentable.Comments.length; i++) {
                        commentable.Comments[i].isNotReady = true;
                    }

                    var setCommentAsReady = function(index) {
                        $timeout(function() {
                            commentable.Comments[index].isNotReady = false;
                            if(index + 1 < commentable.Comments.length) {
                                setCommentAsReady(index + 1);
                            }
                        });
                    };
                    setCommentAsReady(0);
                }
            },
            initializeCommentRepliesScope: function(scope) {
                scope.commentable = scope.comment ? scope.comment : scope.status;
                this.loadCommentsProgressively(scope.commentable);
            },
            initializeCommentEntryScope: function(scope) {

                scope.isLoggedIn = accountService.isLoggedIn();

                scope.post = scope.options.post;
                scope.postContent = scope.options.postContent;
                scope.status = scope.options.status;
                scope.imageFileEntry = scope.options.imageFileEntry;

                if(!angular.isDefined(scope.useCommentWell))
                {
                    if(scope.imageFileEntry) {
                        scope.useCommentWell = false;
                    }
                    else if(!scope.status && !scope.post && !scope.postContent) {
                        scope.useCommentWell = true;
                    }
                    else {
                        scope.useCommentWell = scope.postContent && (scope.postContent.PostContentType !== 'Question' || !scope.parentComment);
                    }

                }

                scope.isAnswerComment = scope.postContent && scope.postContent.PostContentType === 'Question' && !scope.parentComment;
                scope.canAcceptAnswers = scope.isLoggedIn && scope.isAnswerComment && scope.post && scope.post.AccountId === accountService.account.Id;



                scope.permalink = navigationService.getCommentUrl(scope.comment, {
                    status: scope.options.status,
                    post: scope.options.post,
                    imageFileEntry: scope.options.imageFileEntry,
                    account: scope.options.imageFileEntry ? profileService.currentProfile && profileService.currentProfile.Id === scope.options.imageFileEntry.AccountId ? profileService.currentProfile : scope.comment.Account : null,
                    community: communityService.community,
                    tagPage: scope.options.tagPage,
                    stepPage: scope.options.stepPage,
                    specialization: scope.options.specialization
                });

                scope.goToPermalink = function() {
                    navigationService.goToPath(scope.permalink);
                    scope.permalinkClicked();
                };

                scope.permalinkClicked = function() {
                    modalService.closeAll();
                };

                scope.markdownOptions = {
                    post: scope.post,
                    postContent: scope.postContent,
                    comment: scope.comment,
                    status: scope.status,
                    imageFileEntry: scope.imageFileEntry,
                    infobox: false
                };
                scope.contentEditorOptions = {
                    markdownOptions: scope.markdownOptions,
                    autofocus: false
                };





                scope.isAccountComment = accountService.account && accountService.account.Id === scope.comment.AccountId;
                scope.isModerator = communityService.isModerator();
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.commentInputOptions = angular.extend({}, scope.options);
                scope.commentInputOptions.onCancel =  function() {
                    scope.showReply = false;
                };
                scope.commentInputOptions.onInitialized = function() {
                    $timeout(function() {
                        scope.commentInputOptions.focus(true, function() {
                            scope.commentInputOptions.scrollTo();
                        });
                    }, 10);
                };

                scope.showReply = false;
                scope.reply = function(doQuote) {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'CommentReplyOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    if(doQuote || (scope.post &&
                        scope.post.CommentSystemType === 'Thread')) {
                        scope.commentInputOptions.commentText = '[QUOTE=' + scope.comment.Id + '][/QUOTE]\n';
                    }

                    scope.showReply = true;

                };

                scope.replyWithQuote = function() {
                    scope.reply(true);
                };

                scope.cancelReply = function() {
                    scope.showReply = false;
                };

                scope.showEdit = false;
                scope.formattedTextBeforeEdit = '';
                scope.edit = function() {
                    scope.showEdit = true;
                    scope.formattedTextBeforeEdit = scope.comment.FormattedText;
                    scope.scrollToComment();
                    scope.contentEditorOptions.autofocus = true;
                };

                scope.scrollToComment = function() {
                    $timeout(function() {
                        navigationService.scrollToComment(scope.comment.Id);
                    }, 10);
                };

                scope.cancelEdit = function() {
                    scope.showEdit = false;
                    scope.comment.FormattedText = scope.formattedTextBeforeEdit;
                    scope.scrollToComment();
                };

                scope.submitEdit = function() {
                    // Did we make any change?
                    if(scope.comment.FormattedText === scope.formattedTextBeforeEdit) {
                        // No change, we're done
                        scope.cancelEdit();
                        return;
                    }

                    // Submit comment edit to service
                    scope.processingEdit = true;

                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Edit...'
                    });
                    commentService.editComment(scope.comment, function(data) {
                        // Success
                        scope.processingEdit = false;
                        $ionicLoading.hide();
                        scope.comment = data.Comment;
                        scope.showEdit = false;
                        scope.updateInfoText();
                        scope.scrollToComment();
                        commService.showSuccessAlert('Comment edited successfully!');
                    }, function(data) {
                        // Failure
                        scope.processingEdit = false;
                        $ionicLoading.hide();
                        commService.showErrorAlert(data);
                    });
                };


                scope.submitDelete = function() {
                    $ionicLoading.show({
                        template: '<loading></loading> Deleting Comment...'
                    });
                    scope.processingDelete = true;
                    commentService.deleteComment(scope.comment, function(data) {
                        // Success
                        scope.processingDelete = false;
                        $ionicLoading.hide();
                        scope.comment = data.Comment;
                        if(scope.cancelDelete)
                            scope.cancelDelete();
                        scope.updateInfoText();
                    }, function(data) {
                        // Failure
                        scope.processingDelete = false;
                        $ionicLoading.hide();
                        commService.showErrorAlert(data);
                    });
                };



                if(scope.postContent && scope.postContent.PostContentType === 'Question') {
                    scope.isAcceptedAnswer = scope.comment.Id === scope.postContent.AnswerCommentId;

                    scope.setPostAnswer = function() {
                        if(!scope.canAcceptAnswers) {
                            return;
                        }
                        // If we were already the answer then we're being unaccepted. Otherwise, we're
                        // being accepted.
                        var answerCommentId = scope.isAcceptedAnswer ? null : scope.comment.Id;

                        var alreadyHasAnswer = scope.postContent.AnswerCommentId;

                        $ionicLoading.show({
                            template: '<loading></loading> Accepting Answer...'
                        });
                        postService.setPostAnswer(answerCommentId,
                            scope.post.Id, scope.postContent.Id,
                            function(data) {
                                // Success
                                $ionicLoading.hide();
                                commService.showSuccessAlert(answerCommentId ? 'Answer accepted successfully!' : 'Answer unaccepted successfully.');

                                scope.postContent.AnswerCommentId = data.PostContent.AnswerCommentId;

                                // Update all of the other comments to remove the "check" from any
                                // previously accepted answers (if necessary--that is, if there was already
                                // an answer and if it wasn't this comment).
                                if(alreadyHasAnswer && !scope.isAcceptedAnswer) {
                                    scope.postContent.Comments = data.PostContent.Comments;
                                }

                                $timeout(function() {
                                    navigationService.scrollToComment(scope.comment.Id);
                                }, 10);

                                scope.isAcceptedAnswer = scope.comment.Id === scope.postContent.AnswerCommentId;
                            }, function(data) {
                                // Failure
                                $ionicLoading.hide();
                                commService.showErrorAlert(data);
                            });
                    };
                }
            }
        };
    }]);