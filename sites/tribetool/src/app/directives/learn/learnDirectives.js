angular.module('app.Directives')
    .directive('learnPage', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="col-xs-12">' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('backgroundVideo', ['$timeout', function ($timeout) {
        return {
            replace: true,
            transclude: true,
            restrict: 'E',
            template:
                '<section class="content-section background-video-section">' +
                    '<div class="pattern-overlay">' +
                        '<a id="backgroundVideo" class="background-video-player" data-property="{videoURL:\'https://www.youtube.com/watch?v={{videoId}}\',containment:\'.background-video-section\', quality:\'large\', autoPlay:true, mute:{{isMuted}}, opacity:1}">bg</a>' +

                        '<div class="container">' +
                            '<div class="row">' +
                                '<div class="col-xs-12">' +
                                    '<div ng-transclude></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="white-icon" ng-if="!hideControls" style="position:absolute;bottom:20px;right:20px; cursor:pointer; width:20px;"><i class="fa fa-2x fa-volume-up" ng-show="!isMuted" ng-click="isMuted = true;muteVideo()"></i><i class="fa fa-2x fa-volume-off" ng-show="isMuted" ng-click="isMuted = false;unmuteVideo()"></i></div>' +
                        '</div>' +
                    '</div>' +
                '</section>',
            scope: {
                videoId: '=',
                mute: '=',
                /* The time (in seconds) at which to start the video */
                startAt: '=?',
                /*
                // If provided, the following will be populated so that it can be called outside the directive:
                    mute(),
                    unmute();
                    getIsMuted()
                 */
                options:'=?',
                hideControls:'=?'
            },
            link: function (scope, element, attrs) {
                scope.isMuted = !!scope.mute;

                if(!angular.isDefined(scope.startAt)) {
                    scope.startAt = 0;
                }
                $timeout(function() {
                    $("#backgroundVideo").mb_YTPlayer({
                        startAt: scope.startAt
                    });
                });


                if(scope.options) {
                    scope.options.mute = function() {
                        scope.muteVideo();
                    };
                    scope.options.unmute = function() {
                        scope.unmuteVideo();
                    };
                    scope.options.getIsMuted = function() {
                        return $('#backgroundVideo').isMuted();
                    };
                }


                scope.muteVideo = function() {
                    var video = $('#backgroundVideo');
                    if(!video.isMuted()) {
                        if(!scope.toggleVolume()) {
                            return;
                        }
                    }
                    scope.isMuted = true;
                };

                scope.unmuteVideo = function() {
                    var video = $('#backgroundVideo');
                    if(video.isMuted()) {
                        if(!scope.toggleVolume()) {
                            return;
                        }
                    }
                    scope.isMuted = false;
                };

                scope.toggleVolume = function() {
                    return $('#backgroundVideo').toggleVolume();
                };
            }
        };
    }])
    .directive('skillStep', ['navigationService', 'accountService', function (navigationService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="skill-tree-step" ng-click="stepClicked()" ng-class="{\'complete\': step.StepProgress.IsComplete, \'unlocked\': !step.StepProgress.IsComplete && step.StepProgress.IsUnlocked, \'locked\': !step.StepProgress.IsUnlocked, \'pointer\': step.StepProgress.IsUnlocked || step.StepProgress.IsComplete}" style="display: table;">' +
                    '<div class="centered" style="vertical-align: middle; display: table-cell;">' +

                        '<div style="margin-top: 5px; font-weight: bold;">{{step.Skill.Name}}</div>' +
                        '<img class="skill-picture" ng-src="{{step.imageUrl | trusted}}">' +
                        '<div style="clear:both;" ng-if="step.StepProgress.IsUnlocked">' +
                            '<a class="action-link" ng-if="accountSpecialization && isTeacherOfSpecialization && !step.StepProgress.IsComplete" ng-click="markComplete(step)">Mark Complete</a>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                step: '=',
                specializationEntry: '=',
                accountSpecialization: '=?'
            },
            link: function (scope, element, attrs) {
                scope.step.imageUrl = scope.step.Image ? scope.step.Image.Small.Url : scope.step.Skill && scope.step.Skill.Image ? scope.step.Skill.Image.Small.Url : 'images/silhouette-small.png';

                scope.stepClicked = function() {
                    if(scope.step.StepProgress.IsUnlocked || scope.step.StepProgress.IsComplete) {
                        navigationService.goToStepPage(scope.specializationEntry, scope.step.StepPageUrl);
                    }
                };

                // Is the current viewer of the tree a teacher of the specialization that is being viewed?
                scope.isTeacherOfSpecialization = accountService.isTeacherOfSpecialization(scope.specializationEntry.Id);


                scope.markComplete = function(step) {
                    // No one should be able to complete their own skills
                    if(scope.accountSpecialization.AccountId != accountService.account.Id &&
                        !scope.step.StepProgress.IsComplete) {
                        // TODO: Complete the step
                    }
                };

            }
        };
    }])
    .directive('skillTree', ['jsPlumbService', '$timeout', '$window', 'accountService', function (jsPlumbService, $timeout, $window, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-style="{\'width\': skillTreeWidth}">' +
                    '<div ng-repeat="category in categories" ng-if="category.width > 0" class="pull-left" ng-style="{\'width\': category.width}">' +
                        '<h3 class="centered">{{category.category.Name}}</h3>' +
                        '<div ng-repeat="stepsOnLevel in category.stepsPerLevel" ng-style="{\'height\': stepHeight}" style="margin-top: 30px;">' +

                        '<skill-step ng-repeat="step in stepsOnLevel" specialization-entry="specializationEntry" account-specialization="accountSpecialization" step="step" id="{{step.elementId}}" style="float: left;" ng-style="{\'width\': stepWidth - (stepMargin * 2), \'height\': stepHeight, \'margin-left\': $first ? ((category.width - (stepsOnLevel.length * stepWidth))/2) + stepMargin : stepMargin, \'margin-right\': stepMargin}"></skill-step>' +

                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                /* The specialization with the skill tree */
                specializationEntry: '=',
                /* If not null, this is the AccountSpecialization that denotes the progress on the skill tree*/
                accountSpecialization: '=?'
            },
            link: function (scope, element, attrs) {
                var steps = scope.specializationEntry.SkillTree.Steps;


                scope.stepMargin = 15;
                scope.stepWidth = 200;

                // Is the current account a teacher of this specialization?
                scope.stepHeight = 110;

                var i = 0, j = 0, k = 0, category = null, step = null;
                var categories = [];
                for(i = 0; i < scope.specializationEntry.SkillTree.StepCategories.length; i++) {
                    categories.push({
                        category: scope.specializationEntry.SkillTree.StepCategories[i],
                        steps: [], // The steps in the category,
                        stepsPerLevel: [], // The steps in the category grouped by level. Key is level, value is an array of steps
                        width: 0
                    });
                }

                var markAsCompetentFunc = function($itemScope) {
                    // Distribute a skill in the skill point.
                    // navigationService.goToVirtualCowriter(scope.tabChord.Title);
                };
                for(i = 0; i < steps.length; i++) {
                    step = steps[i];
                    steps[i].elementId = step.Level + step.SkillId;


                    steps[i].menuOptions = {
                        onShow: null,
                        items: []
                    };
                    steps[i].menuOptions.items.push(['Mark as Competent',
                        markAsCompetentFunc
                    ]);
                }

                // Set the prerequisites
                for(i = 0; i < steps.length; i++) {
                    step = steps[i];
                    step.prerequisiteElementIds = [];
                    if(step.StepPrerequisites) {
                        for(j = 0; j < step.StepPrerequisites.length; j++) {
                            // Find the prerequisite step
                            for(k = 0; k < steps.length; k++) {
                                if(steps[k].Id === step.StepPrerequisites[j]) {
                                    step.prerequisiteElementIds.push(steps[k].elementId);
                                    break;
                                }
                            }
                        }
                    }
                }

                // Determine the maximum level
                scope.maxLevel = 0;
                for(i = 0; i < steps.length; i++) {
                    if(steps[i].Level > scope.maxLevel) {
                        scope.maxLevel = steps[i].Level;
                    }

                    // Add the step to the proper category
                    for(j = 0; j < categories.length; j++) {
                        if(categories[j].category.Name === steps[i].Category) {
                            categories[j].steps.push(steps[i]);
                            break;
                        }
                    }
                }


                // Go through each level
                for(var level = 0; level <= scope.maxLevel; level++) {
                    // for each category, find the largest amount of skills in that category on that level
                    for(j = 0; j < categories.length; j++) {
                        category = categories[j];
                        category.stepsPerLevel[level] = [];

                        // Get the skills on this level and in this category
                        for(k = 0; k < category.steps.length; k++) {
                            step = category.steps[k];
                            if(step.Level === level) {
                                // The step is on this level
                                category.stepsPerLevel[level].push(step);
                            }
                        }
                    }
                }

                scope.skillTreeWidth = 0;
                for(i = 0; i < categories.length; i++) {
                    category = categories[i];

                    // Determine the largest number of steps on any given level
                    var maxStepsInLevel = 0;
                    for(j = 0; j < category.stepsPerLevel.length; j++) {
                        if(category.stepsPerLevel[j].length > maxStepsInLevel) {
                            maxStepsInLevel = category.stepsPerLevel[j].length;
                        }
                    }

                    // We will then know how wide each category needs to be
                    category.maxStepsInLevel = maxStepsInLevel;
                    category.width = category.maxStepsInLevel * scope.stepWidth;

                    // We can then sum the widths of each category then we can get the total width
                    // of the skill tree
                    scope.skillTreeWidth += category.width;
                }


                angular.element($window).bind('resize', function() {
                    jsPlumbService.instance.repaintEverything();
                });

                $timeout(function() {
                    jsPlumbService.instance.deleteEveryEndpoint();

                    for(var i = 0; i < steps.length; i++) {
                        var step = steps[i];
                        for(var j = 0; j < step.prerequisiteElementIds.length; j++) {
                            jsPlumbService.instance.connect({
                                source: step.prerequisiteElementIds[j],
                                target: step.elementId,
                                anchors:['Bottom', 'Top'],
                                endpoint:['Dot', { radius:3 }],
                                connector: ['Flowchart', {
                                    alwaysRespectStubs: true,
                                    stub: 15,
                                    cornerRadius: 5
                                }],
                                detachable: false
                            });
                        }
                    }
                }, 0);

                scope.$on('$destroy', function() {
                    jsPlumbService.instance.deleteEveryEndpoint();
                });



                scope.categories = categories;
            }
        };
    }]);