angular.module('app.Services')
    .factory('specializationService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            getSpecialization: function(disciplineUrl, specializationUrl, onSuccess, onFailure) {
                commService.postWithParams('specialization', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetSpecializationOptions: {
                        DisciplineUrl: disciplineUrl,
                        SpecializationUrl: specializationUrl
                    },
                    RequestType: 'GetSpecialization'
                }, onSuccess, onFailure);
            },
            startTrial: function(specializationId, times, onSuccess, onFailure) {
                commService.postWithParams('specialization', {
                    Credentials: accountService.getCredentials(communityService.community),
                    SpecializationId: specializationId,
                    StartTrialOptions: {
                        Times: times
                    },
                    RequestType: 'StartTrial'
                }, onSuccess, onFailure);
            },
            getUnlockedSteps: function(specializationId, onSuccess, onFailure) {
                commService.postWithParams('skilltree', {
                    Credentials: accountService.getCredentials(communityService.community),
                    SpecializationId: specializationId,
                    RequestType: 'GetUnlockedSteps'
                }, onSuccess, onFailure);
            }
        };
    }]);