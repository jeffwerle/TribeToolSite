angular.module('app.Directives')
    .directive('tagStrip', ['communityService', 'tagPageService','commService', function (communityService, tagPageService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="overflow: hidden;" ng-style="{\'height\': tagPages.length > 0 ? 50 : 0}">' +
                        '<span ng-repeat="tagPage in tagPages">' +
                            '<tag-picture style="margin-right: 5px;" tag-page="tagPage"></tag-picture>' +
                        '</span>' +
                    '</div>' +
                '</div>',
            scope: {
                tagNames: '=?'
            },
            link: function (scope, element, attrs) {
                if(!tagPageService.tagPages || tagPageService.tagPages.length <= 0) {
                    scope.$on('tagPagesChanged', function(event, tagPages) {
                        scope.updateTags();
                    });
                }

                scope.$watch('tagNames', function(newValue){
                    scope.updateTags();
                });

                scope.updateTags = function() {
                    scope.tagPages = [];
                    var maxTags = 10;
                    var i = 0, tagPage = null;
                    if(tagPageService.tagPages && tagPageService.tagPages.length > 0) {
                        if(angular.isDefined(scope.tagNames)) {
                            for(i = 0; i < scope.tagNames.length && i < maxTags; i++) {
                                var tagName = scope.tagNames[i];
                                if(!tagName) {
                                    continue;
                                }
                                for(var j = 0; j < tagPageService.tagPages.length; j++) {
                                    tagPage = tagPageService.tagPages[j];
                                    if(tagPage.MainImage && !tagPage.Redirect) {
                                        if(tagPage.Tag.toLowerCase() === tagName.replace(/ /g, '').toLowerCase())
                                            scope.tagPages.push(tagPage);
                                    }
                                }
                            }
                        }
                        else {
                            // Get pictures from random tag pages
                            var shuffledTagPages = commService.shuffle(tagPageService.tagPages);
                            for(i = 0; i < shuffledTagPages.length && i < maxTags; i++) {
                                tagPage = shuffledTagPages[i];
                                if(tagPage.MainImage && !tagPage.Redirect) {
                                    scope.tagPages.push(tagPage);
                                }
                            }
                        }

                    }
                };
                scope.updateTags();

            }
        };
    }])
    .directive('tag', ['communityService', function (communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a ng-href="/wiki/{{communityUrl}}/{{tag}}" target="{{target}}">#{{text}}</a>',
            scope: {
                /* If not provided, tag will be used */
                text: '=?',
                tag: '=',
                /* If provided and set to true, the tag will open in a new tab when clicked */
                newTab: '=?'
            },
            link: function (scope, element, attrs) {
                scope.originalText = scope.text;
                var updateText = function() {
                    if(!scope.originalText) {
                        scope.text = scope.tag;
                    }
                };
                scope.$watch('tag', function() {
                    updateText();
                });
                scope.communityUrl = communityService.community.Url;
                scope.target = scope.newTab ? '_blank' : '';
            }
        };
    }])
    .directive('votableTag', ['tagService', function (tagService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="tag.MainImage">' +
                        '<div>' +
                            '<tag-picture class="pull-right" style="margin-left: 5px;" ng-if="hasImage" tag="tag"></tag-picture>' +
                            '<vote-mechanism class="pull-right" allow-down-vote="true" tag="tag" vote-type="tag.VoteType"></vote-mechanism>' +

                        '</div>' +

                        '<div style="clear:both; margin-left:28px;">' +
                            '<span style="vertical-align: middle; display:inline-block;"><tag tag="tag.FinalTag" text="tag.Tag"></tag></span>' +
                        '</div>' +
                    '</div>' +

                    '<div ng-if="!tag.MainImage" style="height: 60px;">' +

                        '<div class="pull-right">' +
                            '<vote-mechanism allow-down-vote="true" tag="tag" vote-type="tag.VoteType"></vote-mechanism>' +
                        '</div>' +
                        '<div style="clear:both;">' +
                            '<span style="vertical-align: middle; display:inline-block;"><tag tag="tag.FinalTag" text="tag.Tag"></tag></span>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                tag: '='
            },
            link: function (scope, element, attrs) {
                scope.hasImage = tagService.hasImage(scope.tag);
            }
        };
    }])
    .directive('votableTagsArea', ['homeService', 'tagService', function (homeService, tagService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="tags && tags.length > 0">' +
                    '<div style="clear:both;">' +
                        '<div class="row" ng-repeat="row in rows">' +
                            '<div class="col-xs-4 text-right" ng-repeat="tag in row">' +
                                '<votable-tag tag="tag"></votable-tag>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                tags: '='
            },
            link: function (scope, element, attrs) {

                // Put the tags with images on top
                scope.tags = tagService.prioritizeImages(scope.tags);

                // Let's put them in rows!
                if(scope.tags)
                    scope.rows = homeService.columnizeList(scope.tags, 3);
            }
        };
    }])
    .directive('commentPictureTags', ['tagService', 'mediaService', function (tagService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>' +

                        //ng-style="{\'right\': ($index * 60) + 15}"
                        // style="position: absolute; bottom: 20px;"
                        '<span   ng-repeat="tag in tags">' +
                            '<tag-picture tag="tag"></tag-picture>' +
                        '</span>' +
                    '</div>' +

                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                tags: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;

                // Show a max of 3 tags
                var max = 3;
                var tagsWithImages = [];
                var i = 0;
                for(i = 0; i < scope.tags.length; i++) {
                    if(tagService.hasImage(scope.tags[i])) {
                        var tag = scope.tags[i];
                        tagsWithImages.push(tag);
                    }
                    if(tagsWithImages.length >= max) {
                        break;
                    }
                }


                // Put the tags with images on top
                scope.tags = tagsWithImages;
            }
        };
    }])
    /* The comment picture of either a TagEntry or TagPageEntry */
    .directive('tagPicture', ['tagService', 'communityService', 'modalService', function (tagService, communityService, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a class="tag-picture-container" ng-href="{{href}}" ng-click="pictureClicked()"><img class="tag-picture" ng-src="{{tagPictureUrl | trusted}}"></a>',
            scope: {
                /* TagEntry */
                tag: '=?',
                tagPage: '=?',

                /* {
                    onClick(),
                    constructUrl(tag, tagPage) // optional
                 * } */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.communityUrl = communityService.community.Url;

                scope.tagText = scope.tag ? scope.tag.FinalTag : scope.tagPage.Tag;
                scope.tagPictureUrl = tagService.getTagImageUrl(scope.tag ? scope.tag : scope.tagPage);

                scope.href = scope.options && scope.options.constructUrl ? scope.options.constructUrl(scope.tag, scope.tagPage) : 'wiki/' + scope.communityUrl + '/' + scope.tagText;

                scope.pictureClicked = function() {
                    modalService.closeAll();
                    if(scope.options && scope.options.onClick) {
                        scope.options.onClick();
                    }
                };
            }
        };
    }])
    .directive('tagPictureArea', ['tagService', function (tagService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<span ng-repeat="tag in approvedTags">' +
                        '<tag-picture tag="tag" options="options"></tag-picture>' +
                    '</span>' +
                '</div>',
            scope: {
                /* array of TagEntry */
                tags: '=',
                /* {
                 onClick()
                 * } */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                var maxTags = 3;
                scope.approvedTags = [];

                var tagsWithImages = [];
                for(var i = 0; i < scope.tags.length; i++) {
                    if(tagService.hasImage(scope.tags[i]) && scope.tags[i].TagVoteRating > 0) {
                        tagsWithImages.push(scope.tags[i]);
                    }
                }

                if(tagsWithImages.length > maxTags) {
                    // Sort decsending by TagVoteRating
                    tagsWithImages.sort(function(a,b) {
                        if(a.TagVoteRating > b.TagVoteRating){
                            return -1;
                        }else if(a.TagVoteRating < b.TagVoteRating){
                            return 1;
                        }
                        return 0;
                    });
                }

                scope.approvedTags = tagsWithImages;

                // Only use a maxTags amount
                scope.approvedTags = scope.approvedTags.splice(0, maxTags);
            }
        };
    }])
    .directive('tagImageSearcher', ['tagService', 'communityService', 'googleService', '$timeout', function (tagService, communityService, googleService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +

                    '<div ng-if="isReady">' +
                        '<div infinite-scroll="getMoreItems()" infinite-scroll-disabled="processing || searchComplete">' +
                            '<div ng-repeat="image in images track by $index" class="centered">' +
                                '<div style="font-weight: bold;">{{image.titleNoFormatting}}</div>' +
                                '<img ng-src="{{image.url}}" show-light-box interactive-image fit-image-width-to-parent class="pointer centered light-boxable-image" style="margin-bottom: 20px;" />' +
                            '</div>' +
                        '</div>' +
                        '<div ng-show="processing"><loading></loading> Retrieving Images...</div>' +
                    '</div>' +
                '</div>',
            scope: {
                /* tag (string) */
                tag: '=?'
            },
            link: function (scope, element, attrs) {
                scope.googleService = googleService;
                scope.isReady = googleService.isReady;

                if(!scope.isReady) {
                    googleService.readyCallbacks.push(function() {
                        // google service ready
                        scope.isReady = true;
                        scope.$apply(function() {
                            // Trigger refreshing of infinite scroller if applicable
                            scope.processing = true;
                            $timeout(function() {
                                scope.processing = false;
                            });
                        });
                    });
                }

                scope.images = [];
                scope.searchComplete = false;

                scope.getMoreItems = function() {
                    if(scope.searchComplete || scope.processing) {
                        return;
                    }

                    scope.processing = true;
                    googleService.search(scope.tag + ' ' + communityService.community.Options.ImageSearchTopic,
                        function(results) {
                            // Success

                            scope.$apply(function() {
                                scope.images = scope.images.concat(results);
                                $timeout(function() {
                                    scope.processing = false;
                                });
                            });


                        },
                    function() {
                        // search done
                        scope.searchComplete = true;
                        scope.processing = false;
                    });
                };
            }
        };
    }])

    .directive('tagStream', ['$rootScope', 'communityService', 'accountService', 'navigationService', 'marketingService', 'commService', 'tagPageService', 'commentService', '$timeout', function ($rootScope, communityService, accountService, navigationService, marketingService, commService, tagPageService, commentService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div id="streamContainer" style="margin-right: 10px;" infinite-scroll="getMoreItems()" infinite-scroll-disabled="options.scrollingDone || processing" infinite-scroll-distance="2">' +
                        '<div ng-repeat="streamItem in options.streamItems">' +
                            '<div>' +
                                '<div ng-if="streamItem.ItemType === \'Status\'">' +
                                    '<status-entry status="streamItem.Status"></status-entry>' +
                                '</div>' +
                                '<div ng-if="streamItem.ItemType === \'Post\'">' +
                                    '<community-post-summary post="streamItem.Post"></community-post-summary>' +
                                '</div>' +
                                '<div ng-if="streamItem.ItemType === \'Comment\'">' +
                                    '<comment-entry comment="streamItem.Comment" options="streamItem.Comment.commentOptions"></comment-entry>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div ng-show="processing"><loading></loading> Retrieving Stream...</div>' +
                '</div>',
            scope: {
                tag: '=',
                /*
                 scrollingDone: bool // this will be populated by this directive
                 streamItems: [] // This will be populated by this directive
                 */
                options: '='
            },
            link: function (scope, element, attrs) {
                if(!scope.options) {
                    scope.options = { };
                }


                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.options.scrollingDone = false;
                scope.serviceRetrievalDone = scope.options.scrollingDone;
                scope.streamCache = [];
                scope.options.streamItems = [];
                var countToLoadFromCache = 3;



                scope.getMoreItems = function() {
                    if(scope.processing || scope.options.scrollingDone || !accountService.account) {
                        return;
                    }

                    var pullFromCache = function() {
                        // Retrieve the items from the cache
                        var cacheLength = scope.streamCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.options.streamItems.push(scope.streamCache.shift());
                        }
                        if(scope.streamCache.length <= 0 && scope.serviceRetrievalDone) {
                            scope.options.scrollingDone = true;
                            $rootScope.$broadcast('scroll.infiniteScrollDisable');
                        }
                        $rootScope.$broadcast('scroll.infiniteScrollComplete');
                    };

                    if(scope.streamCache.length < countToLoadFromCache && !scope.serviceRetrievalDone) {
                        scope.processing = true;
                        tagPageService.getTagPageStream(scope.pageNumber,
                            scope.countPerPage,
                            scope.tag,
                            function(data) {
                                // Success
                                if(data.StreamItems && data.StreamItems.length > 0)
                                {
                                    for(var i = 0; i < data.StreamItems.length; i++) {
                                        var streamItem = data.StreamItems[i];
                                        if(streamItem.ItemType === 'Comment') {
                                            streamItem.Comment.commentOptions = commentService.getCommentOptions(streamItem.Comment);
                                        }
                                    }
                                    scope.streamCache = scope.streamCache.concat(data.StreamItems);
                                }

                                scope.serviceRetrievalDone = !data.StreamItems || data.StreamItems.length < scope.countPerPage;
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

                scope.$on('scroll.infiniteScrollBegin', function(e, d) {
                    // Are we on the wiki page? We only want to intercept infinite scrolling if we're
                    // indeed on the wiki page
                    if(communityService.isOnWikiPage()) {
                        scope.getMoreItems();
                    }
                });
            }
        };
    }]);