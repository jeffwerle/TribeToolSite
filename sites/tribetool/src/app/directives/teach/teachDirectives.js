angular.module('app.Directives')
    .directive('teacherLesson', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<label>Date: </label>' +
                    '<div>{{lesson.Date | dateRobust: \'medium\'}}</div>' +

                    '<div>' +
                        '<youtube video-id="{{lesson.VideoId}}"></youtube>' +
                    '</div>' +

                    '<label>Teacher Notes: </label>' +
                    '<div>{{lesson.TeacherNotes}}</div>' +

                    '<label>Teacher Notes to Student: </label>' +
                    '<div>{{lesson.TeacherNotesToStudent}}</div>' +
                '</div>',
            scope: {
                lesson: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('submitStudentPrivateLesson', ['accountService', 'lessonService', 'commService', function (accountService, lessonService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +

                    '<form ng-submit="submit()">' +


                        '<div class="row">' +
                            '<div style="margin-bottom: 0px;" class="well">' +
                                '<h3 class="centered">Topics Covered In Lesson</h3>' +
                                '<div class="row" ng-repeat="chosenStep in form.ChosenSteps">' +

                                    '<div style="margin-top: 20px;">' +
                                        '<div class="col-sm-3">' +
                                            '<label class="pull-right">Topic {{$index + 1}}</label>' +
                                        '</div>' +
                                        '<div class="col-sm-7">' +
                                            '<select class="form-control" required ng-model="chosenStep.stepProgress" ng-options="stepProgress.displayText for stepProgress in stepOptions track by stepProgress">' +
                                            '</select>' +
                                        '</div>' +
                                        '<div class="col-sm-1">' +
                                            '<button class="btn btn-danger" ng-click="removeChosenStep(chosenStep, $index)"><i class="fa fa-times"></i></button>' +
                                        '</div>' +
                                    '</div>' +

                                '</div>' +
                            '</div>' +
                            '<div class="clearfix"></div>' +
                            '<button class="btn btn-primary pull-right" type="button" ng-click="addChosenStep()"><i class="fa fa-plus"></i> Add Topic</button>' +
                        '</div>' +

                        '<div style="margin-top: 20px;">' +
                            '<label>Your Notes (student won\'t see these):</label>' +
                            '<content-editor show-toolbar="true" placeholder="\'Your Notes...\'" is-required="true" options="formattingHelperOptions" text="form.TeacherNotes"></content-editor>' +
                        '</div>' +
                        '<div style="margin-top: 20px;">' +
                            '<label>Notes/Comments To Student (student WILL see these):</label>' +
                            '<content-editor show-toolbar="true" placeholder="\'Comments to Student...\'" is-required="true" options="formattingHelperOptions" text="form.TeacherNotesToStudent"></content-editor>' +
                        '</div>' +

                        '<get-youtube-url style="margin-top: 20px;" video-id="videoId"></get-youtube-url>' +


                        '<div style="margin-top:20px;">' +
                            '<button class="btn btn-primary pull-right" type="button" style="margin-left: 20px;" ng-click="cancel()">Cancel</button>' +
                            '<button class="btn btn-warning pull-right" type="submit">Submit</button>' +
                        '</div>' +
                        '<div class="clearfix"></div>' +
                    '</form>' +
                '</div>',
            scope: {
                student: '=',
                specializationEntry: '=',
                accountSpecialization: '=',
                /* function(privateLesson) */
                onCancel: '=?'
            },
            link: function (scope, element, attrs) {
                scope.videoId = '';

                scope.formattingHelperOptions = {
                };

                scope.cancel = function(privateLesson) {
                    if(scope.onCancel) {
                        scope.onCancel(privateLesson);
                    }
                };

                scope.form = {
                    TeacherNotes: '',
                    TeacherNotesToStudent: '',
                    ChosenSteps: [{

                    }]
                };

                scope.addChosenStep = function() {
                    scope.form.ChosenSteps.push({
                        Text: ''
                    });
                };
                scope.removeChosenStep = function(chosenStep, $index) {
                    scope.form.ChosenSteps.splice($index, 1);
                };

                var getStep = function(stepId) {
                    var steps = scope.specializationEntry.SkillTree.Steps;
                    for(var i = 0 ; i < steps.length; i++) {
                        var step = steps[i];
                        if(step.Id === stepId) {
                            return step;
                        }
                    }
                };
                // Get the steps that are unlocked for the student (those are the steps that could possibly
                // have been covered in the lesson).
                // It may also be a step that's already complete
                scope.unlockedSteps = [];
                scope.completedSteps = [];
                var stepProgresses = scope.accountSpecialization.SkillTree.Steps;
                for(var i = 0; i < stepProgresses.length; i++) {
                    var stepProgress = stepProgresses[i];
                    var step = getStep(stepProgress.StepId);
                    stepProgress.Step = step;
                    stepProgress.displayText = stepProgress.Step.Name;

                    if(stepProgress.IsComplete) {
                        stepProgress.displayText = '(complete) ' + stepProgress.displayText;
                        scope.completedSteps.push(stepProgress);
                    }
                    else if(stepProgress.IsUnlocked) {
                        scope.unlockedSteps.push(stepProgress);
                    }
                }
                scope.stepOptions = scope.unlockedSteps.concat(scope.completedSteps);

                scope.submit = function() {
                    if(!scope.videoId) {
                        commService.showErrorAlert('A valid YouTube Url must be provided.');
                        return;
                    }

                    var privateLesson = {
                        StudentAccountId: scope.student.Account.Id,
                        TeacherAccountId: accountService.account.Id,
                        SpecializationId: scope.specializationEntry.Id,
                        TeacherNotes: scope.form.TeacherNotes,
                        TeacherNotesToStudent: scope.form.TeacherNotesToStudent,
                        VideoId: scope.videoId,
                        Steps: []
                    };

                    if(scope.form.ChosenSteps.length <= 0) {
                        commService.showErrorAlert('At least one Topic must be selected.');
                        return;
                    }

                    for(var i = 0; i < scope.form.ChosenSteps.length; i++) {
                        var chosenStep = scope.form.ChosenSteps[i];
                        if(!chosenStep.stepProgress) {
                            commService.showErrorAlert('Topic ' + (i + 1) + ' cannot be empty.');
                            return;
                        }
                        privateLesson.Steps.push(chosenStep.stepProgress.Step.Id);
                    }

                    // Submit the lesson
                    lessonService.submitLesson(privateLesson, function(data) {
                        // Success
                        commService.showSuccessAlert('Lesson added successfully!');
                        scope.cancel(privateLesson);
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });
                };

            }
        };
    }]);