angular.module('app.Directives')
    .directive('submitPostFormContents', ['postDirectiveService', function (postDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="isPost">' +
                        '<label>Title <span class="required-star">*</span></label>' +
                        '<input ng-focus="setFieldName(\'Title\')" class="form-control" placeholder="Title" ng-required="isPost" ng-model="form.Title" ng-change="titleChanged()">' +
                    '</div>' +
                    '<div style="margin-top:20px;">' +
                        '<label>Post Type</label>' +
                        '<select ng-focus="setFieldName(\'PostType\')" class="form-control" ng-model="form.PostType" ng-change="postTypeChanged()">' +
                        '<option ng-repeat="postType in postTypes">{{postType}}</option>' +
                        '</select>' +
                    '</div>' +
                    '<div ng-show="isPost && form.PostType !== \'Question\'" style="margin-top:20px;">' +
                        '<label>Comment System</label>' +
                        '<select ng-focus="setFieldName(\'CommentSystemType\')" class="form-control" ng-model="form.CommentSystemType" ng-change="commentSystemTypeChanged()">' +
                            '<option ng-repeat="commentSystemType in commentSystemTypes">{{commentSystemType}}</option>' +
                        '</select>' +
                    '</div>' +
                    '<div ng-show="form.PostType === \'Question\' || form.PostType === \'Poll\'" style="margin-top:20px;">' +
                        '<label>Question <span  class="required-star">*</span></label>' +
                        '<input class="form-control" ng-required="form.PostType === \'Question\' || form.PostType === \'Poll\'" placeholder="What\'s your question?" ng-model="form.Question" ng-focus="setFieldName(\'Question\')">' +
                    '</div>' +
                    '<div style="margin-top:20px;" ng-show="form.PostType === \'Poll\'">' +
                        '<poll-creator form="form"></poll-creator>' +
                    '</div>' +
                    '<div ng-show="form.PostType === \'Link\'" style="margin-top:20px;">' +
                        '<label>Link <span class="required-star">*</span></label>' +
                        '<input ng-focus="setFieldName(\'Link\')" class="form-control" placeholder="http://www.example.com" ng-required="form.PostType === \'Link\'" ng-model="form.Link">' +
                    '</div>' +
                    '<div style="margin-top:20px;">' +
                        // Text is necessary for a Text or Live Event Post
                        '<label ng-show="form.PostType === \'Text\' || form.PostType === \'Live Event\'">Text<span  class="required-star">*</span></label>' +
                        // But not for any others
                        '<label ng-show="form.PostType !== \'Text\' && form.PostType !== \'Live Event\'">Text (optional)</label>' +
                        '<content-editor show-toolbar="true" is-required="form.PostType === \'Text\' || form.PostType === \'Live Event\'" options="formattingHelperOptions" text="form.Text" placeholder="\'Tell us something fascinating...\'"></content-editor>' +
                    '</div>' +
                    '<div style="margin-top:20px;">' +
                        '<label>Tags (#optional)</label>' +
                        '<tag-content-editor is-required="false" text="form.tagText" tags="form.tags" final-tag-text="form.finalTagText" placeholder="\'Put your #tags here...\'"></tag-content-editor>' +
                    '</div>' +
                    '<div ng-show="isPost && form.PostType !== \'Live Event\'" style="margin-top:20px;">' +
                        '<label>Submit Anonymously</label> <input ng-model="form.IsAnonymous" ng-change="submitAnonymouslyChanged()" type="checkbox"> <unamused-face></unamused-face>' +
                        '<div>(If submitted anonymously, no one will know you submitted this post, but you also won\'t get any experience points).</div>' +
                    '</div>' +
                    '<div style="margin-top: 10px;">' +
                        '<div ng-show="form.PollOptionsError" class="pull-right" style="color: red;">{{form.PollOptionsError}}</div>' +
                        '<div style="clear:both;"></div>' +
                        '<button style="margin-left: 20px;" class="btn btn-primary pull-right" type="submit">Submit</button>' +
                        '<button class="btn btn-warning pull-right" type="button" ng-click="options.onCancel()">Cancel</button>' +
                    '</div>' +
                '</div>',
            scope: {
                form: '=',
                /* {
                    onCancel()
                 *  } */
                options: '=',
                fieldName: '=',
                /* Indicates whether this form is for a Post (true) or PostContent (false)*/
                isPost: '='
            },
            link: function (scope, element, attrs) {
                postDirectiveService.initializeSubmitPostFormContentsScope(scope);
            }
        };
    }])
    .directive('communitySubmitLiveEventPostContent', ['communityService', 'postService', 'navigationService', 'commService', 'accountService', '$routeParams', 'mediaService', function (communityService, postService, navigationService, commService, accountService, $routeParams, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<h2>Update Your Live Event <excited-face-animation></excited-face-animation></h2>' +
                    '<div class="col-sm-7">' +
                        '<div ng-show="processing">' +
                            '<loading></loading> Submitting Live Event Update...' +
                        '</div>' +
                        '<div ng-show="!processing">' +
                            '<form name="submitPostForm" ng-submit="submit()">' +
                                '<submit-post-form-contents form="form" options="formOptions" field-name="fieldName" is-post="false"></submit-post-form-contents>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-5" ng-class="{\'clear-both\': mediaService.isPhone}">' +
                        '<community-submit-new-post-help is-post="false" field-name="fieldName" post-type="form.PostType"></community-submit-new-post-help>' +
                    '</div>' +
                '</div>',
            scope: {
                post: '=',
                /*
                 {
                    // Called when the live event update is submitted (the new PostContent is passed as the argument)
                    onSubmit(postContent),
                    onCancel()
                 }
                 */
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.form = {
                    PostType: 'Text',
                    PollOptions: [{ Text: '' }, { Text: ''} ],
                    tagText: $routeParams.tags ? $routeParams.tags : ''
                };

                scope.cancel = function() {
                    scope.options.onCancel();
                };

                scope.formOptions = {
                    onCancel: scope.cancel
                };



                scope.submit = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showLoginDialog(navigationService);
                        return;
                    }

                    if(!scope.form.Text) {
                        scope.form.Text = '';
                    }
                    if(scope.form.finalTagText) {
                        scope.form.Text += ' ' + scope.form.finalTagText;
                    }

                    scope.form.PollOptionsError = '';

                    if(scope.form.PostType === 'Poll') {
                        // Make sure there are poll options
                        if(scope.form.PollOptions.length <= 0) {
                            scope.form.PollOptionsError = 'A poll must have at least one poll option.';
                            return;
                        }
                    }

                    // Construct the postContent
                    var postContent = {
                        PostContentType: scope.form.PostType,
                        CurrentVersion: {
                            FormattedText: scope.form.Text,
                            Question: scope.form.Question,
                            Link: scope.form.Link,
                            Poll: null
                        }
                    };

                    if(scope.form.PostType !== 'Question' && scope.form.PostType !== 'Poll') {
                        postContent.CurrentVersion.Question = '';
                    }

                    if(scope.form.PostType === 'Poll') {
                        postContent.CurrentVersion.Poll = {
                            PollOptions: scope.form.PollOptions
                        };
                    }

                    // Submit the post!
                    scope.processing = true;
                    postService.submitPostContent(scope.post, postContent, function(data) {
                        // Success!
                        // Go to the post
                        var postContent = data.PostContent;

                        scope.form.Title = '';
                        scope.form.Text = '';
                        scope.form.Question = '';
                        scope.form.PollOptions = [{ Text: '' }, { Text: ''} ];

                        scope.options.onSubmit(postContent);
                        commService.showSuccessAlert('Live Event Updated!');
                        scope.processing = false;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                    });


                };

            }
        };
    }])
    .directive('pollCreator', ['communityService', 'postService', 'navigationService', 'commService', function (communityService, postService, navigationService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="row">' +
                    '<div style="margin-bottom: 0px;" class="well">' +
                        '<h3 class="centered">Poll Options</h3>' +
                        '<div class="row" ng-repeat="pollOption in form.PollOptions">' +

                            '<div style="margin-top: 20px;">' +
                                '<div class="col-sm-3">' +
                                    '<label class="pull-right">Poll Option #{{$index + 1}}</label>' +
                                '</div>' +
                                '<div class="col-sm-7">' +
                                    '<input class="form-control" ng-required="form.PostType === \'Poll\'" ng-model="pollOption.Text">' +
                                '</div>' +
                                '<div class="col-sm-1">' +
                                    '<button class="btn btn-danger" ng-click="removePollOption(pollOption, $index)"><i class="fa fa-times"></i></button>' +
                                '</div>' +
                            '</div>' +

                        '</div>' +
                    '</div>' +

                    '<div class="clearfix"></div>' +
                    '<button class="btn btn-primary pull-right" type="button" ng-click="addPollOption()"><i class="fa fa-plus"></i> Add Poll Option</button>' +
                '</div>',
            scope: {
                form: '='
            },
            link: function (scope, element, attrs) {

                scope.addPollOption = function() {
                    scope.form.PollOptions.push({
                        Text: ''
                    });
                };
                scope.removePollOption = function(pollOption, $index) {
                    scope.form.PollOptions.splice($index, 1);
                };
            }
        };
    }])
    .directive('communitySubmitNewPost', ['postDirectiveService',  'mediaService', function (postDirectiveService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess">' +

                    '<h2>Submit a Post <excited-face-animation></excited-face-animation></h2>' +
                    '<div class="col-sm-7">' +
                        '<div ng-show="processing">' +
                            '<loading></loading> Submitting Post...' +
                        '</div>' +
                        '<div ng-show="!processing">' +
                            '<div style="font-weight: bold; color: red;">Please remember that the post should be in the context of "{{community.Options.Topic}}".</div>' +
                            '<form name="submitPostForm" ng-submit="submit()">' +
                                '<submit-post-form-contents form="form" options="formOptions" field-name="fieldName" is-post="true"></submit-post-form-contents>' +

                            '</form>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-5" ng-class="{\'clear-both\': mediaService.isPhone}">' +
                        '<community-submit-new-post-help is-post="true" field-name="fieldName" post-type="form.PostType"></community-submit-new-post-help>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                postDirectiveService.initializeCommunitySubmitNewPostScope(scope);

            }
        };
    }])
    .directive('communitySubmitNewPostHelp', ['postService', function (postService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="clear:both;">' +
                    '<div ng-show="fieldName === \'Title\'">' +
                        '<div>This is the title of your post! You\'ll want it to be short, catchy, and informative.</div>' +
                    '</div>' +
                    '<div ng-show="fieldName === \'PostType\'">' +
                        '<div>There are {{postTypes.length}} possible types of posts:</div>' +
                        '<ul>' +
                            '<li><span style="font-weight: bold;">Text</span>' +
                                '<ul><li>For when you have an idea, a commentary on life, or just something on your mind!</li></ul>' +
                            '</li>' +
                            '<li><span style="font-weight: bold;">Link</span>' +
                                '<ul><li>Use this if you want to share a specific website or resource with the community.</li></ul>' +
                            '</li>' +
                            '<li><span style="font-weight: bold;">Poll</span>' +
                                '<ul><li>A good ol\' fashioned straw poll. Get the community\'s opinion on a topic of your choice!</li></ul>' +
                            '</li>' +
                            '<li ng-if="postTypes.indexOf(\'Question\') !== -1"><span style="font-weight: bold;">Question</span>' +
                                '<ul><li>Use this if you have a specific question that has a specific answer. You\'ll be able to choose the best answer from the responses.</li></ul>' +
                            '</li>' +
                            '<li ng-if="postTypes.indexOf(\'Live Event\') !== -1"><span style="font-weight: bold;">Live Event</span>' +
                                '<ul><li>Creating a live event allows you to post continual updates on a subject. This is helpful for keeping the community updated on a subject that is ongoing. <span style="font-weight: bold;">A Live Event must use a Branch commenting system and cannot be submitted anonymously.</span></li></ul>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div ng-show="fieldName === \'CommentSystemType\'">' +
                        '<div>There are 2 types of commenting systems:</div>' +
                        '<ul>' +
                            '<li><span style="font-weight: bold;">Branch</span>' +
                                '<ul><li>This system allows commenters to reply to other comments rather than just directly to the post. This encourages a conversation to branch out to several different but related subjects. This is generally for shorter-lived discussions that can explore multiple topics.</li></ul>' +
                            '</li>' +
                            '<li><span style="font-weight: bold;">Thread</span>' +
                                '<ul><li>This is the good ol\' fashion forum system. All replies will be sequential. Generally, this encourages a conversation that stays on one topic at a time and may have opportunity for a longer discussion due to its serial nature.</li></ul>' +
                            '</li>' +
                        '</ul>' +
                    '</div>' +
                    '<div ng-show="fieldName === \'Link\'">' +
                        '<div>This is the actual link to the website that you\'d like to share with the community.</div>' +
                    '</div>' +
                    '<div ng-show="fieldName === \'Question\'">' +
                        '<div ng-show="postType ===\'Question\'">What question would you like to ask? Remember that the question must have a specific answer. <span style="font-weight: bold;">Consider using a poll if your question is speculative or opinion.</span></div>' +
                        '<div ng-show="postType ===\'Poll\'">What\'s the main question for your poll?</div>' +
                    '</div>' +
                    '<div ng-show="fieldName === \'Text\'">' +
                        '<div>Tell us what\'s on your mind!</div>' +
                        '<div style="margin-top: 20px;">This is also the area where you can place your <b>#hashtags</b> which will associate your post with community topics.</div>' +
                        '<div style="margin-top: 20px;">Posts with <b>#hashtags</b> have a higher chance of being seen.</div>' +
                    '</div>' +
                '</div>',
            scope: {
                fieldName: '=',
                postType: '=',
                isPost: '='
            },
            link: function (scope, element, attrs) {
                scope.postTypes = postService.getPostTypes(scope.isPost);
            }
        };
    }]);