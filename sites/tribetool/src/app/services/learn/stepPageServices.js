angular.module('app.Services')
    .factory('stepPageService', ['$rootScope', 'commService', 'accountService', 'communityService', 'fileService', function($rootScope, commService, accountService, communityService, fileService) {
        return {
            getStepPage: function(disciplineUrl, specializationUrl, stepPageUrl, onSuccess, onFailure) {
                commService.postWithParams('steppage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetStepPageOptions: {
                        DisciplineUrl: disciplineUrl,
                        SpecializationUrl: specializationUrl,
                        StepPageUrl: stepPageUrl
                    },
                    RequestType: 'GetStepPage'
                }, onSuccess, onFailure);
            },
            editStepPage: function(stepPage, onSuccess, onFailure) {
                commService.postWithParams('steppage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    StepPage: stepPage,
                    RequestType: 'EditStepPage'
                }, onSuccess, onFailure);
            },
            setMainImage: function(imageFileEntry, stepPage, onSuccess, onFailure) {
                commService.postWithParams('steppage', {
                    Credentials: accountService.getCredentials(communityService.community),
                    StepPage: stepPage,
                    MainImage: imageFileEntry,
                    RequestType: 'SetMainImage'
                }, onSuccess, onFailure);
            },
            selectFile: function(onSelect, stepPageEntry) {
                fileService.selectFile(onSelect,
                    {
                        getFiles: function(onSuccess, onFailure) {
                            onSuccess({
                                Files: stepPageEntry.Files
                            });
                        },
                        stepPage: stepPageEntry
                    });
            }
        };
    }]);