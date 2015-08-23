angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryGenerateChordView', ['chordService', '$timeout', 'commService', function(chordService, $timeout, commService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div ng-show="stageIndex < 0">' +
                        '<loading></loading> Generating Chords...' +
                        '<div class="row" style="margin-top: 20px;">' +
                            '<button class="btn btn-warning" ng-click="options.cancel()">Cancel</button>' +
                        '</div>' +
                    '</div>' +
                    '<div ng-if="stage && stage.name == \'Ascension\'">' +
                        '<dmusiclibrary-generate-chord-view-ascension options="stageOptions"></dmusiclibrary-generate-chord-view-ascension>' +
                    '</div>' +
                    '<div ng-if="stage && stage.name == \'MelodicInstability\'">' +
                        '<dmusiclibrary-generate-chord-view-melodic-instability options="stageOptions"></dmusiclibrary-generate-chord-view-melodic-instability>' +
                    '</div>' +
                    '<div ng-if="stage && stage.name == \'HarmonicInstability\'">' +
                        '<dmusiclibrary-generate-chord-view-harmonic-instability options="stageOptions"></dmusiclibrary-generate-chord-view-harmonic-instability>' +
                    '</div>' +
                    '<div ng-if="stage && stage.name == \'Directionality\'">' +
                        '<dmusiclibrary-generate-chord-view-directionality options="stageOptions"></dmusiclibrary-generate-chord-view-directionality>' +
                    '</div>' +
                    '<div ng-if="stage && stage.name == \'Choose\'">' +
                        '<dmusiclibrary-generate-chord-view-choose options="stageOptions"></dmusiclibrary-generate-chord-view-choose>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 previousChord: '=',
                 nextChord: '=',
                 chordToReplace: '=',
                 key: '=',
                 useChordProgressionFormulas: '='
                 }
                 */
            },
            link: function(scope, elem, attrs) {
                scope.isLoaded = false;

                scope.cancel = function() {
                    scope.options.cancel();
                };

                var getStageNewDestinationsInKey = function(stageIndex) {
                    return stageIndex === 0 ? scope.destinationsInKey : scope.stages[stageIndex - 1].newDestinationsInKey;
                };
                scope.stageIndex = -1;
                scope.setStage = function(stageIndex, destinationsInKey) {
                    if(stageIndex === -1) {
                        scope.options.cancel();
                        return;
                    }
                    scope.stageIndex = stageIndex;
                    scope.stage = scope.stages[stageIndex];

                    // Get the destinationsInKey from the end of the previous
                    // stage to feed to this new stage
                    if(!destinationsInKey)
                        destinationsInKey = getStageNewDestinationsInKey(stageIndex);

                    scope.stageOptions =  {
                        destinationsInKey: destinationsInKey,
                        previousChord: scope.options.previousChord,
                        cancel: scope.cancel,
                        previous: scope.previousStage,
                        next: scope.nextStage,
                        canGoBack: stageIndex > 0
                    };

                    if(scope.stage.modifyOptions) {
                        scope.stage.modifyOptions(destinationsInKey);
                    }
                };

                var isDiscriminatoryStage = function(stage, stageIndex, newDestinationsInKey) {
                    if(stage.getCategoryFromChordCharacteristics) {
                        // Determine if the this stage will even provide any discrimination
                        // or if all chords in the stage belong to the same category value
                        var firstCategoryValue = stage.getCategoryFromChordCharacteristics(newDestinationsInKey.Chords[0].ChordCharacteristics).ClusterIndex;
                        var allSame = true;
                        for(var j = 0; j < newDestinationsInKey.Chords.length; j++) {
                            var chordCharacteristics = newDestinationsInKey.Chords[j].ChordCharacteristics;
                            if(stage.getCategoryFromChordCharacteristics(chordCharacteristics).ClusterIndex !== firstCategoryValue) {
                                allSame = false;
                                break;
                            }
                        }
                        return !allSame;
                    }
                    else {
                        return true;
                    }
                };

                scope.minChordCountToSkipToFinalStage = 3;
                scope.nextStage = function(newDestinationsInKey) {
                    if(newDestinationsInKey) {
                        // Save the newly filtered destinationsInKey
                        scope.stages[scope.stageIndex].newDestinationsInKey = newDestinationsInKey;

                        // If we have only 3 chords (or less) left, let's let the user decide so they
                        // have some choice.
                        if(newDestinationsInKey.Chords.length <= scope.minChordCountToSkipToFinalStage) {
                            // Go to final stage, we're done!
                            scope.setStage(scope.stages.length - 1, newDestinationsInKey);
                            return;
                        }
                    }

                    // Find the next stage to which we should go

                    var nextStageIndex = scope.stageIndex + 1;
                    newDestinationsInKey = getStageNewDestinationsInKey(nextStageIndex);
                    for(var i = nextStageIndex; i < scope.stages.length; i++) {
                        nextStageIndex = i;
                        if(isDiscriminatoryStage(scope.stages[i], i, newDestinationsInKey))
                            break;
                    }

                    scope.setStage(nextStageIndex, newDestinationsInKey);
                };

                scope.previousStage = function() {
                    // Find the previous stage to which we should go
                    var newDestinationsInKey = null;
                    var previousStageIndex = scope.stageIndex - 1;
                    for(var i = previousStageIndex; i >= 0; i--) {
                        previousStageIndex = i;
                        newDestinationsInKey = getStageNewDestinationsInKey(previousStageIndex);
                        if(!newDestinationsInKey || newDestinationsInKey.Chords.length <= scope.minChordCountToSkipToFinalStage)
                            continue;
                        if(isDiscriminatoryStage(scope.stages[i], i, newDestinationsInKey))
                            break;
                    }

                    scope.setStage(previousStageIndex, newDestinationsInKey);
                };

                scope.stages = [];

                if(scope.options.previousChord) {
                    scope.stages.push({
                        name: 'MelodicInstability',
                        getCategoryFromChordCharacteristics: function(chordCharacteristics) {
                            return chordCharacteristics.MelodicInstability;
                        }
                    });
                    scope.stages.push({
                        name: 'HarmonicInstability',
                        getCategoryFromChordCharacteristics: function(chordCharacteristics) {
                            return chordCharacteristics.HarmonicInstability;
                        },
                        modifyOptions: function(destinationsInKey) {
                            // When measuring dissonance there's no need to play the previous chord.
                            scope.stageOptions.previousChord = null;
                        }
                    });
                    scope.stages.push({
                        name: 'Directionality',
                        getCategoryFromChordCharacteristics: function(chordCharacteristics) {
                            return chordCharacteristics.Directionality;
                        }
                    });

                    scope.stages.push({
                        name: 'Ascension',
                        getCategoryFromChordCharacteristics: function(chordCharacteristics) {
                            return chordCharacteristics.Ascension;
                        }
                    });
                }

                scope.stages.push({
                    name: 'Choose',
                    modifyOptions: function(destinationsInKey) {
                        // The user must now make a final decision as to the chord to choose.
                        scope.stageOptions = {
                            destinationsInKey: destinationsInKey,
                            cancel: scope.cancel,
                            previous: scope.previousStage,
                            next: scope.options.next,
                            previousChord: scope.options.previousChord
                        };
                    }
                });




                // Get our options as far as chords go
                chordService.generateChords(scope.options.previousChord,
                    scope.options.chordToReplace, scope.options.nextChord, scope.options.key,
                    /*useChordProgressionFormulas*/scope.options.useChordProgressionFormulas,
                    function(data) {
                        // Success
                        var destinationsInKey = data.ChordDestinations.DestinationsInKeys[0];
                        scope.destinationsInKey = destinationsInKey;
                        scope.isLoaded = true;

                        scope.nextStage();
                    },
                    function(data) {
                        // Failure
                        commService.showErrorAlert('Something went wrong while generating the chords! Please let us know so that we can fix it for you. Thank you!');
                        scope.cancel();
                    });
            }
        };
    }])
    .directive('dmusiclibraryGenerateChordViewChoose', ['dmusiclibraryChordService', '$timeout', 'commService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryMidiService', function(chordService, $timeout, commService, virtualCowriterService, midiService) {
        var chordPanelBody =
            '<div ng-repeat="chord in chords">' +
                '<div class="list-group">' +
                '<a ng-click="chordSelected(chord)" class="list-group-item" ng-class="{\'active\': chord.selected}">' +
                '<h4 class="list-group-item-heading">{{chord.Chord.TitleChordName.FullName}}</h4>' +
                '<p class="list-group-item-text">' +
                '<div>Instability Rating: {{chord.ChordCharacteristics.MelodicInstability.Ranking}}</div>' +
                '<div>Dissonance Rating: {{chord.ChordCharacteristics.HarmonicInstability.Ranking}}</div>' +
                '<div>Strength Rating: {{chord.ChordCharacteristics.Directionality.Ranking}}</div>' +
                '</p>' +
                '</a>' +
                '</div>' +
            '</div>';

        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div class="col-md-6">' +
                    '<form class="input-group" ng-submit="" style="margin-bottom: 0px;">' +
                        '<input type="text" class="form-control" ng-model="filterText" ng-change="filterChanged()" placeholder="Filter" id="chord_choice_filter_bar" name="search_bar" value="">' +
                        '<div class="input-group-btn">' +
                            '<button ng-click="clearFilter()" class="btn btn-warning form-control"><span class="glyphicon glyphicon-remove"></span></button>' +
                        '</div>' +
                    '</form>' +
                    '<div class="panel panel-primary">' +
                        '<div class="panel-heading">Chord Options</div>' +
                            '<div id="chordPanelBody" style="height: 300px; overflow: hidden; position:relative;" class="panel-body">' +
                                '<div ng-show="!chords || chords.length <= 0">' +
                                    '<div>No Chords Were Found :(</div>' +
                                '</div>' +
                                '<div ng-show="chords">' +
                                chordPanelBody +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div ng-show="selectedChord" class="panel panel-success">' +
                            '<div class="panel-heading">Selected Chord</div>' +
                                '<div id="chordPanelBody" class="panel-body">' +
                                    '<div>{{selectedChord.Chord.TitleChordName.FullName}}</div>' +
                                    '<div>{{selectedChord.Chord.NoteNamesString}}</div>' +
                                '</div>' +
                            '</div>' +
                        '<div>' +
                            '<button style="margin-left: 20px;" ng-class="{\'disabled\': !selectedChord}" class="btn btn-primary pull-right" ng-click="next()">Insert Selected Chord</button>' +
                            '<button style="margin-left: 20px;" class="btn btn-warning pull-right" ng-click="options.previous()">Go Back</button>' +
                            '<button class="btn btn-warning pull-right" ng-click="options.cancel()">Cancel</button>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 cancel(): '=',
                 previous(): '=',
                 next(selectedChord): '=',
                 destinationsInKey: '=',
                 }
                 */
            },
            link: function(scope, elem, attrs) {
                scope.selectedChord = null;
                scope.destinationsInKey = scope.options.destinationsInKey;
                for(var i = 0; i < scope.destinationsInKey.Chords.length; i++) {
                    var chord = scope.destinationsInKey.Chords[i];
                    chord.Chord.NoteNamesString = virtualCowriterService.getNoteNameString(chord.Chord.NoteNames);
                }
                scope.originalChords = scope.destinationsInKey.Chords;
                scope.chords = angular.extend([], scope.destinationsInKey.Chords);

                scope.chordSelected = function(chord) {
                    for(var i = 0; i < scope.chords.length; i++) {
                        scope.chords[i].selected = false;
                    }
                    chord.selected = true;
                    scope.selectedChord = chord;

                    if(scope.options.previousChord) {
                        var progressionSound = midiService.getMidiSoundFromChordProgression([
                            scope.options.previousChord,
                            chord.Chord
                        ], {
                            duration: 400
                        });

                        midiService.playSound(progressionSound);
                    }
                    else {
                        midiService.playChord(chord.Chord);
                    }
                };

                scope.chordSelected(scope.chords[0]);

                scope.next = function() {
                    if(!scope.selectedChord) {
                        commService.showWarningAlert('Please select a chord to continue.');
                        return;
                    }
                    scope.options.next(scope.selectedChord.Chord);
                };

                scope.clearFilter = function() {
                    scope.filterText = '';
                    scope.filterChanged();
                };

                scope.filterChanged = function() {
                    var filterTextUpper = scope.filterText.toUpperCase();
                    // Apply the filter
                    scope.chords = [];
                    for(var i = 0; i < scope.originalChords.length; i++) {
                        var chord = scope.originalChords[i];
                        // Does this chord meet our filter?
                        if(chord.Chord.TitleChordName.FullName.toUpperCase().indexOf(filterTextUpper) !== -1) {
                            scope.chords.push(chord);
                        }
                    }
                };


                var chordPanelBodyElement = $('#chordPanelBody');
                chordPanelBodyElement.perfectScrollbar({
                    suppressScrollX: true
                });
            }
        };
    }])
    .directive('dmusiclibraryGenerateChordViewAscension', ['dmusiclibraryChordService', '$timeout', 'commService', 'dmusiclibraryChordProgressionGeneratorService',  function(chordService, $timeout, commService, chordProgressionGeneratorService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-if="isReady">' +
                    '<dmusiclibrary-chord-category-choice options="options"></dmusiclibrary-chord-category-choice>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 cancel(): '=',
                 previous(): '=',
                 next(newDestinationsInKey): '=',
                 previousChord: '=',
                 destinationsInKey: '='
                 }
                 */
            },
            link: function(scope, elem, attrs) {
                scope.options.question = 'Based on whether the chord ascends or descends, which of the following should it sound like?';
                scope.options.minChordProgressionLabel = 'Descending';
                scope.options.maxChordProgressionLabel = 'Ascending';
                scope.options.getCategoryFromChordCharacteristics = function(chordCharacteristics) {
                    return chordCharacteristics.Ascension;
                };
                scope.isReady = true;
            }
        };
    }])
    .directive('dmusiclibraryGenerateChordViewMelodicInstability', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-if="isReady">' +
                    '<dmusiclibrary-chord-category-choice options="options"></dmusiclibrary-chord-category-choice>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 cancel(): '=',
                 previous(): '=',
                 next(newDestinationsInKey): '=',
                 previousChord: '=',
                 destinationsInKey: '='
                 }
                 */
            },
            link: function(scope, elem, attrs) {
                scope.options.question = 'Based on whether the chord resolves or does not resolve, which of the following should it sound like?';
                scope.options.minChordProgressionLabel = 'Resolved';
                scope.options.maxChordProgressionLabel = 'Unresolved';
                scope.options.getCategoryFromChordCharacteristics = function(chordCharacteristics) {
                    return chordCharacteristics.MelodicInstability;
                };
                scope.isReady = true;
            }
        };
    }])
    .directive('dmusiclibraryGenerateChordViewHarmonicInstability', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-if="isReady">' +
                    '<dmusiclibrary-chord-category-choice options="options"></dmusiclibrary-chord-category-choice>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 cancel(): '=',
                 previous(): '=',
                 next(newDestinationsInKey): '=',
                 previousChord: '=',
                 destinationsInKey: '='
                 }
                 */
            },
            link: function(scope, elem, attrs) {
                scope.options.question = 'Based on whether the chord is dissonant or consonant, which of the following should it sound like?';
                scope.options.minChordProgressionLabel = 'Consonant';
                scope.options.maxChordProgressionLabel = 'Dissonant';
                scope.options.getCategoryFromChordCharacteristics = function(chordCharacteristics) {
                    return chordCharacteristics.HarmonicInstability;
                };
                scope.isReady = true;
            }
        };
    }])
    .directive('dmusiclibraryGenerateChordViewDirectionality', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-if="isReady">' +
                    '<dmusiclibrary-chord-category-choice options="options"></dmusiclibrary-chord-category-choice>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 cancel(): '=',
                 previous(): '=',
                 next(newDestinationsInKey): '=',
                 previousChord: '=',
                 destinationsInKey: '='
                 }
                 */
            },
            link: function(scope, elem, attrs) {
                scope.options.question = 'Based on whether the progression is fragile or strong, which of the following should it sound like?';
                scope.options.minChordProgressionLabel = 'Fragile';
                scope.options.maxChordProgressionLabel = 'Strong';
                scope.options.getCategoryFromChordCharacteristics = function(chordCharacteristics) {
                    return chordCharacteristics.Directionality;
                };
                scope.isReady = true;
            }
        };
    }])
    .directive('dmusiclibraryChordCategoryChoice', ['dmusiclibraryChordService', '$timeout', 'commService', 'dmusiclibraryChordProgressionGeneratorService', 'dmusiclibraryMidiService',  function(chordService, $timeout, commService, chordProgressionGeneratorService, midiService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-if="allQa">' +
                    '<button ng-if="options.canGoBack" class="btn btn-warning" ng-click="previous()">Go Back</button>' +
                    '<button ng-if="!options.canGoBack" class="btn btn-warning" ng-click="cancel()">Cancel</button>' +
                    '<div question-answer-wizard all-qa="allQa" post-question-html="postQuestionHtml" q-index="qIndex" show-buttons="false" speed="300"></div>' +
                '</div>',
            scope: {
                options: '=' /*
                 {
                 cancel(): '=',
                 previous(): '=',
                 next(newDestinationsInKey): '=',
                 previousChord: '=',
                 destinationsInKey: '=',
                 canGoBack: bool,

                 getCategoryFromChordCharacteristics: Func<ChordCharacterstics, ChordCharacteristicCategory>,
                 question: string,
                 minChordProgressionLabel: string,
                 maxChordProgressionLabel: string
                 }
                 */
            },
            link: function(scope, elem, attrs) {

                var minChord = null, maxChord = null;
                var minRanking = 0, maxRanking = 0;
                for(var i = 0; i < scope.options.destinationsInKey.Chords.length; i++) {
                    var chord = scope.options.destinationsInKey.Chords[i];
                    var category = scope.options.getCategoryFromChordCharacteristics(chord.ChordCharacteristics);
                    if(minChord === null || category.Ranking < minRanking) {
                        minChord = chord;
                        minRanking = category.Ranking;
                    }
                    if(maxChord === null || category.Ranking > maxRanking) {
                        maxChord = chord;
                        maxRanking = category.Ranking;
                    }
                }

                var filterChordsByCategoryValue = function(categoryValue) {
                    return chordProgressionGeneratorService.filterByChordCharacteristicCategoryValue(scope.options.destinationsInKey,
                        scope.options.getCategoryFromChordCharacteristics, /*desiredValueIndex*/ categoryValue);
                };

                var duration = 750;
                // Get the midi from the previous chord to each of the two extrema options
                var minMidiSound = scope.options.previousChord ? midiService.getMidiSoundFromChordProgression([
                    scope.options.previousChord,
                    minChord.Chord
                ], {
                    duration: duration
                }) : minChord.Chord.ChordSound;

                var maxMidiSound = scope.options.previousChord ? midiService.getMidiSoundFromChordProgression([
                    scope.options.previousChord,
                    maxChord.Chord
                ], {
                    duration: duration
                }): maxChord.Chord.ChordSound;


                duration = minMidiSound.Chords[0].LongestDuration;
                if(scope.options.previousChord)
                    duration *= 2;


                scope.playOptions = {
                    isPlaying : false
                };

                var question = {
                    getMinMidiSound: function() {
                        return minMidiSound;
                    },
                    getMaxMidiSound: function() {
                        return maxMidiSound;
                    },
                    question: scope.options.question,
                    answers: [
                        'First Progression',
                        'Second Progression',
                        'Either'
                    ],
                    selected: null,
                    callback: function(selectedIndex) {
                        if(selectedIndex === 0) {
                            // minChord chosen
                            // Get the chords that are in the lower category for ascension
                            scope.next(filterChordsByCategoryValue(0));
                        }
                        else if(selectedIndex === 1) {
                            // maxChord chosen
                            // Get the chords that are in the upper category for ascension
                            scope.next(filterChordsByCategoryValue(1));
                        }
                        else {
                            // either/neither chord chosen
                            // Don't filter
                            scope.next(scope.options.destinationsInKey);
                        }
                    },
                    onPresented: function(currentQ) {

                        var highlightChordProgressionPlayer = function(id) {
                            var highlightDuration = duration + 1000;
                            var player = $('#' + id);
                            player.find('i').effect('highlight', {}, highlightDuration);
                            player.find('.chord-category-label').effect('highlight', {}, highlightDuration);
                        };
                        // Wait for next rendering
                        $timeout(function() {
                            if(scope.aborted)
                                return;
                            midiService.playSound(minMidiSound, scope.playOptions, function() {
                                // Sound complete

                                if(scope.aborted)
                                    return;

                                // Use $timeout to give us some breathing room between playing
                                // the min and max sounds
                                $timeout(function() {
                                    if(scope.aborted)
                                        return;

                                    midiService.playSound(maxMidiSound, scope.playOptions, function() {
                                        // sound complete
                                    });
                                    highlightChordProgressionPlayer('maxMidiPlayerContainer');

                                }, scope.options.previousChord ? 500 : 0);
                            });

                            highlightChordProgressionPlayer('minMidiPlayerContainer');
                        }, 0);

                    }
                };

                scope.postQuestionHtml =
                    '<div>' +
                        '<div id="minMidiPlayerContainer" class="col-md-offset-3 col-md-3">' +
                        '<midi-sound-black-icon get-midi-sound="currentQ.getMinMidiSound"></midi-sound-black-icon>' +
                        '<span class="chord-category-label">' + scope.options.minChordProgressionLabel + '</span>' +
                        '</div>' +
                        '<div id="maxMidiPlayerContainer" class="col-md-3 col-md-offset-3">' +
                        '   <midi-sound-black-icon get-midi-sound="currentQ.getMaxMidiSound"></midi-sound-black-icon>' +
                        '<span class="chord-category-label">' + scope.options.maxChordProgressionLabel + '</span>' +
                        '</div>' +
                '</div>';

                scope.allQa = [
                    question
                ];
                scope.qIndex = 0;

                scope.abort = function() {
                    scope.playOptions.isPlaying = false;
                    scope.aborted = true;
                };

                scope.next = function(newDestinationsInKey) {

                    scope.options.next(newDestinationsInKey);
                };
                scope.previous = function() {
                    scope.abort = true;
                    scope.options.previous();
                };
                scope.cancel = function() {
                    scope.abort = true;
                    scope.options.cancel();
                };


            }
        };
    }])
    .directive('dmusiclibraryChooseChordVoicingView', ['$timeout', 'dmusiclibraryChordService', 'dmusiclibraryVirtualCowriterService', function($timeout, chordService, virtualCowriterService) {


        var voicingPanelBody =
            '<div ng-repeat="voicing in voicings">' +
                '<div class="list-group">' +
                    '<a ng-click="voicingSelected(voicing)" class="list-group-item" ng-class="{\'active\': voicing.selected}">' +
                        '<h4 class="list-group-item-heading">{{voicing.NoteNamesString}}</h4>' +
                        '<p class="list-group-item-text">' +
                            '{{voicing.TitleChordName.FullName}}' +
                        '</p>' +
                    '</a>' +
                '</div>' +
            '</div>';
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div class="col-md-6">' +
                        '<div ng-show="!voicings">' +
                            '<loading></loading> Generating Voicings...' +
                        '</div>' +
                        '<div>' +
                            '<div ng-show="voicings" class="panel panel-primary">' +
                                '<div class="panel-heading">{{options.chord.TitleChordName.FullName}} Voicing Options</div>' +
                                '<div id="voicingPanelBody" style="height: 300px; overflow: hidden; position:relative;" class="panel-body">' +
                                    voicingPanelBody +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div ng-show="selectedVoicing" class="panel panel-success">' +
                            '<div class="panel-heading">Selected Voicing</div>' +
                            '<div id="chordPanelBody" class="panel-body">' +
                                '<div>{{selectedVoicing.NoteNamesString}}</div>' +
                            '</div>' +
                        '</div>' +
                        '<div>' +
                            '<button style="margin-left: 20px;" ng-class="{\'disabled\': !selectedVoicing}" class="btn btn-primary pull-right" ng-click="next()">Next</button>' +
                            '<button class="btn btn-warning pull-right" ng-click="cancel()">Cancel</button>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '='
            },
            link: function(scope, elem, attrs) {
                scope.selectedVoicing = null;
                scope.voicingSelected = function(chord) {
                    for(var i = 0; i < scope.voicings.length; i++) {
                        scope.voicings[i].selected = false;
                    }
                    chord.selected = true;
                    scope.selectedVoicing = chord;
                };

                scope.next = function() {
                    scope.options.next(scope.selectedVoicing);
                };

                scope.cancel = function() {
                    scope.options.cancel();
                };

                scope.$watch(function() {
                    return scope.voicings;
                }, function(newVal, oldVal) {
                    // Chords have changed
                });


                var chordPanelBodyElement = $('#voicingPanelBody');
                chordPanelBodyElement.perfectScrollbar({
                    suppressScrollX: true
                });

                // Get our options as far as chords go
                chordService.getVoicings(scope.options.chord, { },
                    function(data) {
                        // Success
                        scope.voicings = data.Voicings;

                        for(var i = 0; i < scope.voicings.length; i++) {
                            var voicing = scope.voicings[i];
                            voicing.NoteNamesString = virtualCowriterService.getNoteNameString(voicing.NoteNames);
                        }

                        scope.voicingSelected(scope.voicings[0]);

                        $timeout(function() {
                            chordPanelBodyElement.perfectScrollbar('update');
                        }, 0);
                    },
                    function(data) {
                        // Failure
                    });
            }
        };
    }]);