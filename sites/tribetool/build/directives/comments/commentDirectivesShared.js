angular.module('app.Directives')
    .directive('commentPicture', ['profileService', 'communityService', 'accountService', 'modalService', 'OPTIONS', function (profileService, communityService, accountService, modalService, OPTIONS) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span class="centered">' +
                    //'<span class="comment-profile-picture-container" ng-class="{\'progress-radial\': !hideCompatibility && accountCommunity, \'progress-{{compatibility}}\': !hideCompatibility && accountCommunity}">' +
                    '<span class="comment-profile-picture-container">' +
                        '<a ng-href="{{::linkUrl}}" ng-click="pictureClicked()"><img class="comment-profile-picture" ng-src="{{::profilePictureUrl | trusted}}"></a>' +
                        //'<profile-picture-level-progress ng-if="!suppressProgress" class="profile-picture-level-progress" show-level="showLevel" account-community="accountCommunity"></profile-picture-level-progress>' +
                    '</span>' +
                '</span>',
            scope: {
                /* The votable on which this comment picture is being displayed.
                 * If not provided, the current account picture will be used.
                 *
                 * This can also be an AccountEntry*/
                votable: '=?',
                account: '=?',
                /* If true, the progress bar will not be shown */
                suppressProgress: '=?',

                /* if true, the compatibility outline will not be shown */
                hideCompatibility: '=?',

                showOnlyPicture: '=?',

                /* If provided, this community will override any currently loaded community */
                community: '=?',
                /*
                 {
                 constructLinkUrl(AccountEntry, AccountCommunityEntry, VotableContent), // If provided, constructs the url to which the picture will redirect
                 onClick(AccountEntry, AccountCommunityEntry, VotableContent),
                 getCompatibility(AccountEntry, AccountCommunityEntry), // If provided, gets the compatibility from the given account.
                 }
                 */
                options: '=?'
            },
            controller: ['$scope', function($scope) {
                // Don't show compatibility on mobile app (yet)
                if(OPTIONS.isMobile) {
                    $scope.hideCompatibility = true;
                }

                // Ensure that angular doesn't get hung up in recursion while it's watching these variables
                if($scope.account && $scope.account.AccountCommunity) {
                    $scope.account.AccountCommunity.Account = null;
                }

                $scope.showLevel = !$scope.showOnlyPicture;

                if(angular.isDefined($scope.account) && $scope.account !== null) {
                    if(!$scope.votable) {
                        $scope.votable = { };
                    }
                    $scope.votable.Account = $scope.account;
                    if(!$scope.votable.AccountCommunity)
                        $scope.votable.AccountCommunity = $scope.account.AccountCommunity;
                }


                if($scope.votable) {
                    if($scope.votable.IsAnonymous || !$scope.votable.Account) {
                        $scope.fullName = 'Anonymous';
                        $scope.usernameWithSlash = '';
                        $scope.profilePictureUrl = profileService.getCommentProfilePictureUrl(null);
                        return;
                    }
                    else {
                        $scope.account = $scope.votable.Account;
                    }
                }
                else {
                    $scope.account = accountService.account;
                }

                $scope.accountCommunity = $scope.votable ? $scope.votable.AccountCommunity : communityService.accountCommunity;
                if(!$scope.accountCommunity) {
                    $scope.accountCommunity = communityService.newAccountCommunity();
                }


                if(!$scope.community)
                {
                    if($scope.account && $scope.account.Community) {
                        $scope.community = $scope.account.Community;
                    }
                    else {
                        $scope.community = communityService.community;
                        $scope.$on('communityChanged', function(event, community) {
                            $scope.community = community;
                            $scope.updateLinkUrl();
                        });
                    }
                }
                $scope.usernameWithSlash = $scope.account ? '/' + $scope.account.Username : '';


                var updateProfilePictureUrl = function() {
                    $scope.profilePictureUrl = profileService.getCommentProfilePictureUrl($scope.accountCommunity, $scope.account);
                };
                updateProfilePictureUrl();
                var updateCompatibility = function() {
                    $scope.compatibility = $scope.options && $scope.options.getCompatibility ? $scope.options.getCompatibility($scope.account, $scope.accountCommunity) : $scope.accountCommunity.Compatibility ? $scope.accountCommunity.Compatibility.LowestPossibleCompatibility : 0;
                };
                updateCompatibility();

                $scope.updateLinkUrl = function() {
                    $scope.linkUrl = (OPTIONS.isMobile ? '#/' : '') + ($scope.options && $scope.options.constructLinkUrl ? $scope.options.constructLinkUrl($scope.account, $scope.accountCommunity, $scope.votable) : 'profile/' + $scope.community.Url + $scope.usernameWithSlash);
                };
                $scope.updateLinkUrl();


                $scope.$watch('account.AccountCommunity', function(newValue) {
                    if(newValue) {
                        $scope.accountCommunity = newValue;
                        updateProfilePictureUrl();
                        updateCompatibility();
                        $scope.updateLinkUrl();
                    }
                });

                // If we're logged in and displaying the profile picture for the logged-in account then
                // watch for changes to the profile picture so that we can update the image.
                if($scope.accountCommunity && accountService.isLoggedIn() &&
                    $scope.accountCommunity.AccountId === accountService.account.Id) {
                    $scope.$on('profilePictureChanged', function(event, imageFileEntry) {
                        $scope.accountCommunity.ProfileImage = imageFileEntry;
                        updateProfilePictureUrl();
                    });
                }

                // Don't show compatibility with yourself.
                if(accountService.account && $scope.account.Id === accountService.account.Id) {
                    $scope.hideCompatibility = true;
                }
            }],
            link: function (scope, element, attrs) {



                scope.pictureClicked = function() {
                    modalService.closeAll();
                    if(scope.options && scope.options.onClick) {
                        scope.options.onClick(scope.account, scope.accountCommunity, scope.votable);
                    }
                };



            }
        };
    }]);