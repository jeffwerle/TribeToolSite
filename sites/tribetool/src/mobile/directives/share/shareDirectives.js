angular.module('app.Directives')
    .directive('shareButton', ['commService', 'navigationService', 'accountService', 'communityService', 'modalService', 'shareService', 'marketingService', 'mobileShareService', '$ionicLoading', '$timeout', function (commService, navigationService, accountService, communityService, modalService, shareService, marketingService, mobileShareService, $ionicLoading, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<i class="icon ion-share" ng-click="buttonClicked($event)"></i>',
            scope: {
                post: '=?',
                postContent: '=?',
                status: '=?',
                comment: '=?',
                imageFileEntry: '=?',
                formattedText: '=?',
                permalink: '=?',

                /*
                 {
                    share: function($event) // filled by this directive, this can be called to carry out the "share" action
                 }
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {

                scope.buttonClicked = function(e) {
                    scope.share();

                    if(e)
                        e.stopPropagation();
                };

                scope.share = function() {
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


                    $ionicLoading.show({
                        template: '<loading></loading> Preparing to Share...'
                    });

                    $timeout(function() {
                        shareService.clearAll();
                        shareService.post = scope.post;
                        shareService.status = scope.status;
                        shareService.comment = scope.comment;
                        shareService.imageFileEntry = scope.imageFileEntry;
                        shareService.text = scope.formattedText;


                        var permalinkOptions = {
                            status: scope.status,
                            post: scope.post,
                            imageFileEntry: scope.imageFileEntry,
                            community: communityService.community,
                            account: scope.imageFileEntry ? scope.imageFileEntry.Account : null,
                            tagPage: scope.imageFileEntry ? scope.imageFileEntry.TagPage : null
                        };

                        if(!scope.permalink) {
                            if(scope.post) {
                                scope.post.permalink = navigationService.getPostUrl(scope.post, communityService.community);
                            }
                            if(scope.status) {
                                scope.status.permalink = navigationService.getStatusUrl(scope.status, communityService.community);
                            }
                            if(scope.comment) {
                                scope.comment.permalink = navigationService.getCommentUrl(scope.comment, permalinkOptions);
                            }
                            if(scope.imageFileEntry) {
                                scope.imageFileEntry.permalink = navigationService.getImageUrl(scope.imageFileEntry, permalinkOptions);
                            }
                        }

                        mobileShareService.share();

                    });
                };

                if(scope.options) {
                    scope.options.share = scope.share;
                }
            }
        };
    }]);