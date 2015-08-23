angular.module('app.Directives')
    .directive('scheduleTimeSlot', ['commService', function (commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="schedule-slot" ng-click="clicked()" ng-class="{\'free-slot\': timeSlot && timeSlot.isFree, \'booked-slot\': timeSlot && timeSlot.isCandidate && !timeSlot.isFree}">' +
                '</div>',
            scope: {
              timeSlot: '=',
                /* 'SetAvailability', 'ChooseTime', 'View' */
              scheduleMode: '='
            },
            link: function (scope, element, attrs) {
                scope.clicked = function() {
                    if(scope.scheduleMode === 'SetAvailability') {
                        if(scope.timeSlot.isCandidate && !scope.timeSlot.isFree) {
                            // The user already has an appointment here so they can't unselect this time slot
                            commService.showErrorAlert('You are already booked in this time slot so it cannot be unselected.');
                        }
                        else {
                            scope.timeSlot.isCandidate = !scope.timeSlot.isCandidate;
                            scope.timeSlot.isFree = scope.timeSlot.isCandidate;
                        }
                    }
                };
            }
        };
    }])
    .directive('schedule', ['$compile', 'scheduleService', 'commService', 'accountService', function ($compile, scheduleService, commService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Saving...</div>' +
                    '<div ng-show="!processing">' +
                        '<div class="schedule" style="width: 400px;">' +
                            '<div class="schedule-key">' +
                                '<span>' +
                                    '<span class="free-slot-swatch"></span><span>Available</span>' +
                                '</span>' +
                                '<span>' +
                                    '<span class="unfree-slot-swatch"></span><span>Unavailable</span>' +
                                '</span>' +
                                '<span>' +
                                    '<span class="booked-slot-swatch"></span><span>Booked</span>' +
                                '</span>' +
                            '</div>' +
                            '<div class="schedule-calendar" id="calendar">' +
                                '<div class="day-of-week-row" id="dayOfWeekRow"></div>' +
                                '<div class="time-column" id="timeColumn"></div>' +
                            '</div>' +
                            '<div ng-show="scheduleMode === \'SetAvailability\'" style="margin-top: 20px;">' +
                                '<button class="btn btn-warning pull-right" ng-click="cancel()" style="margin-left: 20px;">Cancel</button>' +
                                '<button class="btn btn-primary pull-right" ng-click="save()">Save</button>' +

                            '</div>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                schedule: '=', // UTC Schedule object
                /* 'SetAvailability', 'ChooseTime', 'View' */
                scheduleMode: '=',
                /*
                 {
                    onSave(schedule), // called when the user successfully saves their schedule
                    onCancel(schedule)
                 }
                * */
                options: '='
            },
            link: function (scope, element, attrs) {

                scope.schedule = scheduleService.normalizeSchedule(scope.schedule);

                scope.cancel = function() {
                    if(scope.options.onCancel) {
                        scope.options.onCancel();
                    }
                };

                var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                var i = 0;
                var calendarElement = $('#calendar');
                var dayOfWeekRow = $('#dayOfWeekRow');
                var dayOfWeek = null;
                for(i = 0; i < daysOfWeek.length; i++) {
                    dayOfWeek = daysOfWeek[i];
                    calendarElement.append('<div class="day-of-week-column" id="' + dayOfWeek + '"></div>');
                    dayOfWeekRow.append('<span>' + dayOfWeek.substring(0, 1).toUpperCase() + '</span>');
                }


                var getTimeSlot = function(dayOfWeek, hours, minutes) {
                    if(scope.schedule) {
                        var isTimeSlotApplicable = function(t) {
                            return scheduleService.getDayOfWeekFromDay(t.Date.getDay()) === dayOfWeek &&
                                t.Date.getHours() === hours &&
                                t.Date.getMinutes() === minutes;
                        };

                        for(var i = 0; i < scope.schedule.CandidateTimeSlots.length; i++) {
                            var timeSlot = scope.schedule.CandidateTimeSlots[i];
                            if(isTimeSlotApplicable(timeSlot)) {

                                // This time slot is part of the schedule so it's available (potentially).
                                // Let's see if there are any appointments in this time slot
                                var appointment = scheduleService.getAppointmentInTimeSlot(scope.schedule, timeSlot);

                                if(appointment) {
                                    return {
                                        isCandidate: true,
                                        isFree: false,
                                        timeSlot: timeSlot,
                                        appointment: appointment
                                    };
                                }
                                else {

                                    return {
                                        isCandidate: true,
                                        isFree: true,
                                        timeSlot: timeSlot
                                    };
                                }
                            }
                        }
                    }

                    var dateForDayOfWeek = scheduleService.getDateForDayOfWeek(dayOfWeek);
                    return {
                        isCandidate: false,
                        isFree: false,
                        timeSlot: {
                            Date: scheduleService.getDateFromTime(hours, minutes, dateForDayOfWeek),
                            DurationInMinutes: 30
                        }
                    };
                };

                scope.timeSlotScopes = [];
                var timeColumn = $('#timeColumn');
                var startHour = 8;
                var endHour = 20;
                for(i = startHour; i <= endHour; i++) {
                    var time = {
                        hour: i,
                        name: i === 12 ? 'Noon' : i === 0 || i === 24 ? 'Midnight' : i < 12 ? i + 'am' : (i - 12) + 'pm'
                    };
                    timeColumn.append('<div>' + time.name + '</div>');
                    for(var j = 0 ; j < daysOfWeek.length; j++) {
                        dayOfWeek = daysOfWeek[j];
                        var dayOfWeekColumn = $('#' + dayOfWeek);

                        // 2 30-minute time slots to each hour
                        for(var k = 0; k < 2; k++) {
                            // Determine if there's an appointment at this hour
                            var timeSlot = getTimeSlot(dayOfWeek, time.hour, (k * 30)/*30 for half hour (in minutes)*/);

                            var newScope = scope.$new(/*isolate*/true);
                            newScope.timeSlot = timeSlot;
                            newScope.scheduleMode = scope.scheduleMode;
                            scope.timeSlotScopes.push(newScope);

                            var html = '<schedule-time-slot time-slot="timeSlot" schedule-mode="scheduleMode"></schedule-time-slot>';
                            var compiled = $compile(html);
                            var htmlCompiled = compiled(newScope);
                            dayOfWeekColumn.append(htmlCompiled);
                        }


                    }
                }

                scope.save = function() {
                    if(scope.scheduleMode === 'SetAvailability') {
                        // Submit the schedule
                        var candidateTimeSlots = [];
                        for(var i = 0; i < scope.timeSlotScopes.length; i++) {
                            var timeSlotScope = scope.timeSlotScopes[i];
                            var timeSlot = timeSlotScope.timeSlot;

                            if(timeSlot.isCandidate) {
                                candidateTimeSlots.push(timeSlot.timeSlot);
                            }
                        }

                        var newSchedule = {
                            CandidateTimeSlots: candidateTimeSlots
                        };

                        scope.processing = true;
                        scheduleService.setAvailability(newSchedule, function(data) {
                            scope.processing = false;
                            // Success
                            if(data.Schedule && accountService.account) {
                                // We received the UTC schedule
                                if(!accountService.account.Schedule) {
                                    accountService.account.Schedule = {};
                                }
                                accountService.account.Schedule.Schedule = data.Schedule;
                                scope.schedule = data.Schedule;
                            }

                            commService.showSuccessAlert('Schedule updated successfully!');

                            if(scope.options && scope.options.onSave) {
                                scope.options.onSave(scope.schedule);
                            }
                        }, function(data) {
                            scope.processing = false;
                            // Failure
                            commService.showErrorAlert(data);
                        });
                    }

                };
            }
        };
    }])

    .directive('lessonTimePicker', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<p class="input-group">'+
                        '<input type="text" class="form-control" datepicker-popup="{{format}}" ng-model="selectedDate" show-weeks="false" is-open="isDatePickerOpen" min-date="minDate" max-date="maxDate" datepicker-options="dateOptions" date-disabled="isDateDisabled(date, mode)" ng-required="true" close-text="Close" show-button-bar="false" min-mode="day" max-mode="day" ng-change="dateChanged()" />'+
                        '<span class="input-group-btn">'+
                            '<button type="button" class="btn btn-default" ng-click="openDatePicker($event)"><i class="glyphicon glyphicon-calendar"></i></button>'+
                        '</span>'+
                        '<select style="margin-left: 20px;" ng-model="selectedTime" ng-options="time.label for time in times track by time.label" class="form-control" required ng-change="timeChanged()"></select>' +
                    '</p>'+
                '</div>',
            scope: {
                index: '=?', // The index of the date to choose by default
                schedule: '=', // The UTC availability schedule,
                selectedDate: '=', // The local selected time
                /* The duration that the lesson will be (in minutes) */
                lessonDurationInMinutes: '=',
                /*
                Format:
                {
                    label: string,
                    timeSlot: TimeSlot
                }
                 */
                selectedTime: '='
            },
            controller: ['$scope', 'scheduleService', '$timeout', '$filter', function($scope, scheduleService, $timeout, $filter) {

                $scope.schedule = scheduleService.normalizeSchedule($scope.schedule);

                // The time must be chosen within the next 2 weeks
                var freeDates = scheduleService.getFreeDates($scope.schedule);
                $scope.minDate = freeDates[0];
                for(var i = 0; i < freeDates.length; i++) {
                    if(freeDates[i] < $scope.minDate) {
                        $scope.minDate = freeDates[i];
                    }
                }
                $scope.minDate = new Date($scope.minDate);
                $scope.maxDate = scheduleService.addDaysToDate($scope.minDate, 14);
                $scope.selectedDate = angular.isDefined($scope.index) ? freeDates.length > $scope.index ? freeDates[$scope.index] : freeDates[freeDates.length - 1] : $scope.minDate;


                $scope.clear = function () {
                    $scope.selectedDate = null;
                };

                $scope.dateChanged = function() {
                    var timeSlots = scheduleService.getFreeTimeSlotsOnDate($scope.schedule, $scope.selectedDate, $scope.lessonDurationInMinutes);
                    $scope.times = [];
                    for(var i = 0; i < timeSlots.length; i++) {
                        var timeSlot = timeSlots[i];
                        $scope.times.push({
                            label: $filter('date')(timeSlot.Date, 'shortTime'),
                            timeSlot: timeSlot
                        });
                    }
                    $scope.selectedTime = $scope.times[0];
                };
                $scope.dateChanged();

                $scope.timeChanged = function() {
                };

                // Disable selection on a day where lessons are not available
                $scope.isDateDisabled = function(date, mode) {
                    if(date < $scope.minDate.setHours(0,0,0,0) || date > $scope.maxDate.setHours(0,0,0,0)) {
                        return true;
                    }

                    var freeTimeSlots = scheduleService.getFreeTimeSlotsOnDate($scope.schedule, date);
                    if(!freeTimeSlots || freeTimeSlots.length <= 0) {
                        // There are no free times on this date so it's disabled.
                        return true;
                    }

                    return false;
                };


                $scope.openDatePicker = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.isDatePickerOpen = true;
                };

                $scope.dateOptions = {
                    formatYear: 'yy',
                    startingDay: 1
                };

                //$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = 'fullDate';
            }],
            link: function (scope, element, attrs) {
            }
        };
    }]);