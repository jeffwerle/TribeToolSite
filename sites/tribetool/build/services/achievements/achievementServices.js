angular.module('app.Services')
    .factory('achievementService', ['$rootScope', 'commService', 'accountService', 'communityService', 'navigationService', function($rootScope, commService, accountService, communityService, navigationService) {
        return {
            getAchievements: function(account, onSuccess, onFailure) {
                commService.postWithParams('achievement', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetAchievementsOptions: {
                        AchievementAccountId: account.Id
                    },
                    RequestType: 'GetAchievements'
                }, onSuccess, onFailure);
            },
            getAchievementUrl: function(profile, achievement, community) {
                return navigationService.getProfileUrl(profile, community) + '/achievements?achievement=' + achievement.Id;
            }
        };
    }]);