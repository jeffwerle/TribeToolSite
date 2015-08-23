angular.module('app.Directives')
    .directive('statusInput', ['mediaService', 'statusDirectiveService', 'communityService', function (mediaService, statusDirectiveService, communityService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess" class="status-input">' +
                    '<a id="statusInputAnchor"></a>' +
                    '<a id="{{votableIdAnchor}}"></a>' +
                    '<div ng-if="isLoggedIn" class="status-input-well">' +
                        '<div ng-show="processing"><loading></loading> Posting Status...</div>' +
                        '<form ng-show="!processing" ng-submit="submitStatus()">' +
                            '<div style="float: left;"><comment-picture></comment-picture></div>' +
                            '<div class="status-input-content">' +
                                '<content-editor show-toolbar="focused" options="formattingHelperOptions" text="$parent.statusText" placeholder="placeholder"></content-editor>' +
                                '<div style="clear:both;">' +
                                    '<div ng-show="focused" class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Post</button></div>' +
                                    '<div ng-show="focused" class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancel()" style="margin-top: 10px;">Cancel</button></div>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div style="clear:both;"></div>' +
                    '</div>' +
                '</div>',
            scope: {
                status: '=?',
                /*
                    {
                        onComplete: function(StatusEntry),
                        focus(value) // Focuses the status input box. This method will be set in options by this directive so that it can be called outside of this directive,
                        scrollTo() // Scrolls to the input box. This method will be set in options by this directive so that it can be called outside of this directive,
                    }
                 */
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;

                statusDirectiveService.initializeStatusInputScope(scope);
            }
        };
    }])
    .directive('statusEntry', ['mediaService', 'statusDirectiveService', '$filter', 'modalService', function (mediaService, statusDirectiveService, $filter, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="status-entry">' +
                    '<div ng-if="!mediaService.isPhone" ng-show="!status.IsTrashed" class="pull-left status-picture-container">' +
                        '<comment-picture votable="status"></comment-picture>' +
                    '</div>' +

                    //'<div class="status-container" emotion-color="status.Statistics.EmotionStatistics.EmotionType">' +
                    '<div class="status-container">' +
                        '<a id="status{{status.Id}}"></a>' +
                        '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                        '<pin-link ng-hide="hidePin" status="status" pinned-item="status.PinnedItem" ng-class="{\'has-more-options\': moreOptions}"></pin-link>' +



                        // We use ng-if="isReady" to make the loading of the status feel snappier (we'll load on the
                        // next digest).
                        '<div ng-if="isReady" class="status-content-container">' +
                            '<div class="status-header status-content">' +
                                '<div ng-if="mediaService.isPhone" ng-show="!status.IsTrashed" class="pull-left status-picture-container">' +
                                    '<comment-picture votable="status"></comment-picture>' +
                                '</div>' +
                                '<div class="post-submitted-by-text status-header-content">' +
                                    '<span ng-if="status.TargetAccount"><profile-name votable="status"></profile-name> to <profile-name account="status.TargetAccount"></profile-name> </span>' +
                                    '<span ng-if="!status.TargetAccount"><profile-name votable="status"></profile-name> </span>' +
                                    '{{infoText}}' +
                                '</div>' +
                            '</div>' +

                            '<div ng-show="!status.IsTrashed">' +
                                '<div ng-show="!showEdit">' +
                                    '<div class="status-content" btf-markdown="status.FormattedText"></div>' +
                                    '<div ng-show="!showDelete" class="status-control-area">' +

                                        '<div>' +
                                            '<div class="col-sm-12"><interaction-summary votable="status"></interaction-summary></div>' +
                                            '<div ng-if="status.Tags && status.Tags.length > 0" class="pull-right status-tag-container">' +
                                                '<comment-picture-tags tags="status.Tags"></comment-picture-tags>' +
                                            '</div>' +

                                            '<div class="toolbar-container pull-left col-sm-6">' +
                                                '<div class="toolbar-item">' +
                                                    '<emotion-vote-mechanism class="emotion-vote-mechanism" status="status" emotion="status.RequesterEmotion"></emotion-vote-mechanism>' +
                                                '</div>' +
                                                '<div ng-show="hasWriteAccess" class="toolbar-item">' +
                                                    '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-click="reply()"><i class="icon ion-chatbox"></i></button>' +
                                                '</div>' +
                                                '<div ng-show="hasWriteAccess" class="toolbar-item">' +
                                                    '<share-link class="medium-toolbar-button" status="status" permalink="permalink"></share-link>' +
                                                '</div>' +
                                            '</div>' +


                                            '<div class="clearfix"></div>' +
                                        '</div>' +

                                    '</div>' +
                                '</div>' +
                                '<form ng-if="showEdit && hasWriteAccess" ng-submit="submitEdit()" class="clearfix" style="margin-bottom: 20px;">' +
                                    '<div ng-show="processingEdit"><loading></loading> Submitting Edit...</div>' +
                                    '<div ng-show="!processingEdit">' +
                                        '<content-editor options="contentEditorOptions" show-toolbar="true" text="status.FormattedText" placeholder="\'Write a status...\'"></content-editor>' +
                                        '<div style="clear:both;">' +
                                            '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save</button></div>' +
                                            '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="cancelEdit()" style="margin-top: 10px;">Cancel</button></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</form>' +
                                '<div ng-show="processingDelete"><loading></loading> Deleting...</div>' +
                            '</div>' +
                        '</div>' +






                    '</div>' +
                    '<div class="status-comment-container">' +
                        '<comment-replies ng-if="commentOptions" show-reply="showReply" is-collapsed="false" status="status" options="commentOptions" comment-input-options="commentInputOptions"></comment-replies>' +
                    '</div>' +
                '</div>',
            scope: {
                status: '=',
                hidePin: '=?'
            },
            link: function(scope, element, attrs) {
                scope.mediaService = mediaService;


                scope.voteString = scope.status.Statistics.VoteCount.toString() + (scope.status.Statistics.VoteCount === 1 ? ' Vote' : ' Votes');


                scope.updateInfoText = function() {
                    scope.infoText = scope.status.IsTrashed ? 'Status Deleted' :  $filter('dateRobust')(scope.status.CreationDate, 'medium') + (scope.status.IsEdited ? ' *Edited' : '');
                };
                scope.updateInfoText();


                statusDirectiveService.initializeStatusScope(scope);


                scope.report = function() {
                };

                scope.showDelete = false;
                scope.delete = function() {
                    if(!scope.hasWriteAccess)
                        return;

                    scope.showDelete = true;
                };

                scope.cancelDelete = function() {
                    scope.showDelete = false;
                };


                var buttons = [];
                buttons.push({
                    text: 'Go To Permalink',
                    onClick: function() {
                        scope.goToPermalink();
                    }
                });

                if((scope.isAccountStatus && scope.hasWriteAccess) || scope.isModerator) {
                    buttons.push({
                        text: 'Edit Status',
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
                    title: 'Status Options',
                    buttons: buttons
                };

                if((scope.isAccountStatus && scope.hasWriteAccess) || scope.isModerator) {
                    scope.moreOptions.deleteButton = {
                        onClick: function() {
                            modalService.confirmDelete('Delete Forever?', 'Are you sure you want to delete this status forever?', function(result) {
                                if(result) {
                                    scope.submitDelete();
                                }
                                else {
                                    scope.cancelDelete();
                                }
                            });
                        },
                        text: 'Delete Status'
                    };
                }
            }

        };
    }]);