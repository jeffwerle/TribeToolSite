angular.module('app.Services')
    .factory('pinService', ['$rootScope', 'commService', 'accountService', 'communityService', 'navigationService', function($rootScope, commService, accountService, communityService, navigationService) {
        return {
            getPinnedItems: function(pageNumber, countPerPage, targetAccountId, onSuccess, onFailure) {
                commService.postWithParams('pin', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetPinnedItemsOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage,
                        TargetAccountId: targetAccountId
                    },
                    RequestType: 'GetPinnedItems'
                }, onSuccess, onFailure);
            },
            getPinnedItem: function(pinnedItemId, onSuccess, onFailure) {
                commService.postWithParams('pin', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PinnedItem: {
                        Id: pinnedItemId
                    },
                    RequestType: 'GetPinnedItem'
                }, onSuccess, onFailure);
            },
            pinItem: function(pinnedItem, onSuccess, onFailure) {
                navigationService.registerEvent('Pin', 'Pinned Item', pinnedItem.FormattedText + pinnedItem.ContentId);

                commService.postWithParams('pin', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PinnedItem: pinnedItem,
                    RequestType: 'PinItem'
                }, function(data) {
                    var pinnedItem = data.PinnedItems[0];

                    // Add the pinned item to the account community
                    var accountCommunity = communityService.accountCommunity;
                    if(!accountCommunity.PinnedItems) {
                        accountCommunity.PinnedItems = [];
                    }
                    accountCommunity.PinnedItems.push(pinnedItem);

                    commService.showSuccessAlert('Pinned!');

                    if(onSuccess) {
                        onSuccess(data);
                    }
                }, onFailure);
            },
            unpinItem: function(pinnedItem, onSuccess, onFailure) {
                navigationService.registerEvent('Pin', 'Unpinned Item', pinnedItem.FormattedText + pinnedItem.ContentId);

                commService.postWithParams('pin', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PinnedItem: pinnedItem,
                    RequestType: 'UnpinItem'
                }, function(data) {

                    // Remove the pinned item from the account community
                    var accountCommunity = communityService.accountCommunity;
                    if(accountCommunity.PinnedItems) {
                        var pinnedItemIndex = -1;
                        for(var i = 0; i < accountCommunity.PinnedItems.length; i++) {
                            var pinnedItem = accountCommunity.PinnedItems[i];
                            if(pinnedItem.Id === data.PinnedItems[0].Id) {
                                pinnedItemIndex = i;
                                break;
                            }
                        }
                        if(pinnedItemIndex >= 0) {
                            // Remove the pinned item
                            accountCommunity.PinnedItems.splice(pinnedItemIndex, 1);
                        }
                    }

                    if(onSuccess) {
                        onSuccess(data);
                    }
                }, onFailure);
            }
        };
    }]);