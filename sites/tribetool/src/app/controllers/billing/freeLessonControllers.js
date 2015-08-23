angular.module('app.Controllers')
    .controller('freeLessonController', ['$scope', '$modalInstance', 'items', 'accountService', 'scheduleService', 'commService', 'communityService', 'specializationService', '$filter', 'navigationService', function($scope, $modalInstance, items, accountService, scheduleService, commService, communityService, specializationService, $filter, navigationService) {
        $scope.isLoggedIn = accountService.isLoggedIn();

        $scope.options = items[0];
        $scope.specializationId = $scope.options.specializationId;
        if(!$scope.specializationId) {
            commService.showErrorAlert('A SpecializationId must be provided.');
        }

        $scope.stage = $scope.isLoggedIn ? 'PickTime' : 'SignUp';

        $scope.times = [];
        for(var i = 0; i < 3; i++) {
            $scope.times.push({
                selectedDate: null,
                selectedTime: null
            });
        }

        // Has the user already taken their free lesson for this specialization?
        $scope.hasTakenFreeLesson = false;
        $scope.checkIfTakenFreeLesson = function() {
            var accountSubscription = accountService.getAccountSubscription($scope.specializationId);
            if(accountSubscription) {
                $scope.hasTakenFreeLesson = true;
            }
        };

        if($scope.isLoggedIn) {
            $scope.checkIfTakenFreeLesson();
        }

        // Get the availability schedule
        $scope.schedule = null;
        scheduleService.getAvailableTimes(/*teacherAccountId*/null,
            $scope.specializationId,
            function(data) {
                // Success
                $scope.schedule = data.Schedule;
            }, function(data) {
                // Failure
                commService.showErrorAlert(data);
            });

        $scope.goToLogin = function() {
            $scope.stage = 'Login';
        };
        $scope.goToSignUp = function() {
            $scope.stage = 'SignUp';
        };

        $scope.goToPickTime = function() {
            $scope.stage = 'PickTime';
        };
        $scope.goToSuccess = function() {
            $scope.stage = 'Success';
        };

        $scope.signUpOptions = {
            onGoToLogin: function() {
                $scope.goToLogin();
            },
            onSuccess: function() {
                $scope.checkIfTakenFreeLesson();
                $scope.goToPickTime();
            },
            onConfirmationLinkFailure: function() {
                $scope.goToLogin();
            },
            onCancel: function() {
                $scope.cancel();
            }
        };

        $scope.loginOptions = {
            onGoToSignUp: function() {
                $scope.goToSignUp();
            },
            onSuccess: function() {
                $scope.checkIfTakenFreeLesson();
                $scope.goToPickTime();
            },
            onCancel: function() {
                $scope.cancel();
            }
        };

        $scope.goToLearnDashboard = function() {
            navigationService.goToPath('/learn');
            $scope.cancel();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.profileNameOptions = {
            onClick: function() {
                // User clicked on the teacher profile picture
                $scope.cancel();
            }
        };

        $scope.processing = false;
        $scope.startTrial = function() {
            $scope.processing = true;
            var times = [];
            for(var i = 0; i < $scope.times.length; i++) {
                var time = $scope.times[i];
                var timeSlot = time.selectedTime.timeSlot;
                times.push(timeSlot);
            }

            specializationService.startTrial($scope.specializationId, times,
                function(data) {
                    // Success
                    $scope.freeLessonAppointment = data.LessonAppointment;
                    $scope.teacher = data.Teacher;
                    $scope.goToSuccess();
                    $scope.processing = false;
                    commService.showSuccessAlert('Your lesson has been scheduled for ' + $filter('dateRobust')($scope.freeLessonAppointment.Date, 'MMM d, y h:mm a') + '!');

                }, function(data) {
                    // Failure
                    $scope.processing = false;
                    commService.showErrorAlert(data);
                });
        };
    }]);