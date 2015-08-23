angular.module('app.Services')
    .factory('friendService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            /* accountId is the Id of the account for which we will be getting friends */
            getFriends: function(accountId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetFriendsOptions: {
                        AccountId: accountId
                    },
                    RequestType: 'GetFriends'
                }, onSuccess, onFailure);
            },
            /*
                Gets the pending friend requests where the current account is the
                recipient.
             */
            getPendingFriendRequests: function(populateRequesterData,
                                               populateRecipientData,
                                               onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    // Note that we do not specify the community so that we get friend requests for all communities
                    Credentials: accountService.getCredentials(null),

                    PopulateRequesterData: populateRequesterData,
                    PopulateRecipientData: populateRecipientData,
                    RequestType: 'GetPendingFriendRequests'
                }, onSuccess, onFailure);
            },
            /* Gets the friend requests between the current account and the given
             * other account as specified by friendAccountId where the friend request is
              * pending and the currently logged-in account is either the recipient or
              * the requester. */
            getPendingFriendRequestsBetweenAccount: function(friendAccountId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    CommunityId: communityService.community.Id,
                    FriendAccountId: friendAccountId,
                    RequestType: 'GetPendingFriendRequests'
                }, onSuccess, onFailure);
            },
            /* Gets the friend requests between the current account and the given
             * other account as specified by friendAccountId where the currently logged-in
             * account is either the recipient or the requester. */
            getFriendRequestBetweenAccount: function(friendAccountId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    CommunityId: communityService.community.Id,
                    FriendAccountId: friendAccountId,
                    RequestType: 'GetFriendRequest'
                }, onSuccess, onFailure);
            },
            sendFriendRequest: function(friendAccountId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    FriendAccountId: friendAccountId,
                    RequestType: 'FriendRequest'
                }, onSuccess, onFailure);
            },
            acceptFriendRequest: function(friendRequestId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    FriendRequestId: friendRequestId,
                    RequestType: 'AcceptFriendRequest'
                }, onSuccess, onFailure);
            },
            denyFriendRequest: function(friendRequestId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    FriendRequestId: friendRequestId,
                    RequestType: 'DenyFriendRequest'
                }, onSuccess, onFailure);
            },
            unfriend: function(friendAccountId, onSuccess, onFailure) {
                commService.postWithParams('friend', {
                    Credentials: accountService.getCredentials(communityService.community),
                    FriendAccountId: friendAccountId,
                    RequestType: 'Unfriend'
                }, onSuccess, onFailure);
            },
            getFriendship: function(friendId, accountCommunity) {
                if(!accountCommunity || !accountCommunity.Friends) {
                    return null;
                }

                for(var i = 0; i < accountCommunity.Friends.length; i++) {
                    if(accountCommunity.Friends[i].FriendAccountId === friendId) {
                        return accountCommunity.Friends[i];
                    }
                }

                return null;
            }
        };
    }]);