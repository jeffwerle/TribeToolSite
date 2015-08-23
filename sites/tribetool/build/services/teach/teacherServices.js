angular.module('app.Services')
    .factory('teacherService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            getStudents: function(onSuccess, onFailure) {
                if(!accountService.isTeacher()) {
                    if(onFailure)
                        onFailure('Unauthorized.');
                    return;
                }

                commService.postWithParams('teacher', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetStudents'
                }, onSuccess, onFailure);
            },
            getStudent: function(username, disciplineUrl, specializationUrl, onSuccess, onFailure) {
                if(!accountService.isTeacher()) {
                    if(onFailure)
                        onFailure('Unauthorized.');
                    return;
                }

                commService.postWithParams('teacher', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetStudentOptions: {
                        Username: username,
                        DisciplineUrl: disciplineUrl,
                        SpecializationUrl: specializationUrl
                    },
                    RequestType: 'GetStudent'
                }, onSuccess, onFailure);
            }
        };
    }]);