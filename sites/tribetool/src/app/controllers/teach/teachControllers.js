angular.module('app.Controllers')
    .controller('teachController', ['$scope', 'accountService', 'navigationService', 'teacherService', 'commService', 'profileService', 'scheduleService', function($scope, accountService, navigationService, teacherService, commService, profileService, scheduleService) {
        if(!accountService.isLoggedInAndConfirmed() || !accountService.isTeacher()) {
            navigationService.goToLogin();
            return;
        }

        $scope.studentPictureOptions = {
            constructLinkUrl: function(account, accountCommunity, student) {
                return '/student/' + student.DisciplineUrl + '/' + student.SpecializationUrl + '/' + account.Username;
            },
            onClick: function(account, accountCommunity) {

            }
        };

        $scope.fullName = profileService.getProfileFullName(accountService.account);

        $scope.upcomingAppointmentsReady = false;
        $scope.prepareUpcomingAppointments = function() {
            // Get the student's picture for each appointment
            for(var i = 0; i < $scope.upcomingAppointments.length; i++) {
                var appointment = $scope.upcomingAppointments[i];

                for(var j = 0; j < $scope.students.length; j++) {
                    var student = $scope.students[j];
                    if(student.Account.Id === appointment.StudentAccountId) {
                        appointment.student = student;
                        break;
                    }
                }
            }
            $scope.upcomingAppointmentsReady = true;
        };

        // Get the teacher's students
        teacherService.getStudents(function(data) {
            // Success
            $scope.students = data.Students;

            if($scope.upcomingAppointments) {
                $scope.prepareUpcomingAppointments();
            }
        }, function(data) {
            // Failure
            commService.showErrorAlert(data);
        });

        scheduleService.getUpcomingAppointments(function(data) {
            // Success
            $scope.upcomingAppointments = data.UpcomingAppointments;

            if($scope.students) {
                $scope.prepareUpcomingAppointments();
            }

        }, function(data) {
            // Failure
            commService.showErrorAlert('Error gathering upcoming appointments!');
            commService.showErrorAlert(data);
        });

        $scope.modifyingSchedule = false;
        $scope.schedule = accountService.account.Schedule.Schedule;
        $scope.scheduleOptions = {
            onCancel: function() {
                $scope.modifyingSchedule = false;
            },
            onSave: function(schedule) {
                $scope.modifyingSchedule = false;

                accountService.account.Schedule.Schedule.CandidateTimeSlots = schedule.CandidateTimeSlots;
                $scope.schedule = schedule;
            }
        };
    }]);