angular.module('app.Directives')
    .directive('statusInput', ['statusDirectiveService', function(statusDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="status-input">' +
                    '<a id="statusInputAnchor"></a>' +
                    '<a id="{{votableIdAnchor}}"></a>' +

                    '<div ng-if="isLoggedIn" class="status-well">' +
                        '<form ng-show="!processing" ng-submit="submitStatus()">' +
                            '<content-editor show-toolbar="focused" options="formattingHelperOptions" text="$parent.statusText" placeholder="placeholder"></content-editor>' +
                            '<div>' +
                                '<div ng-show="focused"><button class="button button-block button-positive col-80 col-offset-10" type="submit">Post Status</button></div>' +
                                '<div ng-show="focused"><button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button></div>' +
                            '</div>' +
                        '</form>' +
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

                statusDirectiveService.initializeStatusInputScope(scope);

            }
        };
    }])
    .directive('statusEntry', ['statusDirectiveService', '$filter', '$ionicPopup', function (statusDirectiveService, $filter, $ionicPopup) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="status-entry">' +
                    '<div class="status-well">' +
                        '<a id="status{{status.Id}}"></a>' +


                        // We use ng-if="isReady" to make the loading of the status feel snappier (we'll load on the
                        // next digest).
                        '<div ng-show="!status.IsTrashed" ng-if="isReady">' +
                            '<div class="list card" emotion-color="status.Statistics.EmotionStatistics.EmotionType">' +

                                '<div class="item item-avatar">' +
                                    '<more-options ng-if="moreOptions" options="moreOptions"></more-options>' +
                                    '<div class="row {{::status.TargetAccount ? \'three-line\' : \'two-line\'}}">' +
                                        '<div class="col-15">' +
                                            '<comment-picture votable="status"></comment-picture>' +
                                        '</div>' +
                                        '<div class="col">' +
                                            '<p ng-if="status.TargetAccount" class="post-submitted-by-text"><profile-name votable="status"></profile-name> on <profile-name account="status.TargetAccount"></profile-name>\'s Profile</p>' +
                                            '<p ng-if="status.TargetAccount" class="post-submitted-by-text"><interaction-summary votable="status"></interaction-summary></p>' +
                                            '<p ng-if="!status.TargetAccount" class="post-submitted-by-text"><profile-name votable="status"></profile-name> <interaction-summary votable="status"></interaction-summary></p>' +
                                            '<p class="post-submitted-by-text info-text">{{infoText}}</p>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +

                                '<div class="item item-body">' +

                                    '<div class="row" ng-show="!showEdit">' +
                                        '<div class="col" btf-markdown="status.FormattedText" markdown-options="markdownOptions"></div>' +
                                    '</div>' +
                                    '<div ng-if="showEdit && hasWriteAccess">' +
                                        '<form ng-submit="submitEdit()" novalidate="novalidate">' +
                                            '<div ng-show="!processingEdit">' +
                                                '<content-editor options="contentEditorOptions" text="status.FormattedText" placeholder="\'Write a status...\'"></content-editor>' +
                                                '<div style="clear:both;">' +
                                                    '<button class="button button-block button-positive col-80 col-offset-10" type="submit">Save</button>' +
                                                    '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancelEdit()">Cancel</button>' +
                                                '</div>' +
                                            '</div>' +
                                        '</form>' +
                                    '</div>' +
                                '</div>' +


                                '<action-bar ng-if="hasWriteAccess" options="actionBarOptions" status="status" requester-emotion="status.RequesterEmotion"></action-bar>' +


                            '</div>' +
                        '</div>' +

                        '<div class="list card comment-replies-card" emotion-color="status.Statistics.EmotionStatistics.EmotionType">' +
                            '<div class="item item-body" style="">' +
                                '<comment-replies level="0" ng-if="commentOptions" show-reply="showReply" is-collapsed="false" status="status" options="commentOptions" comment-input-options="commentInputOptions"></comment-replies>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                status: '=',
                hidePin: '=?'
            },
            link: function(scope, element, attrs) {

                scope.actionBarOptions = {
                    onShare: function() {
                        // TODO: Share
                    },
                    onComment: function() {
                        scope.reply();
                    }
                };



                statusDirectiveService.initializeStatusScope(scope);


                scope.updateInfoText = function() {
                    scope.infoText = scope.status.IsTrashed ? 'Status Deleted' : scope.status.AgeString + ', ' + $filter('dateRobust')(scope.status.CreationDate, 'medium') + (scope.status.IsEdited ? ' *Edited' : '');
                };
                scope.updateInfoText();



                if(scope.isAccountStatus) {
                    scope.moreOptions = {
                        title: 'Status Options',
                        buttons: [{
                            text: 'Edit Status',
                            onClick: function() {
                                scope.edit();
                            }
                        }]
                    };
                    scope.moreOptions.delete = {
                        text: 'Delete Status',
                        onClick: function() {
                            var confirmPopup = $ionicPopup.confirm({
                                title: 'Delete Status Forever?',
                                template: 'Are you sure you want to delete this Status forever?',
                                okText: 'Delete',
                                okType: 'button-assertive'
                            });
                            confirmPopup.then(function(res) {
                                if(res) {
                                    // Delete status
                                    scope.submitDelete();
                                } else {
                                    // Cancelled
                                }
                            });
                        }
                    };
                }
            }

        };
    }]);