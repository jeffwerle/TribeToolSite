angular.module('app.Directives')
    .directive('friend', ['profileService', 'accountService', function (profileService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<profile-name account="friendAccount"></profile-name>' +
                    '<div><comment-picture  account="friendAccount" class="centered" style="display: inline-block;"></comment-picture></div>' +
                '</div>',
            scope: {
                friendAccountCommunity: '=',
                friendAccount: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('friendRequest', ['commService', 'profileService', 'communityService', 'friendService', function (commService, profileService, communityService, friendService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="float: left; margin-right: 20px;">' +
                        '<comment-picture community="community" account="friendRequest.RequesterAccount" options="profileNameOptions"></comment-picture>' +
                    '</div>' +
                    '<div ng-show="processing"></div>' +
                    '<div ng-show="!processing">' +
                        '<div ng-if="friendshipStatus === \'Pending\'">' +
                            '<div><profile-name community="community" account="friendRequest.RequesterAccount" options="profileNameOptions"></profile-name> wants to be your {{communityName}} friend!</div>' +
                            '<div>' +
                                '<button class="btn btn-primary" type="button" ng-click="acceptFriendRequest()" style="margin-top:5px; margin-right: 10px;">Accept</button>' +
                                '<button class="btn btn-warning" type="button" ng-click="denyFriendRequest()" style="margin-top:5px;">Ignore</button>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="friendshipStatus === \'Accepted\'">' +
                            '<div><i class="fa fa-check"></i> You and <profile-name community="community" account="friendRequest.RequesterAccount" options="profileNameOptions"></profile-name> are now friends!</div>' +
                        '</div>' +
                        '<div ng-if="friendshipStatus === \'Denied\'">' +
                            '<div>Your friend request from <profile-name account="friendRequest.RequesterAccount" options="profileNameOptions"></profile-name> has been ignored.</div>' +
                        '</div>' +
                    '</div>' +
                    '<div style="clear:both;"></div>' +
                '</div>',
            scope: {
                friendRequest: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.community = scope.friendRequest.Community ? scope.friendRequest.Community : communityService.community;
                scope.communityName = communityService.getNameWithoutThe(scope.community);

                scope.profileNameOptions = {
                    onClick: scope.options ? scope.options.onCancel : null
                };

                scope.friendshipStatus = 'Pending';
                scope.acceptFriendRequest = function() {
                    // Accept friend request
                    scope.processing = true;
                    friendService.acceptFriendRequest(scope.friendRequest.Id, function(data) {
                        // success
                        scope.processing = false;
                        scope.friendshipStatus = 'Accepted';
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };
                scope.denyFriendRequest = function() {
                    // Deny friend request
                    scope.processing = true;
                    friendService.denyFriendRequest(scope.friendRequest.Id, function(data) {
                        // success
                        scope.processing = false;
                        scope.friendshipStatus = 'Denied';
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };
            }
        };
    }])
    .directive('profileFriendRequestArea', ['communityService', 'profileService', 'commService', 'friendService', 'accountService', 'navigationService', function (communityService, profileService, commService, friendService, accountService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div><i class="fa fa-user"></i></div>' +
                    '<div ng-show="processing"><loading></loading></div>' +
                    '<div ng-show="!processing">' +

                        '<div ng-if="friendshipType === \'NotFriends\'"><button class="btn btn-primary" style="margin-top:5px;" ng-click="sendFriendRequest()">Send Friend Request</button></div>' +
                        '<div ng-if="friendshipType === \'Friends\'">' +
                            '<div>' +
                                '<i class="fa fa-check"></i>' +
                                '<a class="post-action-link" ng-click="showUnfriendOptions = !showUnfriendOptions"><span style="font-weight: bold; font-size: 18px; padding-right: 10px;">Friends</span></a>' +
                            '</div>' +

                            '<div><a class="post-action-link" ng-show="!unfriending && showUnfriendOptions" ng-click="unfriending = true">Unfriend</a></div>' +
                            '<div ng-show="unfriending">' +
                                '<div style="font-weight: bold; color: red; margin-top: 20px;">Are you sure you want to unfriend {{profileFullName}}?</div>' +
                                '<div><button class="btn btn-warning" type="button" ng-click="unfriending = false; showUnfriendOptions = false" style="margin-top: 10px;">Cancel</button></div>' +
                                '<div><button class="btn btn-danger" type="button" ng-click="unfriend()" style="margin-top: 5px;">Unfriend</button></div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="friendshipType === \'Pending\'"><h4>Friend Request Pending</h4></div>' +
                        '<div ng-if="friendshipType === \'FriendRequest\'">' +
                            '<button class="btn btn-primary" type="button" ng-click="acceptFriendRequest()" style="margin-top:5px;">Accept Friend Request</button>' +
                            '<button class="btn btn-warning" type="button" ng-click="denyFriendRequest()" style="margin-top:5px;">Ignore Friend Request</button>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.friendship = profileService.getFriendshipWithProfile();

                scope.unfriending = false;
                scope.profileFullName = profileService.getProfileFullName();
                scope.friendId = profileService.currentProfile.Id;
                scope.processing = false;

                scope.friendshipType = null;
                if(!scope.friendship || scope.friendship.FriendshipStatus === 'Unfriended') {
                    scope.friendshipType = 'NotFriends';
                }
                else if(scope.friendship.FriendshipStatus === 'Friends') {
                    scope.friendshipType = 'Friends';
                }
                else if(scope.friendship.FriendshipStatus === 'Denied') {
                    scope.processing = true;
                    // Get the friend request and see if the logged-in account was the denier or the
                    // denied
                    // If they were the denied then show the request as pending. If they were the denier
                    // then allow them to initiate another friendship request.
                    friendService.getFriendRequestBetweenAccount(scope.friendId, function(data) {
                        // Success

                        if(!data.FriendRequest) {
                            // There is no friend request so show the users as not friends
                            scope.friendshipType = 'NotFriends';
                        }
                        else {
                            var friendRequest = data.FriendRequest;
                            if(friendRequest.RequesterId === accountService.account.Id) {
                                // The logged-in account was denied, so show the friend request as pending
                                scope.friendshipType = 'Pending';
                            }
                            else {
                                // The logged-in account was the denier so allow them to initiate another
                                // friendship request
                                scope.friendshipType = 'NotFriends';
                            }
                        }

                        scope.processing = false;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert('Failed to retrieve friend request data.');
                        scope.processing = false;
                    });
                }
                else {
                    // Do we have a friend request pending? We need to determine if we initiated it
                    // (in which case it will be pending) or if it was sent to us (in which case
                    // we can make the decision to accept or deny).
                    scope.processing = true;
                    friendService.getPendingFriendRequestsBetweenAccount(scope.friendId, function(data) {
                        // Success

                        // Do we have any friend requests where we're the recipient? (Where we can make the decision)
                        if(data.RecipientFriendRequests && data.RecipientFriendRequests.length > 0) {
                            // Yes, we can decide whether the friend request goes through!
                            scope.friendRequest = data.RecipientFriendRequests[0];
                            scope.friendshipType = 'FriendRequest';
                        }
                        else if(data.RequesterFriendRequests && data.RequesterFriendRequests.length > 0) {
                            // There is a pending friend request and we were the initiator so we have to
                            // wait for a response
                            scope.friendshipType = 'Pending';
                        }
                        else {
                            // No pending friend requests
                            scope.friendshipType = 'NotFriends';
                        }

                        scope.processing = false;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert('Failed to retrieve friend request data.');
                        scope.processing = false;
                    });
                }

                scope.sendFriendRequest = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService);
                        return;
                    }

                    scope.processing = true;
                    friendService.sendFriendRequest(scope.friendId, function(data) {
                        // success
                        scope.processing = false;
                        scope.friendshipType = 'Pending';
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };

                scope.unfriend = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showLoginDialog(navigationService);
                        return;
                    }

                    scope.processing = true;
                    friendService.unfriend(scope.friendId, function(data) {
                        // success
                        scope.friendshipType = 'NotFriends';
                        scope.processing = false;
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };
                scope.acceptFriendRequest = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showLoginDialog(navigationService);
                        return;
                    }

                    // Accept friend request
                    scope.processing = true;
                    friendService.acceptFriendRequest(scope.friendRequest.Id, function(data) {
                        // success
                        scope.processing = false;
                        scope.friendshipType = 'Friends';
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };
                scope.denyFriendRequest = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showLoginDialog(navigationService);
                        return;
                    }

                    // Deny friend request
                    scope.processing = true;
                    friendService.denyFriendRequest(scope.friendRequest.Id, function(data) {
                        // success
                        scope.processing = false;
                        scope.friendshipType = 'NotFriends';
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };

            }
        };
    }]);