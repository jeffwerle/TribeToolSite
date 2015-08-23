angular.module('app.Services')
    .factory('scheduleService', ['$rootScope', 'commService', 'accountService', '$filter', 'communityService', function($rootScope, commService, accountService, $filter, communityService) {
        return {
            setAvailability: function(schedule, onSuccess, onFailure) {
                if(!accountService.account) {
                    if(onFailure)
                        onFailure('Please login.');
                    return;
                }

                commService.postWithParams('schedule', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Schedule: schedule,
                    RequestType: 'SetAvailability'
                }, onSuccess, onFailure);
            },
            /*
                teacherAccountId is optional. If specified, Only times for the given teacher will be returned.
             */
            getAvailableTimes: function(teacherAccountId, specializationId, onSuccess, onFailure) {
                commService.postWithParams('schedule', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetAvailableTimesOptions: {
                        TeacherAccountId: teacherAccountId,
                        SpecializationId: specializationId
                    },
                    RequestType: 'GetAvailableTimes'
                }, onSuccess, onFailure);
            },
            getUpcomingAppointments: function(onSuccess, onFailure) {
                commService.postWithParams('schedule', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetUpcomingAppointments'
                }, onSuccess, onFailure);
            },
            getTimeSlotFromDate: function(date, durationInMinutes) {
                return {
                    Date: date,
                    DurationInMinutes: durationInMinutes
                };
            },
            normalizeSchedule: function(schedule) {
                if(!schedule) {
                    return null;
                }

                var i = 0;
                if(schedule.CandidateTimeSlots) {
                    for(i = 0; i < schedule.CandidateTimeSlots.length; i++) {
                        var timeSlot = schedule.CandidateTimeSlots[i];
                        timeSlot.Date = this.normalizeDate(timeSlot.Date);
                    }
                }
                if(schedule.RecurringAppointments) {
                    for(i = 0; i < schedule.RecurringAppointments.length; i++) {
                        var recurringAppointment = schedule.RecurringAppointments[i];
                        recurringAppointment.Appointment.Date = this.normalizeDate(recurringAppointment.Appointment.Date);
                    }
                }
                if(schedule.Appointments) {
                    for(i = 0; i < schedule.Appointments.length; i++) {
                        var appointment = schedule.Appointments[i];
                        appointment.Date = this.normalizeDate(appointment.Date);
                    }
                }

                return schedule;
            },
            normalizeDate: function(date) {
                if(date instanceof Date)
                    return date;

                return new Date($filter('dateRobust')(date, 'M/d/yy h:mm:ss a'));
            },
            /* Gets the total number of minutes of the specified date. */
            getTotalMinutes: function(date) {
                return (date.getTime()/1000)/60;
            },
            /* Adds the specified number of minutes to the given date and returns the new date. */
            addMinutesToDate: function(date, minutes) {
                return new Date(date.getTime() + (minutes * 60 * 1000));
            },
            addHoursToDate: function(date, hours) {
                return new Date(date.getTime() + (hours*60*60*1000));
            },
            addDaysToDate: function(date, days) {
                return new Date(date.getTime() + (days*24*60*60*1000));
            },
            getTimeSlotStartDate: function(timeSlot) {
                return timeSlot.Date;
            },
            getTimeSlotEndDate: function(timeSlot) {
                return this.addMinutesToDate(timeSlot.Date, timeSlot.DurationInMinutes);
            },
            getDateFromTime: function(hours, minutes, date) {
                var now = new Date(date || new Date());
                now.setHours(0,0,0,0);
                return new Date(now.getTime() + (hours*60*60*1000) + (minutes * 60 * 1000));
            },
            /* Returns an Appointment if the given schedule has an appointment for the given TimeSlot. Otherwise, returns null. */
            getAppointmentInTimeSlot: function(schedule, timeSlot) {
                var timeSlotStart = this.getTimeSlotStartDate(timeSlot);
                var timeSlotEnd = this.getTimeSlotEndDate(timeSlot);

                var my = this;
                var doesAppointmentOverlapTimeSlot = function(appointment) {
                    var appointmentStart = my.getTimeSlotStartDate(appointment);
                    var appointmentEnd = my.getTimeSlotEndDate(appointment);

                    return ((appointmentStart >= timeSlotStart && appointmentStart < timeSlotEnd) ||
                        (timeSlotStart >= appointmentStart && timeSlotStart < appointmentEnd));
                };

                var i = 0;
                var appointment = null;
                if(schedule.RecurringAppointments) {
                    for(i = 0; i < schedule.RecurringAppointments.length; i++) {
                        appointment = schedule.RecurringAppointments[i].Appointment;
                        if(doesAppointmentOverlapTimeSlot(appointment)) {
                            return appointment;
                        }
                    }
                }

                if(schedule.Appointments) {
                    for(i = 0; i < schedule.Appointments.length; i++) {
                        appointment = schedule.Appointments[i];
                        if(doesAppointmentOverlapTimeSlot(appointment)) {
                            return appointment;
                        }
                    }
                }

                return null;
            },
            /* Converts the given day of the week string (such as 'Sunday') into its corresponding
            * number (such as 0).*/
            getDayFromDayOfWeek: function(dayOfWeek) {
                return dayOfWeek === 'Sunday' ? 0 :
                    dayOfWeek === 'Monday' ? 1 :
                        dayOfWeek === 'Tuesday' ? 2 :
                            dayOfWeek === 'Wednesday' ? 3 :
                                dayOfWeek === 'Thursday' ? 4 :
                                    dayOfWeek === 'Friday' ? 5 :
                                        6;
            },
            /* Converts the given day (such as 0) to its corresponding string (such as 'Sunday') */
            getDayOfWeekFromDay: function(day) {
                return day === 0 ? 'Sunday' :
                    day === 1 ? 'Monday' :
                        day === 2 ? 'Tuesday' :
                            day === 3 ? 'Wednesday' :
                                day === 4 ? 'Thursday' :
                                    day === 5 ? 'Friday' :
                                        'Saturday';
            },
            /* Gets a Date object for the given day of week.
             * dayOfWeek is string such as 'Saturday' */
            getDateForDayOfWeek: function(dayOfWeek) {
                var x = this.getDayFromDayOfWeek(dayOfWeek);
                var now = new Date();
                now.setHours(0,0,0,0);
                now.setDate(now.getDate() + (x+(7-now.getDay())) % 7);
                return now;
            },
            /* Gets the dates with free time slots */
            getFreeDates: function(schedule) {
                var now = new Date();
                var dates = [];
                for(var i = 0; i < schedule.CandidateTimeSlots.length; i++) {
                    var timeSlot = schedule.CandidateTimeSlots[i];
                    // Is there any appointment at this time slot?
                    var appointment = this.getAppointmentInTimeSlot(schedule, timeSlot);
                    if(!appointment) {
                        // The date of this time slot is valid!
                        var date = timeSlot.Date;
                        var hasDate = false;
                        for(var j = 0; j < dates.length; j++) {
                            if(dates[j].getDay() === date.getDay()) {
                                hasDate = true;
                                break;
                            }
                        }
                        if(!hasDate)
                        {
                            // If the date is the same as today (or in the past), move it forward a week
                            while(date <= now ||
                                date.getDate() === now.getDate()) {
                                date = this.addDaysToDate(date, 7);
                            }

                            dates.push(date);
                        }
                    }
                }
                return dates;
            },
            /*
                Gets the TimeSlots that are free and available on the given date according to the given schedule

                durationInMinutes: int, // the duration (in minutes) that the time slots should be in
             */
            getFreeTimeSlotsOnDate: function(schedule, date, durationInMinutes) {

                var normalizedTimeSlot = null;
                // First, get the candidate time slots on the date
                var timeSlots = [];
                for(var i = 0; i < schedule.CandidateTimeSlots.length; i++) {
                    var timeSlot = angular.copy(schedule.CandidateTimeSlots[i]);
                    if(timeSlot.Date.getDay() === date.getDay()) {

                        timeSlot.Date.setDate(date.getDate());

                        var normalizedTimeSlots = [];
                        if(timeSlot.DurationInMinutes > 0 &&
                            durationInMinutes && durationInMinutes > 0) {
                            // Break up the time slot to be in units of the proper duration

                            var timeSlotStart = this.getTimeSlotStartDate(timeSlot);
                            var timeSlotEnd = this.getTimeSlotEndDate(timeSlot);
                            var timeSlotEndInMinutes = this.getTotalMinutes(timeSlotEnd);

                            // Now move along in 15 minute intervals until we can no longer fit
                            // in a time slot of the requested duration
                            var interval = 15;
                            var minutesToAdd = 0;
                            while(true)
                            {
                                normalizedTimeSlot = this.getTimeSlotFromDate(this.addMinutesToDate(timeSlotStart, minutesToAdd), durationInMinutes);
                                // Does this time slot spill over the boundaries of the larger time slot? If so,
                                // we can't use it and we're done.
                                var normalizedTimeSlotEndInMinutes = this.getTotalMinutes(this.getTimeSlotEndDate(normalizedTimeSlot));
                                if(normalizedTimeSlotEndInMinutes > timeSlotEndInMinutes) {
                                    break;
                                }
                                else {
                                    normalizedTimeSlots.push(normalizedTimeSlot);
                                }

                                minutesToAdd += interval;
                            }
                        }
                        else {
                            normalizedTimeSlots.push(timeSlot);
                        }

                        for(var j = 0; j < normalizedTimeSlots.length; j++) {
                            normalizedTimeSlot = normalizedTimeSlots[j];
                            // Now, is there any appointment at this normalized time
                            // slot? If not, we can use it
                            var appointment = this.getAppointmentInTimeSlot(schedule, normalizedTimeSlot);
                            if(!appointment) {
                                timeSlots.push(normalizedTimeSlot);
                            }
                        }
                    }
                }

                return timeSlots;
            }
        };
    }]);