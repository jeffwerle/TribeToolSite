angular.module('app.Services')
    .factory('statusDirectiveService', ['communityService', 'streamService', 'commService', 'accountService', 'profileService', 'statusService', 'navigationService', '$timeout', 'mediaService', 'route', 'shareService', 'marketingService', 'modalService', '$ionicLoading', function(communityService, streamService, commService, accountService, profileService, statusService, navigationService, $timeout, mediaService, route, shareService, marketingService, modalService, $ionicLoading) {
        return {
            initializeStatusInputScope: function(scope) {
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.focused = false;

                scope.votableIdAnchor = 'statusInputAnchor' + (scope.status ? scope.status.Id : '');
                scope.hasWriteAccess = communityService.hasWriteAccess();

                if(!scope.options) {
                    scope.options = { };
                }

                scope.focusCallbacks = [];
                scope.$watch('options', function(newValue) {

                    if(newValue) {
                        scope.options = newValue;
                        scope.options.scrollTo = function() {
                            navigationService.scrollToHash(scope.votableIdAnchor);
                        };
                        scope.options.focus = function(val, callback) {
                            scope.formattingHelperOptions.autofocus = val;
                            if(callback) {
                                scope.focusCallbacks.push(callback);
                            }
                        };

                    }
                });

                scope.formattingHelperOptions = {
                    markdownOptions: {
                        status: scope.status,
                        infobox: false
                    },
                    onFocus: function() {
                        scope.focus();
                        if(scope.focusCallbacks) {
                            for(var i = 0; i < scope.focusCallbacks.length; i++) {
                                scope.focusCallbacks[i]();
                            }
                        }
                        scope.focusCallbacks = [];
                    },
                    onToolbarClicked: function() {
                        scope.focus();
                    },
                    autofocus: false
                };

                scope.statusText = '';

                var onShared = function() {
                    var textToShare = shareService.getTextToShare();
                    if(textToShare) {
                        scope.statusText = textToShare;
                        $timeout(function() {
                            scope.formattingHelperOptions.showPreview();
                            scope.formattingHelperOptions.autofocus = true;
                            scope.options.scrollTo();
                        });
                        shareService.clearAll();
                    }
                };
                var onStreamPageLoaded = function() {
                    if(route.routeParams.share) {
                        onShared();
                    }
                };
                scope.$on('router:streamPageLoaded', function() {
                    onStreamPageLoaded();
                });
                scope.$on('shareService:shared', function() {
                    onShared();
                });

                onStreamPageLoaded();

                scope.focus = function() {
                    scope.focused = true;
                };
                scope.cancel = function() {
                    scope.focused = false;
                    if(scope.formattingHelperOptions.hide) {
                        scope.formattingHelperOptions.hide();
                    }
                    scope.statusText = '';
                    $timeout(function() {
                        navigationService.scrollToHash(scope.votableIdAnchor);
                    });
                };

                scope.placeholder = 'Write a status...';
                if(profileService.currentProfile) {
                    if(profileService.isSelfProfile()) {
                        scope.placeholder = 'Write something on your profile...';
                    }
                    else {
                        scope.placeholder = 'Write something on ' + profileService.getProfileFullName(profileService.currentProfile) + '\'s profile...';
                    }
                }

                scope.submitStatus = function() {
                    if(scope.statusText === null ||
                        scope.statusText === '' ||
                        !angular.isDefined(scope.statusText)) {
                        return;
                    }

                    var statusEntry = {
                        FormattedText: scope.statusText,
                        CommunityId: communityService.community.Id
                    };

                    if(profileService.currentProfile) {
                        statusEntry.TargetAccountId = profileService.currentProfile.Id;
                    }
                    else {
                        statusEntry.TargetAccountId = accountService.account.Id;
                    }

                    scope.formattingHelperOptions.hide();

                    // Submit the status
                    scope.processing = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Status...'
                    });
                    statusService.createStatus(statusEntry, function(data) {
                        // Success
                        scope.processing = false;
                        $ionicLoading.hide();

                        // Clear the status
                        scope.statusText = '';

                        if(scope.options && scope.options.onComplete) {
                            scope.options.onComplete(data.Status);
                        }

                        scope.focused = false;
                        commService.showSuccessAlert('Status Posted!');

                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                        $ionicLoading.hide();
                    });
                };
            },
            initializeStatusScope: function(scope) {


                scope.commentOptions = {
                    status: scope.status
                };


                scope.isAccountStatus = accountService.account && accountService.account.Id === scope.status.AccountId;
                scope.isModerator = communityService.isModerator();
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.permalink = navigationService.getStatusUrl(scope.status, communityService.community);

                scope.goToPermalink = function() {
                    navigationService.goToPath(scope.permalink);
                    scope.permalinkClicked();
                };

                scope.permalinkClicked = function() {
                    modalService.closeAll();
                };

                scope.markdownOptions = {
                    status: scope.status
                };
                scope.contentEditorOptions = {
                    markdownOptions: scope.markdownOptions,
                    autofocus: false
                };

                scope.commentInputOptions = {
                    onCancel: function() {
                        scope.showReply = false;
                    },
                    status: scope.status
                };

                scope.replyWithQuote = function() {
                    scope.reply(true);
                };

                scope.showReply = false;
                scope.reply = function(doQuote) {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'StatusReplyOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    if(doQuote) {
                        scope.commentInputOptions.commentText = '[QUOTE=' + scope.status.Id + '][/QUOTE]\n';
                    }

                    scope.showReply = true;

                    $timeout(function() {
                        scope.commentInputOptions.focus(true, function() {
                            scope.commentInputOptions.scrollTo();
                        });
                    });
                };
                scope.cancelReply = function() {
                    scope.showReply = false;
                };

                scope.showEdit = false;
                scope.formattedTextBeforeEdit = '';
                scope.edit = function() {
                    scope.showEdit = true;
                    scope.formattedTextBeforeEdit = scope.status.FormattedText;
                    scope.scrollToStatus();
                    scope.contentEditorOptions.autofocus = true;
                };

                scope.scrollToStatus = function() {
                    navigationService.scrollToStatus(scope.status.Id);
                };

                scope.cancelEdit = function() {
                    scope.showEdit = false;
                    scope.status.FormattedText = scope.formattedTextBeforeEdit;
                    scope.scrollToStatus();
                };

                scope.submitEdit = function() {
                    // Did we make any change?
                    if(scope.status.FormattedText === scope.formattedTextBeforeEdit) {
                        // No change, we're done
                        scope.cancelEdit();
                        return;
                    }


                    // Submit comment edit to service
                    scope.processingEdit = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Edit...'
                    });
                    statusService.editStatus(scope.status, function(data) {
                        // Success
                        scope.processingEdit = false;
                        $ionicLoading.hide();
                        scope.status = data.Status;
                        scope.showEdit = false;
                        scope.updateInfoText();
                        scope.scrollToStatus();
                        commService.showSuccessAlert('Status edited successfully!');
                    }, function(data) {
                        // Failure
                        scope.processingEdit = false;
                        $ionicLoading.hide();
                        commService.showErrorAlert(data);
                    });
                };


                scope.submitDelete = function() {
                    scope.processingDelete = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Deleting Status...'
                    });
                    statusService.deleteStatus(scope.status, function(data) {
                        // Success
                        scope.processingDelete = false;
                        $ionicLoading.hide();
                        scope.status = data.Status;
                        scope.cancelDelete();
                        scope.updateInfoText();
                    }, function(data) {
                        // Failure
                        scope.processingDelete = false;
                        commService.showErrorAlert(data);
                        $ionicLoading.hide();
                    });
                };


                $timeout(function() {
                    scope.isReady = true;
                });
            }
        };
    }]);