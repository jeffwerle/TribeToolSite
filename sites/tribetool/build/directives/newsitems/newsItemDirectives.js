angular.module('app.Directives')
    .directive('newsItems', ['commService', 'accountService', 'communityService', 'newsItemService', 'uiService', '$timeout', function(commService, accountService, communityService, newsItemService, uiService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isReady" ng-show="!processing && (newsItems && newsItems.length > 0)">' +
                        '<perfect-scrollbar id="newsItemsPerfectScrollbar" class="scroller" style="height: 200px;" suppress-scroll-x="true">' +
                            '<div id="newsItemsContainer" infinite-scroll-container="perfectScrollbarElement" infinite-scroll="getMoreNewsItems()" infinite-scroll-disabled="scrollingDone || processing">' +
                                '<div ng-repeat="newsItem in newsItems">' +
                                    '<news-item news-item="newsItem" is-editing="form.isEditing"></news-item>' +
                                '</div>' +
                            '</div>' +
                        '</perfect-scrollbar>' +
                    '</div>' +
                    '<div ng-show="processing">' +
                        '<loading></loading> Retrieving News Items...' +
                    '</div>' +

                    '<div ng-if="isModerator">' +
                        '<div ng-show="processingCreation">' +
                            '<loading></loading> Submitting News Item...' +
                        '</div>' +
                        '<div ng-show="!processingCreation" style="margin-top: 20px;">' +
                            '<a ng-show="!form.isEditing" ng-click="beginEditing()" class="action-link" style="margin-right: 10px;">Edit News Items</a> <a style="margin-right: 10px;" ng-show="form.isEditing" ng-click="cancelEditing()" class="action-link">Cancel Edit News Items</a>' +
                            '<div ng-show="form.isEditing">' +
                                '<content-editor id="{{form.contentEditorId}}" options="formattingHelperOptions" text="form.FormattedText" placeholder="\'News Item Text...\'"></content-editor>' +
                                '<button class="btn btn-primary" ng-click="addNewsItem()">Create News Item</button>' +
                            '</div>' +
                        '</div>' +



                    '</div>' +
                '</div>',
            scope: {

            },
            link: function (scope, element, attrs) {

                scope.form = {
                    isEditing: false,
                    formattingHelperOptions: {
                        markdownOptions: {
                            infobox: false
                        },
                        onFocus: function() {
                        },
                        onToolbarClicked: function() {
                        },
                        autofocus: false
                    }
                };
                scope.isModerator = communityService.isModerator();

                scope.form.contentEditorId = uiService.getGuid();

                // Get the news items
                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.scrollingDone = false;
                scope.newsItems = [];

                scope.resetScrollbarHeight = function() {
                    if(!scope.perfectScrollbar) {
                        scope.perfectScrollbar = element.find('#newsItemsPerfectScrollbar');
                    }
                    if(!scope.perfectScrollbar) {
                        return;
                    }

                    var maxHeight = 600;
                    var height = (scope.newsItems.length * 125);
                    if(height > maxHeight)
                        height = maxHeight;
                    if(scope.perfectScrollbar.height() !== height)
                        scope.perfectScrollbar.height(height);
                };

                scope.getMoreNewsItems = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    scope.processing = true;
                    newsItemService.getNewsItems(scope.pageNumber,
                        scope.countPerPage,
                        function(data) {
                            // Success

                            if(data.NewsItems && data.NewsItems.length > 0)
                                scope.newsItems = scope.newsItems.concat(data.NewsItems);

                            scope.scrollingDone = !data.NewsItems || data.NewsItems.length < scope.countPerPage;

                            scope.resetScrollbarHeight();
                            $timeout(function() {
                                scope.processing = false;
                            });

                            scope.pageNumber++;
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        });
                };
                scope.getMoreNewsItems();

                scope.beginEditing = function() {
                    scope.form.isEditing = true;
                };
                scope.cancelEditing = function() {
                    scope.form.isEditing = false;
                };

                scope.addNewsItem = function() {
                    scope.processingCreation = true;
                    newsItemService.createNewsItem({
                        FormattedText: scope.form.FormattedText
                        }, function(data) {
                            // Success

                            scope.processingCreation = false;
                            scope.newsItems.push(data.NewsItem);

                            commService.showSuccessAlert('News Item added successfully!');

                            scope.form.FormattedText = '';
                        }, function(data) {
                            // Failure
                            scope.processingCreation = false;
                            commService.showErrorAlert(data);
                        });
                };


                $timeout(function() {
                    scope.isReady = true;
                });
            }
        };
    }])
    .directive('newsItem', ['commService', 'accountService', 'communityService', 'newsItemService', 'tagService', function(commService, accountService, communityService, newsItemService, tagService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="news-item" style="padding-left: 5px; margin-bottom: 10px; clear: both;" ng-show="!newsItem.Discarded" emotion-color="newsItem.Statistics.EmotionStatistics.EmotionType">' +

                        '<div class="news-item-tag-picture-container" ng-if="tag">' +
                            '<tag-picture tag="tag"></tag-picture>' +
                            '<div>' +
                                '<emotion-vote-mechanism news-item="newsItem" emotion="newsItem.RequesterEmotion" disable-interaction="disableInteraction"></emotion-vote-mechanism>' +
                            '</div>' +
                        '</div>' +

                        '<div class="post-submitted-by-text" ng-show="newsItem.Statistics.EmotionStatistics.TotalEmotionCount"><interaction-summary votable="newsItem" hide-comment-count="true"></interaction-summary></div>' +
                        '<div ng-show="!showEdit" btf-markdown="newsItem.FormattedText"></div>' +

                        '<div ng-show="!showEdit" style="padding-top:5px; clear:both;">' +


                        '</div>' +
                        '<div class="clearfix"></div>' +



                        '<div ng-if="isEditing && isModerator && !showEdit && !showDelete">' +
                            '<a ng-click="edit()" class="action-link-grey" style="margin-right: 10px;">Edit</a> <a ng-click="delete()" class="action-link-grey">Delete</a>' +
                        '</div>' +

                        '<form ng-if="showEdit" ng-submit="submitEdit()">' +
                            '<div ng-show="processingEdit"><loading></loading> Submitting Edit...</div>' +
                            '<div ng-show="!processingEdit">' +
                                '<content-editor options="contentEditorOptions" text="$parent.newsItem.FormattedText" placeholder="\'Write a News Item...\'"></content-editor>' +
                                '<div style="clear:both;">' +
                                '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save</button></div>' +
                                '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancelEdit()" style="margin-top: 10px;">Cancel</button></div>' +
                            '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div ng-if="showDelete">' +
                            '<div ng-show="processingDelete"><loading></loading> Discarding...</div>' +
                            '<div  ng-show="!processingDelete">' +
                                '<div style="font-weight: bold; color: red; margin-top: 20px;">Are you sure you want to discard this News Item (it will be archived but will no longer be shown in the community)?</div>' +
                                '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancelDelete()" style="margin-top: 10px; margin-right: 10px;">Cancel</button></div>' +
                                '<div class="pull-left"><button class="btn btn-danger" type="button" ng-click="submitDiscard()" style="margin-top: 10px;">Discard</button></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                newsItem: '=',
                isEditing: '=',
                disableInteraction: '=?'
            },
            link: function (scope, element, attrs) {
                scope.isModerator = communityService.isModerator();

                // Get the first tag with a picture
                if(scope.newsItem.Tags && scope.newsItem.Tags.length > 0) {
                    var tags = tagService.prioritizeImages(scope.newsItem.Tags);
                    if(tagService.hasImage(tags[0])) {
                        scope.tag = tags[0];
                    }
                }


                scope.contentEditorOptions = {
                    markdownOptions: {
                        infobox: false
                    },
                    autofocus: false
                };

                scope.edit = function() {
                    scope.showEdit = true;
                };

                scope.delete = function() {
                    scope.showDelete = true;
                };

                scope.cancelEdit = function() {
                    scope.showEdit = false;
                };

                scope.cancelDelete = function() {
                    scope.showDelete = false;
                };


                scope.submitEdit = function() {
                    scope.processingEdit = true;
                    newsItemService.editNewsItem(scope.newsItem, function(data) {
                        // Success
                        scope.processingEdit = false;
                        scope.cancelEdit();
                        commService.showSuccessAlert('News Item Edited successfully!');
                    }, function(data) {
                        // Failure
                        scope.processingEdit = false;
                        commService.showErrorAlert(data);
                    });
                };

                scope.submitDiscard = function() {
                    scope.processingDelete = true;
                    newsItemService.discardNewsItem(scope.newsItem, function(data) {
                        // Success
                        scope.processingDelete = false;
                        scope.cancelDelete();
                        commService.showSuccessAlert('News Item discarded successfully!');
                        scope.newsItem.Discarded = true;
                    }, function(data) {
                        // Failure
                        scope.processingDelete = false;
                        commService.showErrorAlert(data);
                    });
                };
            }
        };
    }]);