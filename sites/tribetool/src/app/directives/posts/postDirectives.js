angular.module('app.Directives')
    .directive('communityPosts', ['communityService', 'postService', 'commService', '$timeout', 'accountService', 'navigationService', function (communityService, postService, commService, $timeout, accountService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="!processing && (!posts || posts.length <= 0)">' +
                        '<h3>Looks like the {{community.Name}} community is ready for a lively discussion! <a ng-href="submit/{{community.Url}}">Be the first <excited-face-animation></excited-face-animation></a></h3>' +
                    '</div>' +

                    '<div ng-show="posts && posts.length > 0" class="community-page-toolbar">' +
                        '<community-submit-new-post-link class="centered" style="margin-bottom: 10px; margin-top: 10px;"></community-submit-new-post-link>' +
                    '</div>' +

                    '<div id="postContainer" infinite-scroll="getMorePosts()" infinite-scroll-disabled="scrollingDone || processing" infinite-scroll-distance="1">' +
                        '<div ng-repeat="post in posts">' +
                            '<div>' +
                                '<community-post-summary post="post"></community-post-summary>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div ng-show="processing"><loading></loading> Retrieving Posts...</div>' +

                '</div>',
            scope: {
            },
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
                        }
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
                        });
                    }
                    else {
                        scope.processing = true;
                        $timeout(function() {
                            pullFromCache();
                            scope.processing = false;
                        });
                    }
                };
                scope.getMorePosts();
            }
        };
    }])
    .directive('communitySidebar', ['communityService', 'communityRenderService',  function (communityService, communityRenderService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<news-items style="margin-bottom:20px;"></news-items>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                if(communityService.communityRenderOptions &&
                    communityService.communityRenderOptions.community &&
                    communityService.communityRenderOptions.community.sidebar) {
                    communityRenderService.addElements(element, scope, communityService.communityRenderOptions.community.sidebar.objects);
                }
            }
        };
    }])
    .directive('communitySubmitNewPostLink', ['communityService', 'navigationService', 'accountService', function (communityService, navigationService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                    '<div ng-show="hasWriteAccess">' +
                        '<button id="submitNewPostButton" class="btn btn-primary" ng-click="goToSubmitPage()"><i class="fa fa-pencil"></i> Submit New Post</button>' +
                    '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.goToSubmitPage = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService);
                        return;
                    }

                    navigationService.goToPath('submit/' + communityService.community.Url);
                };

            }
        };
    }])
    .directive('moreOptions', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span class="more-options pointer" ng-context-menu="menuOptions">' +
                    '<i class="icon ion-android-more-vertical"></i>' +
                '<span>',
            scope: {
                /*
                 {
                     title: string,
                     deleteButton: {
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

                scope.menuOptions = {
                    onShow: function() {

                    },
                    items: []
                };


                var buttonFunction = function($itemScope, data) {
                    data.onClick(scope.item);
                };
                for(var i = 0; i < scope.options.buttons.length; i++) {
                    var button = scope.options.buttons[i];
                    scope.menuOptions.items.push(['<span>' + button.text + '</span>',
                        buttonFunction,
                    button]);
                }


                if(scope.options.deleteButton) {
                    scope.menuOptions.items.push(['<span style="color: red;">' + scope.options.deleteButton.text + '</span>',
                        function($itemScope) {
                            scope.options.deleteButton.onClick(scope.item);
                        }
                    ]);
                }

                if(scope.menuOptions.items.length > 0)
                    scope.menuOptions.items.push(null); // divider

                scope.menuOptions.items.push(['<span>Cancel</span>',
                    function($itemScope) {
                    }
                ]);

            }
        };
    }])
    .directive('interactionSummary', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span class="interaction-summary">' +
                    '<span ng-show="options.onCommentClicked && commentMessage">' +
                        '<a ng-click="options.onCommentClicked()" class="pointer info-text"><i class="icon ion-chatbox"></i> {{commentMessage}}</a>' +
                    '</span>' +
                    '<span ng-show="dominantEmotion">' +
                        '<span class="emotion-icon-no-hover emotion-{{dominantEmotionLowercase}} emotion-sprite-small-{{dominantEmotionLowercase}}"></span> <span ng-repeat="account in accounts"><profile-name account="account"></profile-name>{{account.suffix}}</span><span ng-show="seeOtherMessage">. View <a class="pointer" ng-click="showDetails()">{{seeOtherMessage}}</a>.</span>' +
                    '</span>' +
                '</span>',
            scope: {
                votable: '=', // onEmotionVote will be set on this votable
                hideCommentCount: '=?',

                /*
                 onCommentClicked: function(votable) { }
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {

                scope.update = function() {
                    scope.commentMessage = scope.votable.Statistics.CommentCount > 0 ? scope.votable.Statistics.CommentCount === 1 ? '1 comment.' : scope.votable.Statistics.CommentCount + ' comments.' : null;
                    // What's the dominant emotion of the names that were provided to us?
                    scope.emotionVotes = scope.votable.EmotionVotes;
                    var counts = { }, i = 0;
                    for(i = 0; i < scope.emotionVotes.length; i++) {
                        var accountEmotion = scope.emotionVotes[i];
                        if(accountEmotion.Account) {
                            var emotion = accountEmotion.EmotionType;
                            if(!counts[emotion]) {
                                counts[emotion] = {
                                    count: 0,
                                    accounts: []
                                };
                            }
                            counts[emotion].count++;
                            counts[emotion].accounts.push(accountEmotion.Account);
                        }
                    }
                    var maxCount = 0;
                    var emotionCountObject = null;
                    scope.dominantEmotion = null;
                    for(var e in counts) {
                        var obj = counts[e];
                        if(obj.count > maxCount){
                            emotionCountObject = obj;
                            maxCount = obj.count;
                            scope.dominantEmotion = e;
                        }
                    }

                    if(maxCount > 0) {
                        scope.accounts = emotionCountObject.accounts;
                        if(scope.accounts.length > 1) {
                            for(i = 0; i < scope.accounts.length; i++) {
                                var account = scope.accounts[i];
                                if(i + 1 >= scope.accounts.length) {
                                    // last account
                                }
                                else if(i + 2 >= scope.accounts.length) {
                                    // second to last account
                                    // Should we use an oxford comma or not?
                                    account.suffix = (scope.accounts.length > 2 ? ',' : '') + ' and ';
                                }
                                else {
                                    account.suffix = ', ';
                                }
                            }
                        }

                        scope.dominantEmotionLowercase = scope.dominantEmotion ? scope.dominantEmotion.toLowerCase() : null;

                    }
                    if(scope.accounts) {
                        var otherCount = scope.emotionVotes.length - scope.accounts.length;
                        scope.seeOtherMessage = otherCount > 0 ? otherCount === 1 ? '1 other' : otherCount + ' others' : null;
                    }

                    scope.showDetails = function() {
                        if(scope.votable.Statistics.EmotionStatistics.TotalEmotionCount > 0) {
                            scope.showEmotionBreakdown = true;

                            // Show the accounts that emotion voted
                            accountService.showAccountList({
                                votable: scope.votable,
                                type: 'EmotionVote'
                            });
                        }
                    };
                };

                scope.update();

                scope.votable.onEmotionVote = function() {
                    scope.update();
                };
            }
        };
    }])
    /*
    .directive('interactionSummary', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span class="interaction-summary">' +
                    '<a class="pointer" ng-click="showDetails()" style="margin-right: 5px;">' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.ExcitedCount > 0">{{::votable.Statistics.EmotionStatistics.ExcitedCount}} <excited-face class="inline"></excited-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.AmusedCount > 0">{{::votable.Statistics.EmotionStatistics.AmusedCount}} <happy-face class="inline"></happy-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.UnamusedCount > 0">{{::votable.Statistics.EmotionStatistics.UnamusedCount}} <unamused-face class="inline"></unamused-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.SadCount > 0">{{::votable.Statistics.EmotionStatistics.SadCount}} <sad-face class="inline"></sad-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.SurprisedCount > 0">{{::votable.Statistics.EmotionStatistics.SurprisedCount}} <surprised-face class="inline"></surprised-face></span>' +
                        '<span ng-if="votable.Statistics.EmotionStatistics.AngryCount > 0">{{::votable.Statistics.EmotionStatistics.AngryCount}} <angry-face class="inline"></angry-face></span>' +

                    '</a>' +
                    '<a class="pointer" ng-hide="hideCommentCount" ng-click="onCommentClicked()">{{::votable.Statistics.CommentCount}} <i class="icon ion-chatbox"></i></a>' +
                '</span>',
            scope: {
                votable: '=',
                hideCommentCount: '=?',


                options: '=?' // onCommentClicked: function(votable) { }
            },
            link: function (scope, element, attrs) {
                if(!angular.isDefined(scope.votable.Statistics.CommentCount)) {
                    scope.votable.Statistics.CommentCount = 0;
                }

                scope.showDetails = function() {
                    if(scope.votable.Statistics.EmotionStatistics.TotalEmotionCount > 0) {
                        scope.showEmotionBreakdown = true;

                        // Show the accounts that emotion voted
                        accountService.showAccountList({
                            votable: scope.votable,
                            type: 'EmotionVote'
                        });
                    }
                };

                scope.onCommentClicked = function() {
                    if(scope.options && scope.options.onCommentClicked) {
                        scope.options.onCommentClicked(scope.votable);
                    }
                };
            }
        };
    }])
    */
    .directive('communityPostSummary', ['communityService', 'postService', 'accountService', 'navigationService', 'mediaService', 'formatterService', 'tagService', 'tagPageService', '$compile', '$timeout', 'postDirectiveService', function (communityService, postService, accountService, navigationService, mediaService, formatterService, tagService, tagPageService, $compile, $timeout, postDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:


                '<div class="post-summary">' +
                    '<div ng-if="!mediaService.isPhone" class="pull-left post-summary-picture-container">' +
                        '<div style="margin-top:2px;">' +
                            '<comment-picture votable="post"></comment-picture>' +
                        '</div>' +
                    '</div>' +


                    //'<div class="post-summary-container" emotion-color="post.Statistics.EmotionStatistics.EmotionType">' +
                    '<div class="post-summary-container">' +
                        '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                        '<pin-link ng-hide="hidePin" post="post" pinned-item="post.PinnedItem" ng-class="{\'has-more-options\': moreOptions}"></pin-link>' +

                        // We use ng-if="isReady" to make the loading of the post summary feel snappier (we'll load on the
                        // next digest).
                        '<div ng-if="isReady" class="post-summary-content-container">' +


                            '<div class="post-summary-header">' +

                                '<div ng-if="mediaService.isPhone" class="comment-picture-container">' +
                                    '<comment-picture votable="comment"></comment-picture>' +
                                '</div>' +
                                '<div class="post-summary-header-content">' +
                                    //'<post-type-picture post="post" style="float:right;" class="pointer" ng-click="goToPost()"></post-type-picture>' +
                                    '<span class="post-summary-title"><a class="visitable" ng-href="{{postUrl}}">{{post.Title}}</a></span>' +
                                    '<div class="post-submitted-by-text"><profile-name votable="post"></profile-name> {{post.CreationDate | dateRobust:\'medium\'}}</div>' +
                                    //'<div class="post-submitted-by-text"><interaction-summary votable="post" options="interactionSummaryOptions"></interaction-summary></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="post-summary-content">' +

                                '<div ng-if="post.PostType===\'Link\' && post.Link">' +
                                    '<post-content-link-content style="overflow:hidden;" link="post.Link" link-html="linkMediaHtml" markdown-options="markdownOptions"></post-content-link-content>' +
                                '</div>' +
                                '<div ng-if="(post.PostType===\'Question\' || post.PostType===\'Poll\') && post.Question && post.Question !== post.Title">' +
                                    '<post-content-question-content question="post.Question"></post-content-question-content>' +
                                '</div>' +

                                '<div class="post-summary-media-container clear-both"></div>' +
                                '<div ng-show="post.Description"><span class="post-summary-description" btf-markdown="post.Description" markdown-options="markdownOptions"></span></div>' +
                            '</div>' +
                            '<div class="post-summary-control-area">' +
                                '<div class="col-sm-12"><interaction-summary votable="post" options="interactionSummaryOptions"></interaction-summary></div>' +

                                '<div ng-if="tags && tags.length > 0" ng-class="{\'pull-right post-summary-tag-container\': !mediaService.isPhone, \'col-xs-12\': mediaService.isPhone}">' +
                                    '<tag-picture-area tags="tags"></tag-picture-area>' +
                                '</div>' +

                                '<div class="toolbar-container pull-left col-sm-6">' +
                                    '<div class="toolbar-item">' +
                                        '<emotion-vote-mechanism class="toolbar-emotion-vote-mechanism" post="post" emotion="post.RequesterEmotion"></emotion-vote-mechanism>' +
                                    '</div>' +
                                    '<div ng-show="hasWriteAccess" class="toolbar-item">' +
                                        '<button type="button" class="btn large-toolbar-button toolbar-button-hoverable" ng-click="commentClicked()"><i class="icon ion-chatbox"></i></button>' +
                                    '</div>' +
                                    '<div ng-show="hasWriteAccess" class="toolbar-item">' +
                                        '<share-link class="large-toolbar-button" post="post" permalink="postUrl"></share-link>' +
                                    '</div>' +
                                '</div>' +


                                '<div class="clearfix"></div>' +


                            '</div>' +

                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                post: '=',
                hidePin: '=?'
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.postUrl = navigationService.getPostUrl(scope.post, communityService.community);
                scope.commentString = scope.post.Statistics.CommentCount > 1 ? scope.post.Statistics.CommentCount + ' Comments' : scope.post.Statistics.CommentCount === 1 ? '1 Comment' : 'Comment';


                scope.commentClicked = function() {
                    navigationService.goToPath(scope.postUrl + '?reply=true');
                };
                scope.interactionSummaryOptions = {
                    onCommentClicked: function() {
                        scope.commentClicked();
                    }
                };

                scope.markdownOptions = postDirectiveService.getPostSummaryMarkdownOptions();


                scope.goToPost = function() {
                    navigationService.goToPath();
                };

                scope.tags = [];
                if(scope.post.Tags) {
                    for(var i = 0; i < scope.post.Tags.length; i++) {
                        scope.tags.push(scope.post.Tags[i]);
                    }
                }

                // Determine whether the post belongs to the current account
                scope.isAccountPost = accountService.account && accountService.account.Id === scope.post.AccountId;
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.edit = function() {
                    navigationService.goToPath(scope.postUrl + '?edit=true');
                };
                scope.report = function() {
                };


                scope.interactionSummaryOptions = {
                    onCommentClicked: function(votable) {
                        scope.commentClicked();
                    }
                };

                if(scope.isAccountPost && scope.hasWriteAccess) {
                    scope.moreOptions = {
                        title: 'Post Options',
                        buttons: [{
                            text: 'Edit Post',
                            onClick: function() {
                                scope.edit();
                            }
                        },
                            {
                                text: 'Report',
                                onClick: function() {
                                    scope.report();
                                }
                            }]
                    };
                }


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
            }
        };
    }])
    .directive('postPage', ['communityService', 'postService', '$location', '$timeout', 'navigationService', 'metaService', 'mediaService', 'accountService', function (communityService, postService, $location, $timeout, navigationService, metaService, mediaService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="margin-top:20px;">' +
                    '<div class="col-md-1"></div>' +
                    '<div class="post-container col-md-11">' +
                        '<div>' +
                            '<div class="post-header clearfix">' +
                                '<div class="pull-left" style="margin-right: 10px;">' +
                                    '<comment-picture votable="post" show-only-picture="true" suppress-progress="true"></comment-picture>' +
                                '</div>' +
                                '<div ng-if="post.PostType === \'LiveEvent\' && canShowLiveEventEdit" style="float: right;">' +
                                    '<button ng-show="!showLiveEventEdit" class="btn btn-primary" ng-click="setShowLiveEventEdit(true)">Update Live Event</button><button ng-show="showLiveEventEdit" class="btn btn-primary" ng-click="setShowLiveEventEdit(false)">Cancel Update Live Event</button>' +
                                '</div>' +
                                '<div style="float: left; margin-top: -5px;">' +
                                    '<span class="post-title"><a ng-href="{{postUrl}}">{{post.Title}}</a></span>' +
                                    '<div class="post-submitted-by-text"><profile-name votable="post"></profile-name> {{post.CreationDate | dateRobust:\'medium\'}}<span ng-show="post.IsEdited"> *Edited</span></div>' +
                                '</div>' +
                            '</div>' +


                            '<div ng-if="showLiveEventEdit">' +
                                '<div class="white-well clearfix">' +
                                    '<a id="submitLiveEventPostContent"></a>' +
                                    '<community-submit-live-event-post-content post="post" options="liveEventUpdateOptions"></community-submit-live-event-post-content>' +
                                '</div>' +
                            '</div>' +
                            '<div ng-repeat="content in post.Contents">' +
                                '<post-content post-url="postUrl" index="$index" post="post" post-content="content"></post-content>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '<post-page-tour ng-if="!mediaService.isPhone"></post-page-tour>' +
                '</div>',
            scope: {
                post: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.postUrl = navigationService.getPostUrl(scope.post, communityService.community);
                scope.showLiveEventEdit = false;
                scope.setShowLiveEventEdit = function(val) {
                    scope.showLiveEventEdit = val;
                    if(scope.showLiveEventEdit) {
                        $timeout(function() {
                            navigationService.scrollToHash('submitLiveEventPostContent');
                        });
                    }
                };


                scope.addPostContent = function(postContent) {
                    if(postContent)
                    {

                        // Only add the PostContent if we need to
                        var found = false;
                        for(var i = 0; i < scope.post.Contents.length; i++) {
                            if(scope.post.Contents[i].Id === postContent.Id) {
                                scope.post.Contents[i] = postContent;
                                found = true;
                                break;
                            }
                        }

                        if(!found)
                            scope.post.Contents.push(postContent);

                        $timeout(function() {
                            navigationService.scrollToPostContent(postContent.Id);
                        }, 0);
                    }
                };

                postService.updatePostCallback = function(post, postContent) {
                    if(post && scope.post.Id !== post.Id) {
                        return;
                    }

                    scope.addPostContent(postContent);
                };



                if(scope.post.PostType === 'LiveEvent') {
                    scope.canShowLiveEventEdit = accountService.isLoggedIn() && scope.post.AccountId === accountService.account.Id;
                    scope.liveEventUpdateOptions = {
                        onSubmit: function(postContent) {
                            scope.setShowLiveEventEdit(false);
                            scope.addPostContent(postContent);
                        },
                        onCancel: function() {
                            scope.setShowLiveEventEdit(false);
                            $timeout(function() {
                                navigationService.scrollToPostContent(scope.post.Contents[0].Id);
                            });
                        }
                    };
                }


                metaService.setTitle(communityService.community.Name + ' - ' + scope.post.Title);
                metaService.setDescription(scope.post.Question ? scope.post.Question : scope.post.Description ? scope.post.Description : scope.post.Title);

                $timeout(function() {
                    metaService.prerenderReady();
                });
            }
        };
    }])
    .directive('postContent', ['navigationService', 'accountService', 'postService', 'commService', '$timeout', '$location', 'communityService', 'mediaService', 'marketingService', 'postDirectiveService', 'modalService', function (navigationService, accountService, postService, commService, $timeout, $location, communityService, mediaService, marketingService, postDirectiveService, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="clearfix">' +
                    '<a id="postContent{{postContent.Id}}"></a>' +
                    '<div class="post-submitted-by-text" ng-if="index !== 0">' +
                        '<profile-name votable="postContent"></profile-name> {{post.CreationDate | dateRobust:\'medium\'}}<span ng-show="postContent.IsEdited"> *Edited</span>' +
                    '</div>' +
                    //'<div class="post-content-container" ng-style="{\'margin-bottom\': isCollapsed ? \'20px\' : \'0px\'}" emotion-color="postContent.Statistics.EmotionStatistics.EmotionType">' +
                    '<div class="post-content-container" ng-style="{\'margin-bottom\': isCollapsed ? \'20px\' : \'0px\'}">' +

                        '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                        '<pin-link ng-hide="hidePin" post="post" pinned-item="post.PinnedItem" ng-class="{\'has-more-options\': moreOptions}"></pin-link>' +

                        '<div class="post-content-content">' +
                            '<div ng-if="postContent.PostType===\'LiveEvent\'" ng-click="toggleCollapsed()" class="post-content-collapse-icon">{{collapseString}}</div>' +

                            '<div ng-if="postContent.PostContentType===\'Link\'">' +
                                '<post-content-link-content link="postContent.CurrentVersion.Link" markdown-options="markdownOptions"></post-content-link-content>' +
                            '</div>' +

                            /* The Question will be displayed in the Poll directive */
                            '<poll ng-if="postContent.CurrentVersion.Poll" post="post" post-content="postContent" index="index"></poll>' +

                            '<div ng-if="postContent.PostContentType===\'Question\'">' +
                                '<post-content-question-content question="postContent.CurrentVersion.Question"></post-content-question-content>' +
                            '</div>' +

                            '<form ng-if="formOptions.showEdit && hasWriteAccess" ng-submit="submitEdit()" class="clearfix" style="margin-bottom: 10px;">' +
                                '<div ng-show="formOptions.processingEdit"><loading></loading> Submitting Edit...</div>' +
                                '<div ng-show="!formOptions.processingEdit">' +
                                    '<content-editor options="contentEditorOptions" show-toolbar="true" text-area-height="110" text="formOptions.formattedText"></content-editor>' +
                                    '<div style="clear:both;">' +
                                    '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save</button></div>' +
                                    '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancelEdit()" style="margin-top: 10px;">Cancel</button></div>' +
                                '</div>' +
                                '</div>' +
                            '</form>' +

                        '</div>' +
                        '<div ng-if="!formOptions.showEdit" ng-show="!formOptions.showDelete">' +

                            '<div class="post-content-content" btf-markdown="formOptions.formattedText" markdown-options="markdownOptions"></div>' +

                            '<div ng-if="!isLoggedIn" style="padding-top: 10px; margin-left: 20px;" class="pull-left">' +
                                '<social-login-buttons-vertical></social-login-buttons-vertical>' +
                                '<button style="margin-bottom: 10px;" class="btn btn-primary" ng-click="goToCommunity()">See More Posts</button>' +
                            '</div>' +

                            '<div class="post-content-control-area clearfix clear-both">' +
                                '<div ng-class="{\'col-sm-6\': showTagArea && !mediaService.isPhone}" style="padding-left: 15px;">' +
                                    '<div>' +
                                        '<div class="col-sm-12"><interaction-summary votable="postContent"></interaction-summary></div>' +
                                        '<div ng-if="mediaService.isPhone && postContent.Tags && postContent.Tags.length > 0">' +
                                            '<comment-picture-tags tags="postContent.Tags"></comment-picture-tags>' +
                                        '</div>' +


                                        '<div class="toolbar-container pull-left col-sm-6">' +
                                            '<div class="toolbar-item">' +
                                                '<emotion-vote-mechanism class="toolbar-emotion-vote-mechanism" post-content="postContent" post="post" emotion="postContent.RequesterEmotion"></emotion-vote-mechanism>' +
                                            '</div>' +
                                            '<div ng-show="hasWriteAccess" class="toolbar-item">' +
                                                '<button class="btn large-toolbar-button toolbar-button-hoverable" ng-click="reply()"><i class="icon ion-chatbox"></i></button>' +
                                            '</div>' +
                                            '<div ng-show="hasWriteAccess" class="toolbar-item">' +
                                                '<share-link class="large-toolbar-button" post="post" permalink="postUrl"></share-link>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="clearfix"></div>' +
                                    '</div>' +
                                '</div>' +

                                '<div class="post-content-tag-area col-sm-6" ng-if="showTagArea && !mediaService.isPhone" ng-mouseover="tagHover = true" ng-mouseleave="tagHover = false">' +
                                    '<votable-tags-area tags="postContent.Tags"></votable-tags-area>' +
                                    '<h5 ng-show="tagHover" style="font-weight: bold; padding-top: 5px;">Post Tags</h5>' +
                                    '<div ng-show="tagHover" style="margin-bottom: 10px;">Vote on which tags are most appropriate for this post.</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +


                        '<div ng-show="formOptions.processingDelete"><loading></loading> Deleting...</div>' +
                        '<div class="clearfix"></div>' +

                    '</div>' +

                    /*
                    // Don't show the tag area if the post content is a poll and we have not voted on it
                    // i.e. only show the tag area if it's not a poll or if we have voted in the poll.
                    '<div class="post-content-well" ng-if="postContent.Tags && postContent.Tags.length > 0 && (!isLoggedIn || !postContent.CurrentVersion.Poll || postContent.CurrentVersion.Poll.SelectedPollOption)">' +
                        '<h5 style="font-weight: bold;">Post Tags</h5>' +
                        '<div style="margin-bottom: 10px;">Vote on which tags are most appropriate for this post.</div>' +
                        '<votable-tags-area tags="postContent.Tags"></votable-tags-area>' +
                    '</div>' +
                    */


                    '<div ng-show="!isCollapsed" class="col-xs-12 comment-layer">' +
                        '<comment-input ng-if="commentInputOptions" options="commentInputOptions"></comment-input>' +
                        '<a id="{{commentsAnchorId}}"></a>' +
                        '<div infinite-scroll="getMoreItems()" infinite-scroll-disabled="scrollingDone" infinite-scroll-distance="1">' +
                            '<div ng-repeat="comment in comments">' +
                                // Only show the comment if it's not trashed OR (if it is trashed and) it has child comments
                                '<comment-entry ng-if="!childComment.IsTrashed || (childComment.Comments && childComment.Comments.length > 0)" comment="comment" options="commentOptions"></comment-entry>' +
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
                scope.mediaService = mediaService;

                postDirectiveService.initializePostContentScope(scope);

                scope.report = function() {

                };

                scope.submitEdit = function() {
                    // Did we make any change?
                    if(scope.formOptions.formattedText === scope.formattedTextBeforeEdit) {
                        // No change, we're done
                        scope.cancelEdit();
                        return;
                    }
                    scope.postContent.CurrentVersion.FormattedText = scope.formOptions.formattedText;

                    scope.formOptions.processingEdit = true;
                    // Submit comment edit to service
                    postService.editPostContent(scope.postContent, scope.post.Id, function(data) {
                        // Success
                        scope.formOptions.processingEdit = false;
                        scope.postContent = data.PostContent;
                        scope.formOptions.formattedText = scope.postContent.CurrentVersion.FormattedText;

                        scope.post.IsEdited = true;
                        scope.formOptions.showEdit = false;
                        scope.scrollToPostContent();
                        commService.showSuccessAlert('Post edited successfully!');
                    }, function(data) {
                        // Failure
                        scope.formOptions.processingEdit = false;
                        commService.showErrorAlert(data);
                    });
                };


                scope.delete = function() {
                    scope.formOptions.processingDelete = true;
                    postService.deletePost(scope.post, function(data) {
                        // Success
                        scope.formOptions.processingDelete = false;
                        navigationService.goToCommunity(communityService.community.Url);
                        commService.showSuccessAlert('Post deleted successfully!');
                    }, function(data) {
                        // Failure
                        scope.formOptions.processingDelete = false;
                        commService.showErrorAlert(data);
                    });
                };


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


                scope.showTagArea = scope.postContent.Tags && scope.postContent.Tags.length > 0 && (!scope.isLoggedIn || !scope.postContent.CurrentVersion.Poll || scope.postContent.CurrentVersion.Poll.SelectedPollOption);


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
                    }
                    else {
                        $timeout(function() {
                            scope.processingComments = false;
                        });
                    }
                };
                scope.getMoreItems();


                scope.moreOptions = {
                    title: 'Post Options',
                    buttons: []
                };


                if((scope.isAccountPost && scope.hasWriteAccess) || scope.isModerator) {
                    scope.moreOptions.buttons.push({
                        text: 'Edit Post',
                        onClick: function() {
                            scope.edit();
                        }
                    });

                    if(scope.isModerator) {
                        scope.moreOptions.deleteButton = {
                            onClick: function() {
                                modalService.confirmDelete('Delete Forever?', 'Are you sure you want to delete this Post forever?', function(result) {
                                    if(result) {
                                        scope.delete();
                                    }
                                    else {
                                    }
                                });
                            },
                            text: 'Delete Post'
                        };
                    }
                }

                scope.moreOptions.buttons.push({
                    text: 'Report',
                    onClick: function() {
                        scope.report();
                    }
                });
            }
        };
    }])
    .directive('postTypePicture', ['tagService', 'communityService', 'accountService', function (tagService, communityService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="post-type-picture-container">' +
                    '<div class="post-type-picture centered">' +
                        '<i ng-show="post.PostType===\'Question\'" class="post-type-picture-icon fa fa-question"></i>' +
                        '<i ng-show="post.PostType===\'Poll\'" class="post-type-picture-icon fa fa-align-left"></i>' +
                        '<i ng-show="post.PostType===\'Text\'" class="post-type-picture-icon fa fa-font"></i>' +
                        '<i ng-show="post.PostType===\'Link\'" class="post-type-picture-icon fa fa-link"></i>' +
                        '<i ng-show="post.PostType===\'LiveEvent\'" class="post-type-picture-icon fa fa-bullhorn"></i>' +
                    '</div>' +
                '</div>',
            scope: {
                post: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }]);