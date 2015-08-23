angular.module('app.Controllers')
    .controller('studentController', ['$scope', 'accountService', 'navigationService', 'teacherService', 'commService', '$routeParams', 'profileService', function($scope, accountService, navigationService, teacherService, commService, $routeParams, profileService) {
        if(!accountService.isLoggedInAndConfirmed() || !accountService.isTeacher()) {
            navigationService.goToLogin();
            return;
        }

        // Get the student information
        $scope.addingLesson = false;
        $scope.cancelAddingLesson = function(privateLesson) {
            if(privateLesson) {
                // Add the lesson
                $scope.lessons.push(privateLesson);
            }

            $scope.addingLesson = false;
        };

        $scope.lessons = [];
        teacherService.getStudent($routeParams.username,
            $routeParams.disciplineUrl,
            $routeParams.specializationUrl,
            function(data) {
                // Success
                $scope.student = data.Student;
                $scope.specializationEntry = data.SpecializationEntry;
                $scope.accountSpecialization = data.AccountSpecialization;
                $scope.lessons = data.PrivateLessons;

                $scope.profilePictureUrl = profileService.getProfilePictureUrl($scope.student.Account.AccountCommunity);
                $scope.fullName = profileService.getProfileFullName($scope.student.Account);
            }, function(data) {
                // Failure
                commService.showErrorAlert(data);
            });
    }]);