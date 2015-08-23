angular.module('app.Directives')
    .directive('submitPostFormContents', ['postDirectiveService', function (postDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="list card">' +

                        '<label ng-show="isPost" class="item item-input item-stacked-label">' +
                            '<span class="input-label">Title <span class="required-star">*</span></span>' +
                            '<input type="text" ng-focus="setFieldName(\'Title\')" placeholder="Title" ng-required="isPost" ng-model="form.Title" ng-change="titleChanged()">' +
                        '</label>' +

                        '<label class="item item-input item-select">' +
                            '<span class="input-label">Post Type</span>' +
                            '<select ng-focus="setFieldName(\'PostType\')" ng-model="form.PostType" ng-change="postTypeChanged()">' +
                                '<option ng-repeat="postType in postTypes">{{postType}}</option>' +
                            '</select>' +
                        '</label>' +
                        '<label ng-show="form.PostType === \'Question\' || form.PostType === \'Poll\'" class="item item-input item-stacked-label">' +
                            '<span class="input-label">Question <span  class="required-star">*</span></span>' +
                            '<input type="text" ng-required="form.PostType === \'Question\' || form.PostType === \'Poll\'" placeholder="What\'s your question?" ng-model="form.Question" ng-focus="setFieldName(\'Question\')">' +
                        '</label>' +
                        '<div ng-show="form.PostType === \'Poll\'" class="item item-input">' +
                            '<poll-creator form="form"></poll-creator>' +
                        '</div>' +
                        '<label ng-show="form.PostType === \'Link\'" class="item item-input item-stacked-label">' +
                            '<span class="input-label">Link <span class="required-star">*</span></span>' +
                            '<input type="text" ng-focus="setFieldName(\'Link\')" placeholder="http://www.example.com" ng-required="form.PostType === \'Link\'" ng-model="form.Link">' +
                        '</label>' +
                        '<label class="item item-input item-stacked-label">' +
                            // Text is necessary for a Text or Live Event Post
                            '<span class="input-label" ng-show="form.PostType === \'Text\' || form.PostType === \'Live Event\'">Text<span  class="required-star">*</span></span>' +
                            // But not for any others
                            '<span class="input-label" ng-show="form.PostType !== \'Text\' && form.PostType !== \'Live Event\'">Text (optional)</span>' +
                            '<content-editor show-toolbar="true" is-required="form.PostType === \'Text\' || form.PostType === \'Live Event\'" options="formattingHelperOptions" text="form.Text" placeholder="\'Tell us something fascinating...\'"></content-editor>' +
                        '</label>' +
                        '<label class="item item-input item-stacked-label">' +
                            '<span class="input-label">Tags (#optional)</span>' +
                            '<tag-content-editor is-required="false" text="form.tagText" tags="form.tags" final-tag-text="form.finalTagText" placeholder="\'Put your #tags here...\'"></tag-content-editor>' +
                        '</label>' +
                    /*
                        '<label ng-show="isPost && form.PostType !== \'Live Event\'" class="item item-toggle">' +
                            'Submit Anonymously' +
                            '<label class="toggle toggle-assertive">' +
                                '<input ng-model="form.IsAnonymous" ng-change="submitAnonymouslyChanged()" type="checkbox">' +
                                '<div class="track">' +
                                    '<div class="handle"></div>' +
                                '</div>' +
                            '</label>' +

                            '<div><unamused-face></unamused-face> (If submitted anonymously, no one will know you submitted this post, but you also won\'t get any experience points).</div>' +
                        '</label>' +
                        */
                    '</div>' +
                    '<div style="margin-top: 10px;">' +
                        '<div ng-show="form.PollOptionsError" class="pull-right" style="color: red;">{{form.PollOptionsError}}</div>' +
                        '<button class="button button-block button-positive col-80 col-offset-10" type="submit">Submit Post</button>' +
                        '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="options.onCancel()">Cancel</button>' +
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

                scope.postTypes = scope.isPost ? ['Text', 'Link', 'Question', 'Poll'] : ['Text', 'Link', 'Poll'];
            }
        };
    }])
    .directive('pollCreator', ['communityService', 'postService', 'navigationService', 'commService', function (communityService, postService, navigationService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="width: 100%;" class="poll-creator">' +
                    '<h3 class="centered">Poll Options</h3>' +
                    '<div ng-repeat="pollOption in form.PollOptions">' +

                        '<div class="row">' +

                            '<div class="list card col col-80">' +
                                '<label class="item item-input">' +
                                    '<input type="text" ng-required="form.PostType === \'Poll\'" ng-model="pollOption.Text" placeholder="Poll Option #{{$index + 1}}">' +
                                '</label>' +
                            '</div>' +
                            '<div class="col col-20">' +
                                '<button class="button button-block button-assertive" type="button" ng-click="removePollOption(pollOption, $index)"><i class="fa fa-times"></i></button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<button class="button button-block button-calm col-80 col-offset-10" type="button" ng-click="addPollOption()"><i class="fa fa-plus"></i> Add Poll Option</button>' +
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
    .directive('communitySubmitNewPost', ['postDirectiveService', function (postDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess">' +

                    '<h2 class="centered">Submit a Post <excited-face-animation></excited-face-animation></h2>' +
                    '<div ng-show="!processing">' +
                        '<div style="color: red;" class="bold centered">Please remember that the post should be in the context of "{{community.Options.Topic}}".</div>' +
                        '<form name="submitPostForm" ng-submit="submit()" novalidate="novalidate">' +
                            '<submit-post-form-contents form="form" options="formOptions" field-name="fieldName" is-post="true"></submit-post-form-contents>' +

                        '</form>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                postDirectiveService.initializeCommunitySubmitNewPostScope(scope);

                scope.form.CommentSystemType = 'Branch';

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