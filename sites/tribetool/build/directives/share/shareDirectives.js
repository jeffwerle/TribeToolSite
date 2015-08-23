angular.module('app.Directives')
    .directive('shareLink', ['commService', 'navigationService', 'accountService', 'communityService', 'pinService', 'modalService', 'shareService', 'marketingService', function (commService, navigationService, accountService, communityService, pinService, modalService, shareService, marketingService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<button ng-show="hasWriteAccess" type="button" class="btn toolbar-button toolbar-button-hoverable" ng-click="linkClicked()"><i class="fa fa-share"></i></button>',
            scope: {
                post: '=?',
                status: '=?',
                comment: '=?',
                imageFileEntry: '=?',
                formattedText: '=?',
                permalink: '=?'
            },
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.linkClicked = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'ShareLinkOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    if(scope.permalink) {
                        if(scope.post) {
                            scope.post.permalink = scope.permalink;
                        }
                        if(scope.status) {
                            scope.status.permalink = scope.permalink;
                        }
                        if(scope.comment) {
                            scope.comment.permalink = scope.permalink;
                        }
                        if(scope.imageFileEntry) {
                            scope.imageFileEntry.permalink = scope.permalink;
                        }
                    }

                    shareService.clearAll();
                    shareService.post = scope.post;
                    shareService.status = scope.status;
                    shareService.comment = scope.comment;
                    shareService.imageFileEntry = scope.imageFileEntry;
                    shareService.text = scope.formattedText;

                    shareService.onShare();
                };
            }
        };
    }]);