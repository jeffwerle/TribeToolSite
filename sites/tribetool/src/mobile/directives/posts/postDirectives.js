angular.module('app.Directives')
    .directive('communityPosts', ['communityService', 'postService', 'commService', '$timeout', 'accountService', 'headerService', 'navigationService', 'ionicHelperService', '$rootScope', function (communityService, postService, commService, $timeout, accountService, headerService, navigationService, ionicHelperService, $rootScope) {


        /*
         '<div id="postContainer" infinite-scroll="getMorePosts()" infinite-scroll-disabled="scrollingDone || processing" infinite-scroll-distance="3">' +
             '<div ng-repeat="post in posts">' +
                 '<div class="row">' +
                    '<community-post-summary post="post"></community-post-summary>' +
                 '</div>' +
             '</div>' +
         '</div>' +
         */

        var postsList = '<ion-list id="postContainer" >' +
                            //'<div collection-repeat="post in posts" item-height="450px">' +
                            '<div ng-repeat="post in posts">' +
                                '<div class="row">' +
                                    '<community-post-summary post="post"></community-post-summary>' +
                                '</div>' +
                            '</div>' +
                        '</ion-list>';// +
                        //'<ion-infinite-scroll ng-if="!scrollingDone" on-infinite="getMorePosts()" icon="ion-loading-c" distance="10%">' +
                        //'</ion-infinite-scroll>';


        var isJsScrolling = ionicHelperService.isJsScrolling();
        var template =
                '<div>' +
                    '<div ng-show="!processing && (!posts || posts.length <= 0)">' +
                        '<h3>Looks like the {{community.Name}} community is ready for a lively discussion! <a ng-href="submit/{{community.Url}}">Be the first <excited-face-animation></excited-face-animation></a></h3>' +
                    '</div>';

        if(!isJsScrolling) {
            // Native Scrolling
            template += postsList;

            //template += '<ion-scroll style="height:100%">' + postsList + '</ion-scroll>';
            //template += '<div class="scroll-view ionic-scroll" style="height:100%"><div class="scroll" style="-webkit-transform: translate3d(0px, 0px, 0px) scale(1);">' + postsList + '</div></div>';
        }
        else {
            template += postsList;
        }


        template +=
                    '<div ng-show="processing"><loading></loading> Retrieving Posts...</div>' +
                '</div>';

        return {
            replace: true,
            restrict: 'E',
            template: template,
            scope: {
            },
            controller: ['$scope', function($scope) {

                var initializeHeader = function() {
                    headerService.options.buttons = [{
                        iconClass: 'ion-edit',
                        onClick: function() {
                            $scope.goToSubmitPage();
                        }
                    }];
                };
                $scope.$on('router:communityPageLoaded', function() {
                    initializeHeader();
                });
                initializeHeader();



                $scope.goToSubmitPage = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService);
                        return;
                    }

                    navigationService.goToPath('submit/' + communityService.community.Url);
                };
            }],
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.community = communityService.community;
                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.posts = [];
                scope.scrollingDone = false;
                scope.serviceRetrievalDone = scope.scrollingDone;
                scope.postsCache = [];
                var countToLoadFromCache = 3;

                // reset the post service cache
                postService.posts = [];

                scope.getMorePosts = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    var pullFromCache = function() {
                        // Retrieve the items from the cache
                        var cacheLength = scope.postsCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.posts.push(scope.postsCache.shift());
                        }
                        if(scope.postsCache.length <= 0 && scope.serviceRetrievalDone) {
                            scope.scrollingDone = true;
                            $rootScope.$broadcast('scroll.infiniteScrollDisable');
                        }
                        $rootScope.$broadcast('scroll.infiniteScrollComplete');
                    };

                    if(scope.postsCache.length < countToLoadFromCache && !scope.serviceRetrievalDone) {
                        // Get the posts
                        scope.processing = true;
                        postService.getPosts(scope.pageNumber, scope.countPerPage, function(data) {
                            // Success
                            if(data.Posts && data.Posts.length > 0)
                                scope.postsCache = scope.postsCache.concat(data.Posts);

                            scope.serviceRetrievalDone = !data.Posts || data.Posts.length < scope.countPerPage;
                            pullFromCache();

                            $timeout(function() {
                                scope.processing = false;
                            });

                            scope.pageNumber++;
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        }, /*useCache*/true);
                    }
                    else {
                        scope.processing = true;
                        $timeout(function() {
                            pullFromCache();
                            scope.processing = false;
                        });
                    }
                };
                scope.$on('scroll.infiniteScrollBegin', function(e, d) {
                    // Are we on the community page? We only want to intercept infinite scrolling if we're
                    // indeed on the community page
                    if(communityService.isOnCommunityPage()) {
                        scope.getMorePosts();
                    }
                });
                scope.getMorePosts();
            }
        };
    }])
    .directive('moreOptions', ['ionicHelperService', function (ionicHelperService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span class="more-options pointer" ng-click="showOptions()">' +
                    '<i class="icon ion-android-more-vertical"></i>' +
                '<span>',
            scope: {
                /*
                    {
                        title: string,
                        delete: {
                            onClick: function(),
                            text: string
                        },
                        buttons: [{
                             onClick: function(),
                             text: string
                        }]
                    }
                 */
                options: '=',
                /* This will be passed to onClick() */
                item: '=?'
            },
            link: function (scope, element, attrs) {
                scope.constructActionSheet = function() {
                    if(!scope.actionSheet)
                        scope.actionSheet = ionicHelperService.getActionSheet(scope.options, function() {
                            return scope.item;
                        });
                };
                scope.showOptions = function() {
                    scope.constructActionSheet();
                    scope.actionSheet.show();
                };
                scope.hide = function() {
                    if(scope.actionSheet)
                        scope.actionSheet.hide();
                };
            }
        };
    }])
    .directive('postHeader', ['navigationService', 'communityService', function (navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="item item-avatar">' +
                    '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                    '<div class="row">' +
                        '<div class="col-15">' +
                            '<comment-picture votable="post"></comment-picture>' +
                        '</div>' +
                        '<div class="col">' +
                            '<h2><span class="post-summary-title"><a class="visitable pointer" ng-click="goToPost()">{{post.Title}}</a></span></h2>' +
                            '<p class="post-submitted-by-text"><profile-name votable="post"></profile-name> <interaction-summary votable="post"></interaction-summary></p>' +
                            '<p class="post-submitted-by-text">{{post.CreationDate | dateRobust}}</p>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                post: '=',
                /*
                 {
                     title: string,
                     delete: {
                         onClick: function(),
                         text: string
                     },
                     buttons: [{
                         onClick: function(),
                         text: string
                         }]
                 }
                 */
                moreOptions: '=?'
            },
            link: function (scope, element, attrs) {

                scope.goToPost = function() {
                    navigationService.goToPostState(scope.post, communityService.community);
                };
            }
        };
    }])
    .directive('actionBar', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="item tabs tabs-secondary tabs-icon-left" style="overflow:visible;">' +
                    '<a class="tab-item emotion-vote-mechanism-container pointer" style="position:relative; overflow:visible;" ng-click="onEmotionVote($event)">' +
                        '<emotion-vote-mechanism options="emotionOptions" post="post" comment="comment" status="status" image-file-entry="imageFileEntry" emotion="requesterEmotion"></emotion-vote-mechanism>' +
                    '</a>' +
                    '<a class="tab-item pointer" ng-click="onComment()">' +
                        '<i class="icon ion-chatbox"></i>' +
                    '</a>' +
                    '<a class="tab-item pointer" ng-click="onShare($event)">' +
                        '<share-button options="shareOptions" post="post" comment="comment" status="status" image-file-entry="imageFileEntry"></share-button>' +
                    '</a>' +
                '</div>',
            scope: {
                post: '=?',
                postContent: '=?',
                comment: '=?',
                imageFileEntry: '=?',
                status: '=?',
                requesterEmotion: '=',
                /*
                    {
                        onComment: function(),
                        onShare: function(),
                    }
                 */
                options: '='
            },
            controller: ['$scope', function($scope) {
                $scope.emotionOptions = { };
                $scope.shareOptions = { };
            }],
            link: function (scope, element, attrs) {
                scope.onShare = function(e) {
                    scope.shareOptions.share(e);
                    if(scope.options && scope.options.onShare) {
                        scope.options.onShare();
                    }
                };
                scope.onComment = function() {
                    if(scope.options && scope.options.onComment) {
                        scope.options.onComment();
                    }
                };

                scope.onEmotionVote = function(e) {
                    scope.emotionOptions.toggleMenu();
                };
            }
        };
    }])
    .directive('interactionSummary', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span>' +
                    /*'<a class="subdued pointer" ng-click="showDetails()">{{::votable.Statistics.EmotionStatistics.TotalEmotionCount}} <emotion-icon class="inline"></emotion-icon>' +
                        '<span ng-if="showEmotionBreakdown"> (' +
                            '<span ng-if="votable.Statistics.EmotionStatistics.AmusedCount > 0">{{::votable.Statistics.EmotionStatistics.AmusedCount}} <happy-face class="inline"></happy-face></span>' +
                            '<span ng-if="votable.Statistics.EmotionStatistics.AngryCount > 0">{{::votable.Statistics.EmotionStatistics.AngryCount}} <angry-face class="inline"></angry-face></span>' +
                            '<span ng-if="votable.Statistics.EmotionStatistics.SadCount > 0">{{::votable.Statistics.EmotionStatistics.SadCount}} <sad-face class="inline"></sad-face></span>' +
                            '<span ng-if="votable.Statistics.EmotionStatistics.ExcitedCount > 0">{{::votable.Statistics.EmotionStatistics.ExcitedCount}} <excited-face class="inline"></excited-face></span>' +
                            '<span ng-if="votable.Statistics.EmotionStatistics.SurprisedCount > 0">{{::votable.Statistics.EmotionStatistics.SurprisedCount}} <surprised-face class="inline"></surprised-face></span>' +
                            '<span ng-if="votable.Statistics.EmotionStatistics.UnamusedCount > 0">{{::votable.Statistics.EmotionStatistics.UnamusedCount}} <unamused-face class="inline"></unamused-face></span>' +
                        ')</span>' +
                    '</a>' +
                    */
                    '<a class="subdued pointer" ng-click="showDetails()">' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.ExcitedCount > 0">{{::votable.Statistics.EmotionStatistics.ExcitedCount}} <excited-face class="inline"></excited-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.AmusedCount > 0">{{::votable.Statistics.EmotionStatistics.AmusedCount}} <happy-face class="inline"></happy-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.UnamusedCount > 0">{{::votable.Statistics.EmotionStatistics.UnamusedCount}} <unamused-face class="inline"></unamused-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.SadCount > 0">{{::votable.Statistics.EmotionStatistics.SadCount}} <sad-face class="inline"></sad-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.SurprisedCount > 0">{{::votable.Statistics.EmotionStatistics.SurprisedCount}} <surprised-face class="inline"></surprised-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.AngryCount > 0">{{::votable.Statistics.EmotionStatistics.AngryCount}} <angry-face class="inline"></angry-face></span>' +

                    '</a>' +
                    '<a class="subdued pointer">{{::votable.Statistics.CommentCount}} <i class="icon ion-chatbox"></i></a>' +
                '</span>',
            scope: {
                votable: '='
            },
            link: function (scope, element, attrs) {
                scope.showDetails = function() {
                    if(scope.votable.Statistics.EmotionStatistics.TotalEmotionCount > 0) {
                        scope.showEmotionBreakdown = true;

                        // Show the accounts that emotion voted
                        accountService.showAccountList({
                            votable: scope.votable
                        });
                    }

                };
            }
        };
    }])
    .directive('communityPostSummary', ['communityService', 'postService', 'accountService', 'navigationService', 'mediaService', 'formatterService', 'tagService', 'tagPageService', '$compile', '$timeout', 'postDirectiveService', function (communityService, postService, accountService, navigationService, mediaService, formatterService, tagService, tagPageService, $compile, $timeout, postDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="community-post-summary">' +
                    '<div class="post-summary-container list card" emotion-color="post.Statistics.EmotionStatistics.EmotionType">' +

                        '<post-header post="post"></post-header>' +

                        '<div ng-if="isReady" class="item item-body">' +

                            '<div ng-if="post.PostType===\'Link\' && post.Link">' +
                                '<post-content-link-content style="overflow:hidden;" link="post.Link" link-html="linkMediaHtml" markdown-options="markdownOptions"></post-content-link-content>' +
                            '</div>' +
                            '<div ng-if="(post.PostType===\'Question\' || post.PostType===\'Poll\') && post.Question && post.Question !== post.Title">' +
                                '<post-content-question-content question="post.Question"></post-content-question-content>' +
                            '</div>' +

                            '<div class="post-summary-media-container clear-both"></div>' +
                            '<p>' +
                                '<div ng-show="post.Description"><span class="post-summary-description" btf-markdown="post.Description" markdown-options="markdownOptions"></span></div>' +
                            '</p>' +
                        '</div>' +

                        '<action-bar ng-if="isReady" post="post" options="actionBarOptions" requester-emotion="post.RequesterEmotion"></action-bar>' +

                    '</div>' +
                '</div>',
            scope: {
                post: '='
            },
            link: function (scope, element, attrs) {
                // wrap in timeout for collection-repeat
                $timeout(function() {
                    scope.navigationService = navigationService;
                    scope.mediaService = mediaService;
                    scope.postUrl = navigationService.getPostUrl(scope.post, communityService.community);
                    scope.commentString = scope.post.Statistics.CommentCount > 1 ? scope.post.Statistics.CommentCount + ' Comments' : scope.post.Statistics.CommentCount === 1 ? '1 Comment' : 'Comment';


                    scope.markdownOptions = postDirectiveService.getPostSummaryMarkdownOptions();

                    scope.actionBarOptions = {
                        onShare: function() {

                        },
                        onComment: function() {
                            navigationService.goToPath(scope.postUrl);
                        }
                    };


                    // Determine whether the post belongs to the current account
                    scope.isAccountPost = accountService.account && accountService.account.Id === scope.post.AccountId;

                    var populateMedia = function() {

                        var insertMediaHtml = function(mediaHtml) {
                            if(mediaHtml) {
                                var compiledHtml = $compile(mediaHtml)(scope);
                                element.find('.post-summary-media-container').append(compiledHtml);
                            }
                        };

                        postDirectiveService.getPostSummaryMediaHtml(scope, insertMediaHtml);
                    };

                    $timeout(function() {
                        scope.isReady = true;
                        $timeout(function() {
                            populateMedia();
                        });
                    });
                });
            }
        };
    }])
    .directive('postPage', ['$rootScope', 'communityService', 'postService', '$location', '$timeout', 'navigationService', 'mediaService', 'accountService', 'headerService', function ($rootScope, communityService, postService, $location, $timeout, navigationService, mediaService, accountService, headerService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +

                    // If there are multiple post contents then our infinite scroll will be on the post content (not the comments)
                    '<div ng-if="post.Contents.length > 1">' +
                        '<ion-list>' +
                            '<div ng-repeat="content in contents">' +
                                '<post-content post-url="postUrl" index="$index" post="post" post-content="content"></post-content>' +
                            '</div>' +
                        '</ion-list>' +

                        //'<ion-infinite-scroll ng-if="!scrollingDone" on-infinite="getMoreItems()" icon="ion-loading-c" distance="1%">' +
                        //'</ion-infinite-scroll>' +
                    '</div>' +
                    // If there is only one post content then our infinite scroll will be on the comments
                    '<div ng-if="post.Contents.length <= 1">' +
                        '<div ng-repeat="content in post.Contents">' +
                            '<post-content post-url="postUrl" index="$index" post="post" post-content="content"></post-content>' +
                        '</div>' +
                    '</div>' +

                '</div>',
            scope: {
                post: '='
            },
            link: function (scope, element, attrs) {

                headerService.setTitle(scope.post.Title);

                scope.mediaService = mediaService;
                scope.postUrl = navigationService.getPostUrl(scope.post, communityService.community);


                if(scope.post.Contents.length > 1) {
                    var countToLoadFromCache = 1;
                    scope.contentsCache = angular.extend([], scope.post.Contents);
                    scope.contents = [];
                    scope.scrollingDone = false;
                    scope.processing = false;
                    scope.getMoreItems = function() {
                        if(scope.processing || scope.scrollingDone) {
                            return;
                        }
                        scope.processing = true;

                        // Retrieve the items from the cache
                        var cacheLength = scope.contentsCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.contents.push(scope.contentsCache.shift());
                        }
                        if(scope.contentsCache.length <= 0) {
                            scope.scrollingDone = true;
                            scope.processing = false;
                            $rootScope.$broadcast('scroll.infiniteScrollDisable');
                        }
                        else {
                            $timeout(function() {
                                scope.processing = false;
                                $rootScope.$broadcast('scroll.infiniteScrollComplete');
                            });
                        }
                    };

                    scope.$on('scroll.infiniteScrollBegin', function(e, d) {
                        // Are we on the post page? We only want to intercept infinite scrolling if we're
                        // indeed on the post page
                        if(communityService.isOnPostPage()) {
                            scope.getMoreItems();
                        }
                    });
                    scope.getMoreItems();
                }

            }
        };
    }])

    .directive('postContent', ['$rootScope', 'accountService', 'communityService', 'navigationService', 'postService', 'commService', 'postDirectiveService', '$ionicPopup', '$ionicLoading', 'commentDirectiveService', '$timeout', function ($rootScope, accountService, communityService, navigationService, postService, commService, postDirectiveService, $ionicPopup, $ionicLoading, commentDirectiveService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="post-content-container list card" emotion-color="post.Statistics.EmotionStatistics.EmotionType">' +

                        '<div class="item item-avatar">' +
                            '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                            '<div class="row">' +
                                '<div class="col-15">' +
                                    '<comment-picture votable="postContent"></comment-picture>' +
                                '</div>' +
                                '<div class="col">' +
                                    '<h2 ng-if="index===0"><span class="post-summary-title"><a class="visitable pointer">{{post.Title}}</a></span></h2>' +
                                    '<p class="post-submitted-by-text">{{currentVersion.CreationDate | dateRobust}}, <profile-name votable="postContent"></profile-name></p>' +
                                    '<p><interaction-summary votable="postContent"></interaction-summary></p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div class="item item-body">' +

                            '<div ng-show="!formOptions.showEdit">' +

                                '<div ng-if="postContent.PostContentType===\'Link\' && postContent.CurrentVersion.Link">' +
                                    '<post-content-link-content style="overflow:hidden;" link="postContent.CurrentVersion.Link" markdown-options="markdownOptions"></post-content-link-content>' +
                                '</div>' +

                                /* The Question will be displayed in the Poll directive */
                                '<poll ng-if="postContent.CurrentVersion.Poll" post="post" post-content="postContent" index="index"></poll>' +

                                '<div ng-if="postContent.PostContentType===\'Question\'">' +
                                    '<post-content-question-content question="postContent.CurrentVersion.Question"></post-content-question-content>' +
                                '</div>' +

                                '<p>' +
                                    '<div ng-show="postContent.CurrentVersion.FormattedText"><span class="post-content-description" btf-markdown="postContent.CurrentVersion.FormattedText" markdown-options="markdownOptions"></span></div>' +
                                '</p>' +
                            '</div>' +

                            '<div ng-if="formOptions.showEdit">' +
                                '<form ng-submit="submitEdit()" novalidate="novalidate">' +
                                    '<content-editor options="contentEditorOptions" show-toolbar="true" text-area-height="110" text="formOptions.formattedText"></content-editor>' +
                                    '<div style="clear:both;">' +
                                        '<button class="button button-block button-positive" type="submit">Save</button>' +
                                        '<button class="button button-block button-stable" type="button" ng-click="cancelEdit()">Cancel</button>' +
                                    '</div>' +
                                '</form>' +
                            '</div>' +

                        '</div>' +

                        '<action-bar post="post" post-content="postContent" options="actionBarOptions" requester-emotion="postContent.RequesterEmotion"></action-bar>' +

                    '</div>' +

                    '<div class="comment-layer">' +
                        '<comment-input ng-if="commentInputOptions" options="commentInputOptions"></comment-input>' +
                        '<a id="{{commentsAnchorId}}"></a>' +


                        // If there is only one post content then our infinite scroll will be on the comments
                        '<div ng-if="post.Contents.length <= 1">' +
                            '<ion-list>' +
                                '<div ng-repeat="comment in comments">' +
                                    // Only show the comment if it's not trashed OR (if it is trashed and) it has child comments
                                    '<comment-entry level="0" ng-if="!comment.IsTrashed || (comment.Comments && comment.Comments.length > 0)" comment="comment" options="commentOptions"></comment-entry>' +
                                '</div>' +
                            '</ion-list>' +

                            //'<ion-infinite-scroll ng-if="!scrollingDone" on-infinite="getMoreItems()" icon="ion-loading-c" distance="10%">' +
                            //'</ion-infinite-scroll>' +
                        '</div>' +
                        // If there are multiple post contents then our infinite scroll will be on the post content (not the comments)
                        '<div ng-if="post.Contents.length > 1">' +
                            '<div ng-repeat="comment in postContent.Comments">' +
                                '<div ng-if="!comment.isNotReady">' +
                                    // Only show the comment if it's not trashed OR (if it is trashed and) it has child comments
                                    '<comment-entry level="0" ng-if="!comment.IsTrashed || (comment.Comments && comment.Comments.length > 0)" comment="comment" options="commentOptions"></comment-entry>' +
                                '</div>' +
                                '<div ng-if="comment.isNotReady">' +
                                    '<loading></loading> Loading...' +
                                '</div>' +
                            '</div>' +


                        '</div>' +


                    '</div>' +
                '</div>',
            scope: {
                index: '=',
                post: '=',
                postContent: '=',
                postUrl: '='
            },
            link: function (scope, element, attrs) {
                postDirectiveService.initializePostContentScope(scope);

                if(scope.isAccountPost) {
                    scope.moreOptions = {
                        title: 'Post Options',
                        buttons: [{
                            text: 'Edit Post',
                            onClick: function() {
                                scope.edit();
                            }
                        }]
                    };
                    if(scope.isModerator) {
                        scope.moreOptions.delete = {
                            text: 'Delete Post',
                            onClick: function() {
                                var confirmPopup = $ionicPopup.confirm({
                                    title: 'Delete Post Forever?',
                                    template: 'Are you sure you want to delete this Post forever?',
                                    okText: 'Delete',
                                    okType: 'button-assertive'
                                });
                                confirmPopup.then(function(res) {
                                    if(res) {
                                        // Delete Post
                                        scope.delete();
                                    } else {
                                        // Cancelled
                                    }
                                });
                            }
                        };
                    }
                }

                scope.actionBarOptions = {
                    onShare: function() {
                        // TODO: Share
                    },
                    onComment: function() {
                        // Go to comment input box
                        $timeout(function() {
                            scope.commentInputOptions.focus(true, function() {
                                scope.commentInputOptions.scrollTo();
                            });
                        }, 10);
                    }
                };



                scope.submitEdit = function() {
                    // Did we make any change?
                    if(scope.formOptions.formattedText === scope.formattedTextBeforeEdit) {
                        // No change, we're done
                        scope.cancelEdit();
                        return;
                    }
                    scope.postContent.CurrentVersion.FormattedText = scope.formOptions.formattedText;

                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Edit...'
                    });

                    // Submit comment edit to service
                    postService.editPostContent(scope.postContent, scope.post.Id, function(data) {
                        // Success
                        $ionicLoading.hide();
                        scope.postContent = data.PostContent;
                        scope.formOptions.formattedText = scope.postContent.CurrentVersion.FormattedText;

                        scope.post.IsEdited = true;
                        scope.formOptions.showEdit = false;
                        scope.scrollToPostContent();
                        commService.showSuccessAlert('Post edited successfully!');
                    }, function(data) {
                        // Failure
                        $ionicLoading.hide();
                        commService.showErrorAlert(data);
                    });
                };


                scope.delete = function() {
                    $ionicLoading.show({
                        template: '<loading></loading> Deleting...'
                    });
                    postService.deletePost(scope.post, function(data) {
                        // Success
                        $ionicLoading.hide();
                        navigationService.goToCommunity(communityService.community.Url);
                        commService.showSuccessAlert('Post deleted successfully!');
                    }, function(data) {
                        // Failure
                        $ionicLoading.hide();
                        commService.showErrorAlert(data);
                    });
                };


                if(scope.post.Contents.length <= 1) {
                    var countToLoadFromCache = 3;
                    scope.commentsCache = angular.extend([], scope.postContent.Comments);
                    scope.comments = [];
                    scope.scrollingDone = false;
                    scope.processingComments = false;
                    scope.getMoreItems = function() {
                        if(scope.processingComments || scope.scrollingDone) {
                            return;
                        }
                        scope.processingComments = true;

                        // Retrieve the items from the cache
                        var cacheLength = scope.commentsCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.comments.push(scope.commentsCache.shift());
                        }
                        if(scope.commentsCache.length <= 0) {
                            scope.scrollingDone = true;
                            scope.processingComments = false;
                            $rootScope.$broadcast('scroll.infiniteScrollDisable');
                        }
                        else {
                            $timeout(function() {
                                scope.processingComments = false;
                                $rootScope.$broadcast('scroll.infiniteScrollComplete');
                            });
                        }
                    };
                    scope.$on('scroll.infiniteScrollBegin', function(e, d) {
                        // Are we on the post page? We only want to intercept infinite scrolling if we're
                        // indeed on the post page
                        if(communityService.isOnPostPage()) {
                            scope.getMoreItems();
                        }
                    });
                    scope.getMoreItems();
                }
                else {
                    commentDirectiveService.loadCommentsProgressively(scope.postContent);
                }
            }
        };
    }]);