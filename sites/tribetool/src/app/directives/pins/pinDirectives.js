angular.module('app.Directives')
    .directive('pinnedItem', ['commService', 'pinService', 'communityService', 'profileService', 'navigationService', 'accountService', '$timeout', function (commService, pinService, communityService, profileService, navigationService, accountService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Unpinning...</div>' +

                    // We use ng-if="isReady" to make the loading of the status feel snappier (we'll load on the
                    // next digest).
                    '<div ng-if="isReady" ng-show="pinnedItem && !processing">' +
                        '<a ng-class="{\'action-link\': pinnable}" ng-click="setUnpinning(false)" ng-show="unpinning" style="margin-right: 20px;">Cancel</a> <a class="action-link" ng-click="thumbTackClicked()"><span ng-show="!unpinning" style="color: green;"><i class="fa fa-thumb-tack"></i> Pinned</span><span ng-show="unpinning" style="color: red;">Unpin</span></a> <span ng-show="!unpinning" class="pin-creation-date">on {{pinnedItem.CreationDate | dateRobust:\'medium\'}}</span> <share-link ng-show="hasWriteAccess" style="margin-left: 10px;" ng-show="!unpinning" formatted-text="permalink"></share-link>' +
                        '<community-post-summary ng-if="pinnedItem.Type === \'Post\'" hide-pin="true" post="pinnedItem.Post"></community-post-summary>' +
                        '<comment-entry ng-if="pinnedItem.Type === \'Comment\'" use-comment-well="true" hide-pin="true" style="margin-top: 10px;" options="commentOptions" comment="pinnedItem.Comment"></comment-entry>' +
                        '<status-entry ng-if="pinnedItem.Type === \'Status\'" hide-pin="true" status="pinnedItem.Status"></status-entry>' +
                        '<div class="pin-well" ng-if="pinnedItem.Type === \'Video\' || pinnedItem.Type === \'Image\' || pinnedItem.Type === \'Other\'">' +
                            '<div btf-markdown="pinnedItem.FormattedText" markdown-options="markdownOptions">' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                pinnedItem: '='
            },
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.permalink = commService.getDomain() + navigationService.getPinnedItemUrl(scope.pinnedItem, profileService.currentProfile, communityService.community);
                scope.unpinning = false;

                scope.pinnable = accountService.isLoggedIn() && accountService.account.Id === scope.pinnedItem.AccountId;

                scope.setUnpinning = function(unpinning) {
                    if(!scope.pinnable) {
                        return;
                    }
                    scope.unpinning = unpinning;
                };

                scope.thumbTackClicked = function() {
                    if(!scope.pinnable) {
                        return;
                    }

                    if(!scope.unpinning) {
                        scope.unpinning = true;
                    }
                    else {
                        // Unpin!
                        scope.processing = true;
                        pinService.unpinItem({
                            Id: scope.pinnedItem.Id
                        }, function(data) {

                            // Success
                            scope.pinnedItem = null;
                            scope.processing = false;
                        }, function(data) {
                            // Failure
                            commService.showErrorAlert(data);
                            scope.processing = false;
                        });
                    }
                };
                if(scope.pinnedItem.Post) {
                    scope.pinnedItem.Post.PinnedItem = scope.pinnedItem;
                }
                if(scope.pinnedItem.Status) {
                    scope.pinnedItem.Status.PinnedItem = scope.pinnedItem;
                }
                if(scope.pinnedItem.Comment) {
                    scope.pinnedItem.Comment.PinnedItem = scope.pinnedItem;
                }
                if(scope.pinnedItem.ImageFileEntry) {
                    scope.pinnedItem.ImageFileEntry.PinnedItem = scope.pinnedItem;
                }


                if(scope.pinnedItem.Comment) {
                    scope.commentOptions = {
                        status: scope.pinnedItem.Status,
                        post: scope.pinnedItem.Post,
                        imageFileEntry: scope.pinnedItem.ImageFileEntry,
                        tagPage: scope.pinnedItem.Comment.TagPage ? scope.pinnedItem.Comment.TagPage : scope.pinnedItem.ImageFileEntry ? scope.pinnedItem.ImageFileEntry.TagPage : null
                    };
                }

                if(scope.pinnedItem.Type === 'Image') {
                    if(scope.pinnedItem.FormattedText.indexOf('||') !== 0) {
                        scope.pinnedItem.FormattedText = '||' + scope.pinnedItem.FormattedText + '||';
                    }
                }

                scope.markdownOptions = {
                    imageStyling: {
                        hidePin: true
                    },
                    videoStyling: {
                        hidePin: true
                    },
                    infobox: false
                };


                $timeout(function() {
                    scope.isReady = true;
                });

            }
        };
    }])
    .directive('pinLinkInline', ['pinDirectiveService',  function (pinDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span>' +
                    '<button type="button" class="btn toolbar-button toolbar-button-hoverable" ng-show="!processing && !pinnedItem" ng-click="pinClicked()"><i class="fa fa-thumb-tack"></i></button>' +
                    '<span ng-show="!processing && pinnedItem">' +
                        '<button type="button" class="btn btn-success toolbar-button pin-icon-button-pinned" ng-show="!unpinning" ng-click="unpinning=true"><i class="fa fa-check"></i> <i class="fa fa-thumb-tack"></i></button>' +
                        //'<a ng-show="!unpinning" ng-click="unpinning=true" class="action-link pointer"><span style="color: green;"><i class="fa fa-check"></i> Pinned</span></a>' +
                        '<a ng-show="unpinning" ng-click="goToPinnedItem()" style="margin-right: 10px;" class="action-link pointer">Go To Pin</a>' +
                        '<a ng-show="unpinning" ng-click="unpin()" class="action-link pointer"><span style="color: red;"><i class="fa fa-times"></i> Unpin</span></a>' +
                    '</span>' +
                    '<span ng-show="processing"><loading></loading> {{unpinning ? \'Unpinning...\' : \'Pinning...\'}}</span>' +
                '</span>',
            scope: {
                pinnedItem: '=',
                post: '=?',
                status: '=?',
                comment: '=?',
                imageFileEntry: '=?',
                formattedText: '=?',
                /* The PinnedItemType, if applicable */
                type:'=?'
            },
            link: function (scope, element, attrs) {
                pinDirectiveService.initializePinLinkScope(scope);
            }
        };
    }])
    .directive('pinLink', ['pinDirectiveService',  function (pinDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span class="pin-icon-container">' +
                    //'<button class="btn toolbar-button toolbar-button-hoverable" ng-show="!processing && !pinnedItem" ng-click="pinClicked()"><i class="fa fa-thumb-tack"></i></button>' +
                    '<div class="pin-icon-button" ng-show="!processing && !pinnedItem" ng-click="pinClicked()"><i class="fa fa-thumb-tack" style="width: 20px;"></i></div>' +
                    '<div ng-show="!processing && pinnedItem">' +
                        '<div class="pin-icon-button-pinned" ng-show="!unpinning" ng-click="unpinning=true"><i class="fa fa-thumb-tack" style="width: 20px;"></i></div>' +
                        //'<a ng-show="!unpinning" ng-click="unpinning=true" class="action-link pointer"><span style="color: green;"><i class="fa fa-check"></i> Pinned</span></a>' +
                        '<div ng-show="unpinning" class="unpinning-options">' +
                            '<a ng-click="goToPinnedItem()" style="margin-right: 10px;" class="action-link pointer">Go To Pin</a>' +
                            '<a ng-click="unpin()" class="action-link pointer"><span style="color: red;"><i class="fa fa-times"></i> Unpin</span></a>' +
                        '</div>' +
                    '</div>' +
                    '<span ng-show="processing"><loading></loading> {{unpinning ? \'Unpinning...\' : \'Pinning...\'}}</span>' +
                '</span>',
            scope: {
                pinnedItem: '=',
                post: '=?',
                status: '=?',
                comment: '=?',
                imageFileEntry: '=?',
                formattedText: '=?',
                /* The PinnedItemType, if applicable */
                type:'=?'
            },
            link: function (scope, element, attrs) {
                pinDirectiveService.initializePinLinkScope(scope);
            }
        };
    }]);