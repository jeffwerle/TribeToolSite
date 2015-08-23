angular.module('app.Directives')
    .directive('profileName', ['profileService', 'accountService', 'communityService', 'modalService', function (profileService, accountService, communityService, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<a class="action-link info-text-color profile-name" style="margin-right: 0px;" ng-href="{{::link}}" ng-click="nameClicked()">{{::fullName}}</a>',
            scope: {
                votable: '=?',
                account: '=?',
                /* the CommunityEntry of the profile to view upon click */
                community: '=?',
                /*
                 {
                 onClick(),
                 url: string, // this will be populated by this directive. This is the url to the profile
                 }
                 */
                options: '=?'
            },
            controller: ['$scope', 'OPTIONS', function($scope, OPTIONS) {
                if($scope.votable) {
                    if($scope.votable.IsAnonymous || !$scope.votable.Account) {
                        $scope.fullName = 'Anonymous';
                        $scope.usernameWithSlash = '';
                    }
                    else {
                        $scope.account = $scope.votable.Account;
                    }
                }
                else {
                    if(!$scope.account)
                        $scope.account = accountService.account;
                }

                if($scope.account) {
                    $scope.fullName = profileService.getProfileFullName($scope.account);
                    $scope.usernameWithSlash = '/' + $scope.account.Username;
                }

                if(!$scope.community)
                    $scope.community = $scope.account && $scope.account.Community ? $scope.account.Community : communityService.community;
                $scope.communityUrl = $scope.community ? $scope.community.Url : null;

                $scope.link = (OPTIONS.isMobile ? '#/' : '') + ('profile/' + $scope.communityUrl + $scope.usernameWithSlash);

                if($scope.options) {
                    $scope.options.url = $scope.link;
                }

            }],
            link: function (scope, element, attrs) {

                scope.nameClicked = function() {
                    modalService.closeAll();
                    if(scope.options && scope.options.onClick) {
                        scope.options.onClick();
                    }
                };
            }
        };
    }])
    .directive('profilePictureLevelProgress', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="profile-picture-progress-bar-container">' +
                        '<div class="profile-picture-progress-bar"></div>' +
                    '</div>' +
                    '<div class="centered profile-picture-level" ng-show="showLevel">{{level}}</div>' +
                '</div>',
            scope: {
                accountCommunity: '=',
                showLevel: '='
            },
            link: function (scope, element, attrs) {
                var bar = element.find('.profile-picture-progress-bar');

                var updatePercentage = function(level) {
                    scope.level = level.Level;
                    var levelPercentage = ((level.XP - level.BaseLevelXP) / (level.NextLevelXP - level.BaseLevelXP)) * 100;
                    bar.width(levelPercentage + '%');
                };

                scope.$watch(scope.accountCommunity, function() {
                    if(scope.accountCommunity)
                        updatePercentage(scope.accountCommunity.Level);
                });

                scope.$on('xpChanged', function(event, accountCommunity) {
                    if(!scope.accountCommunity ||
                        scope.accountCommunity.AccountId !== accountCommunity.AccountId)
                        return;

                    updatePercentage(accountCommunity.Level);
                });


            }
        };
    }]);