angular.module('app.Services')
    .factory('postDirectiveService', ['$rootScope', 'formatterService', 'tagService', 'tagPageService', 'accountService', 'navigationService', 'communityService', 'commService', 'postService', '$timeout', '$location', 'route', '$ionicLoading', 'OPTIONS', function($rootScope, formatterService, tagService, tagPageService, accountService, navigationService, communityService, commService, postService, $timeout, $location, route, $ionicLoading, OPTIONS) {
        return {
            getPostSummaryMarkdownOptions: function() {
                return {
                    html: false,  // Don't process html in this post summary
                    images: false, // Don't process images in this post summary
                    videos: false,// Don't process videos in this post summary
                    infobox: false,
                    imageStyling: {
                        maxHeight: OPTIONS.isMobile ? 200 : 300, // max height 200px on images
                        clear: 'both'
                    }
                };
            },
            getPostContentMarkdownOptions: function(post, postContent) {
                return {
                    post: post,
                    postContent: postContent,
                    infobox: false
                };
            },
            /*
             insertMediaHtml: function(html),

             sets scope.linkMediaHtml and scope.mediaHtml
            * */
            getPostSummaryMediaHtml: function(scope, insertMediaHtml) {

                var foundMedia = false;
                if(scope.post.PostType==='Link' && scope.post.Link) {
                    // Is there a link and does it contain any youtube videos or other images?
                    scope.linkMediaHtml = formatterService.getMedia(scope.post.Link, scope.markdownOptions);
                    foundMedia = scope.linkMediaHtml !== null;
                }

                scope.mediaHtml = null;
                if(!foundMedia) {
                    // Since there are no videos or images in the link, does the content contain any?
                    scope.mediaHtml = formatterService.getMedia(scope.post.FormattedText, scope.markdownOptions);
                    foundMedia = scope.mediaHtml !== null;
                }

                if(!foundMedia) {
                    // Since there are no videos or images in the link or content, are there
                    // any tags from which we can extract images?
                    var tagsWithImages = tagService.getTagsWithImages(scope.post.Tags);
                    if(tagsWithImages && tagsWithImages.length > 0) {
                        // There are tags with images--let's get their images!
                        var tagWithImage = tagsWithImages[Math.floor(Math.random()*tagsWithImages.length)];
                        tagPageService.getTagPageImage(tagWithImage.Tag, function(data) {
                            // Success
                            if(data.Image) {
                                scope.mediaHtml = formatterService.getImageHtml(data.Image.Full.Url, scope.markdownOptions);
                                insertMediaHtml(scope.mediaHtml);
                            }
                        }, function(data) {
                            // Failure. Fail silently
                        });
                    }
                }
                else {
                    insertMediaHtml(scope.mediaHtml);
                }
            },
            initializePostContentScope: function(scope) {
                scope.currentVersion = scope.postContent.CurrentVersion;

                // Determine whether the post belongs to the current account
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.isAccountPost = accountService.account && accountService.account.Id === scope.post.AccountId;
                scope.isModerator = communityService.isModerator();
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.commentOptions = {
                    post: scope.post,
                    postContent: scope.postContent
                };

                scope.formOptions = {
                    formattedText: scope.postContent.CurrentVersion.FormattedText,
                    showEdit: false,
                    showDelete: false,
                    processingEdit: false,
                    processingDelete: false
                };

                scope.commentsAnchorId = 'postContentComments' + scope.postContent.Id;
                scope.markdownOptions = this.getPostContentMarkdownOptions(scope.post, scope.postContent);

                scope.contentEditorOptions = {
                    markdownOptions: scope.markdownOptions,
                    autofocus: false
                };
                scope.commentInputOptions = {
                    post: scope.post,
                    postContent: scope.postContent,
                    onSubmitSuccess: function(comment) {
                        scope.comments.push(comment);
                    },
                    onCancel: function() {

                    }
                };

                scope.goToCommunity = function() {
                    navigationService.goToPath('/community/' + communityService.community.Url);
                };

                scope.goToReply = function() {
                    scope.commentInputOptions.focus(true, function() {
                        scope.commentInputOptions.scrollTo();
                    });
                };

                scope.commentString = scope.postContent.Statistics && scope.postContent.Statistics.CommentCount > 1 ? scope.postContent.Statistics.CommentCount + ' Comments' : 'Comment';
                scope.reply = function() {
                    scope.goToReply();
                };

                scope.formattedTextBeforeEdit = '';
                scope.edit = function() {
                    scope.formOptions.showEdit = true;
                    scope.formattedTextBeforeEdit = scope.formOptions.formattedText;
                    scope.scrollToPostContent();
                    scope.contentEditorOptions.autofocus = true;
                };


                scope.setShowDelete = function(showDelete) {
                    scope.formOptions.showDelete = showDelete;
                };
                scope.scrollToPostContent = function() {
                    navigationService.scrollToPostContent(scope.postContent.Id);
                };

                scope.cancelEdit = function() {
                    scope.formOptions.showEdit = false;
                    scope.formOptions.formattedText = scope.formattedTextBeforeEdit;
                    scope.scrollToPostContent();
                };


                scope.goToComments = function() {
                    var scrollToComments = function() {
                        $timeout(function() {
                            if(scope.postContent.Comments && scope.postContent.Comments.length > 0) {
                                navigationService.scrollToHash(scope.commentsAnchorId);
                            }
                            else {
                                // If there are no comments (and we're logged in), go to the reply area.
                                if(accountService.isLoggedIn())
                                    scope.reply();
                            }
                        }, 10);
                    };
                    if(scope.isCollapsed) {
                        scope.toggleCollapsed();
                        $timeout(function() {
                            scrollToComments();
                        }, 0);
                    }
                    else {
                        scrollToComments();
                    }
                };


                if(scope.index === 0) {
                    $timeout(function() {
                        if(route.routeParams.edit && route.routeParams.edit === 'true' &&
                            scope.isAccountPost) {
                            scope.edit();
                        }
                        else if(route.routeParams.reply && route.routeParams.reply === 'true') {
                            scope.reply();
                        }
                        else if(route.routeParams.comment) {
                            var commentId = route.routeParams.comment;
                            if(commentId) {
                                navigationService.scrollToComment(commentId);
                            }
                        }
                    });
                }
            },
            initializeSubmitPostFormContentsScope: function(scope) {
                // PostContent (that is, an update to a LiveEvent) can only be Text, Link or Poll
                scope.postTypes = postService.getPostTypes(scope.isPost);

                scope.commentSystemTypes = postService.commentSystemTypes;


                scope.updateQuestionFromTitle = function() {
                    if((!scope.form.Question || scope.form.Title.indexOf(scope.form.Question) === 0) &&
                        (scope.form.PostType === 'Question' || scope.form.PostType === 'Poll')) {
                        scope.form.Question = scope.form.Title;
                    }
                };
                scope.titleChanged = function() {
                    scope.updateQuestionFromTitle();
                };

                scope.formattingHelperOptions = {
                    markdownOptions: {
                        infobox: false
                    },
                    onFocus: function() {
                        scope.setFieldName('Text');
                    }
                };


                scope.setFieldName = function(fieldName) {
                    scope.fieldName = fieldName;
                };
                // Don't have any field name to start with so that the user can see that the
                // help area changes as they interact with the input boxes

                scope.commentSystemTypeChanged = function() {
                };



                scope.postTypeChanged = function() {
                    // Live Events can only be Branch commenting systems
                    if(scope.form.PostType === 'Live Event') {
                        scope.commentSystemTypes = ['Branch'];
                        scope.form.CommentSystemType = 'Branch';
                    }
                    else {
                        if(scope.commentSystemTypes.length <= postService.commentSystemTypes.length) {
                            scope.commentSystemTypes = postService.commentSystemTypes;
                        }
                    }

                    scope.updateQuestionFromTitle();
                };
            },
            initializeCommunitySubmitNewPostScope: function(scope) {
                scope.postTypes = [];
                scope.community = communityService.community;
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.form = {
                    PollOptionsError: '',
                    IsAnonymous: false,
                    PostType: 'Text',
                    CommentSystemType: 'Branch',
                    PollOptions: [{ Text: '' }, { Text: ''} ],
                    tagText: route.routeParams.tags ? route.routeParams.tags : ''
                };


                scope.submit = function() {
                    if(!scope.form.Text) {
                        scope.form.Text = '';
                    }
                    if(scope.form.finalTagText) {
                        scope.form.Text += ' ' + scope.form.finalTagText;
                    }

                    scope.form.PollOptionsError = '';

                    // Remove whitespace
                    scope.form.PostType = scope.form.PostType.replace(/\s/g, '');

                    if(scope.form.PostType === 'Poll') {
                        // Make sure there are poll options
                        if(scope.form.PollOptions.length <= 0) {
                            scope.form.PollOptionsError = 'A poll must have at least one poll option.';
                            return;
                        }
                    }

                    if(scope.form.PostType === 'Link') {
                        var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
                        if(!urlRegex.test(scope.form.Link)) {
                            commService.showErrorAlert('Please provide a valid url.');
                            return;
                        }
                    }

                    if(scope.form.PostType === 'Question') {
                        scope.form.CommentSystemType = 'Question';
                    }

                    // Live Events cannot be anonymous
                    if(scope.form.PostType === 'LiveEvent') {
                        scope.form.IsAnonymous = false;
                    }

                    // Construct the post
                    var post = {
                        PostType: scope.form.PostType,
                        CommentSystemType: scope.form.CommentSystemType,
                        IsAnonymous: scope.form.IsAnonymous,
                        Title: scope.form.Title,
                        Contents: [{
                            PostContentType: scope.form.PostType === 'LiveEvent' ? 'Text' : scope.form.PostType,
                            CurrentVersion: {
                                FormattedText: scope.form.Text,
                                Question: scope.form.Question,
                                Link: scope.form.Link,
                                Poll: null
                            }
                        }]
                    };

                    if(scope.form.PostType === 'Poll') {
                        post.Contents[0].CurrentVersion.Poll = {
                            PollOptions: scope.form.PollOptions
                        };
                    }

                    // Submit the post!
                    scope.processing = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Post...'
                    });
                    postService.submitPost(post, function(data) {
                        // Success!
                        // Go to the post
                        var post = data.Posts[0];

                        scope.form.Title = '';
                        scope.form.Text = '';
                        scope.form.Question = '';
                        scope.form.PollOptions = [{ Text: '' }, { Text: ''} ];
                        navigationService.goToPost(post, communityService.community);

                        commService.showSuccessAlert('Post Submitted!');
                        scope.processing = false;
                        $ionicLoading.hide();
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                        $ionicLoading.hide();
                    });


                };

                scope.cancel = function() {
                    // Go to the previous page
                    navigationService.goToPath('community');
                };


                scope.formOptions = {
                    onCancel: scope.cancel
                };
            }
        };
    }]);