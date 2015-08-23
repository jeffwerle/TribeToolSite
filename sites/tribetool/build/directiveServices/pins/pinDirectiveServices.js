angular.module('app.Services')
    .factory('pinDirectiveService', ['commService', 'navigationService', 'accountService', 'communityService', 'pinService', 'modalService', function(commService, navigationService, accountService, communityService, pinService, modalService) {
        return {
            initializePinLinkScope: function(scope) {

                scope.$watch('formattedText', function(formattedText) {
                    if(accountService.isLoggedIn() && formattedText) {
                        // Determine if this formatted text is pinned
                        // If it IS pinned, set scope.pinnedItem
                        var accountCommunity = communityService.accountCommunity;
                        if(accountCommunity.PinnedItems) {
                            for(var i = 0; i < accountCommunity.PinnedItems.length; i++) {
                                var pinnedItem = accountCommunity.PinnedItems[i];
                                if(pinnedItem.FormattedText === formattedText) {
                                    scope.pinnedItem = pinnedItem;
                                    break;
                                }
                            }
                        }
                    }
                });

                scope.pinnedClicked= function() {
                    scope.unpinning = true;
                };

                scope.unpin = function() {
                    scope.processing = true;
                    pinService.unpinItem({
                        Id: scope.pinnedItem.Id
                    }, function(data) {
                        // Success
                        scope.pinnedItem = null;
                        scope.processing = false;
                        scope.unpinning = false;

                        commService.showSuccessAlert('Unpinned!');
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                        scope.unpinning = false;
                    });
                };

                scope.goToPinnedItem = function() {
                    // Go to the pinned item!
                    navigationService.goToPinnedItem(scope.pinnedItem, accountService.account, communityService.community);
                    // Close any modals
                    modalService.closeAll();
                };

                scope.pinClicked = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService);
                        return;
                    }

                    var type = scope.type ? scope.type : scope.imageFileEntry ? 'Image' : scope.comment ? 'Comment' : scope.status ? 'Status' : scope.post ? 'Post' : 'Other';
                    var contentId = scope.imageFileEntry ? scope.imageFileEntry.Id : scope.comment ? scope.comment.Id : scope.status ? scope.status.Id : scope.post ? scope.post.Id : null;
                    // pin the item!
                    var pinnedItem = {
                        ContentId: contentId,
                        Type: type,
                        FormattedText: scope.formattedText
                    };

                    scope.processing = true;
                    pinService.pinItem(pinnedItem, function(data) {
                        // Success
                        scope.pinnedItem = data.PinnedItems[0];

                        scope.processing = false;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                    });

                };
            }
        };
    }]);