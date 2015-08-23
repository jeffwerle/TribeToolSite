angular.module('app.Directives')
    .directive('profilePage', ['profileDirectiveService', 'profileService', function (profileDirectiveService, profileService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="profileService.currentProfile">' +
                        '<profile-page-router></profile-page-router>' +
                    '</div>' +

                    '<div ng-show="!profileService.currentProfile">' +
                        '<loading></loading> Loading Profile...' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {

                scope.profileService = profileService;

                profileDirectiveService.initializeProfilePageScope(scope);
            }
        };
    }])

    .directive('profilePageRouter', ['headerService', 'profileService', function (headerService, profileService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<profile-default-page></profile-default-page>' +
                '</div>',
            link: function (scope, element, attrs) {

                var onProfilePageLoaded = function() {
                    headerService.setTitle(profileService.getProfileFullName());
                };
                onProfilePageLoaded();
                scope.$on('router:profilePageLoaded', function() {
                    onProfilePageLoaded();
                });
            }
        };
    }])
    .directive('profileDefaultPage', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>' +
                        '<profile-page-profile-picture></profile-page-profile-picture>' +
                        '<profile-left-sidebar></profile-left-sidebar>' +
                    '</div>' +
                    '<stream></stream>' +
                '</div>',
            link: function (scope, element, attrs) {
            }
        };
    }])

    .directive('profileLeftSidebar', ['profileService', 'accountService', 'communityService', '$timeout', 'navigationService', function (profileService, accountService, communityService, $timeout, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="list card profile-sidebar centered">' +
                        '<div class="item item-body">' +
                            '<div ng-if="!isSelfProfile && accountCommunity.Compatibility.LowestPossibleCompatibility > 0" ng-click="compatibilityClicked()" class="pointer" style="margin-bottom: 5px;"><span class="bold">Compatibility</span> {{::accountCommunity.Compatibility.LowestPossibleCompatibility}}%</div>' +
                            '<div><label>Total XP</label> {{::accountCommunity.Level.XP}}</div>' +
                            '<div><label>XP to Next Level</label> {{::accountCommunity.Level.NextLevelXP - accountCommunity.Level.XP}}</div>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.profile = profileService.currentProfile;
                scope.isLoggedIn = accountService.isLoggedIn();




            }
        };
    }])
    .directive('profilePageProfilePicture', ['profileDirectiveService', function (profileDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div id="profilePageProfilePicture" class="centered">' +
                    '<h4>{{fullName}}</h4>' +
                    '<div ng-show="settingProfilePicture"><loading></loading> Setting Profile Picture...</div>' +
                    '<div ng-show="!settingProfilePicture">' +
                        '<div class="profile-picture-container">' +
                            '<img show-light-box="showLightBoxOptions" class="profile-picture" ng-src="{{profilePictureUrl | trusted}}" ng-click="profilePictureClicked()">' +

                            '<div id="profilePageProfilePictureProgress" class="profile-picture-width centered">' +
                                '<profile-picture-level-progress class="" show-level="showLevel" account-community="accountCommunity"></profile-picture-level-progress>' +
                                '<div style="font-weight: bold;">Level {{accountCommunity.Level.Level}}</div>' +

                            '</div>' +
                        '</div>' +

                        '<div ng-show="canChangeProfilePicture">' +
                            '<a ng-show="accountCommunity.ProfileImage" class="post-action-link" ng-click="changeProfilePicture()"><i class="icon ion-image"></i> Change Profile Picture</a>' +
                            '<a ng-show="!accountCommunity.ProfileImage" style="color: blue; font-weight: bolder; font-size:20px;" class="post-action-link" ng-click="changeProfilePicture()"><i class="icon ion-image"></i> Add Profile Picture</a>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                profileDirectiveService.initializeProfilePageProfilePictureScope(scope);
            }
        };
    }]);