angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryVirtualCowriter', [function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/sites/musiclibrary/app-templates/virtual-cowriter.html',
            controller: ['$scope', '$routeParams', 'commService', 'navigationService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryInstrumentService', 'metaService', 'dmusiclibraryChordService', 'dmusiclibraryScaleService', 'dmusiclibraryNavigationService', function($scope, $routeParams, commService, navigationService, virtualCowriterService, instrumentService, metaService, chordService, scaleService, musicNavigationService) {

                $scope.search = function() {
                    $scope.categories = null;
                    $scope.chordProgression = null;
                    $scope.chord = null;
                    $scope.scale = null;
                    $scope.commandElement = null;

                    $scope.processing = true;
                    virtualCowriterService.commandElements = null;
                    virtualCowriterService.musicElements = null;

                    $scope.unknownElements = [];
                    $scope.noResults = false;
                    $scope.originalCommand = null;
                    $scope.error = null;
                    virtualCowriterService.parse($scope.command, function(data) {
                        // Success

                        virtualCowriterService.commandElements = data.ParsedCommand.CommandElements;

                        $scope.chord = null;
                        $scope.scale = null;
                        $scope.commandElement = null;

                        $scope.noResults = data.ParsedCommand.AlmostKnownCommandElements.length <= 0 &&
                            data.ParsedCommand.CommandElements.length <= 0;
                        $scope.originalCommand = data.ParsedCommand.OriginalCommand;

                        $scope.unknownElements = [];
                        for(var m = 0; m < data.ParsedCommand.AlmostKnownCommandElements.length; m++) {
                            var almostKnownCommandElement = data.ParsedCommand.AlmostKnownCommandElements[m];

                            var error = 'We couldn\'t quite understand "' + almostKnownCommandElement.Text + '".';
                            if(almostKnownCommandElement.IsTab) {
                                error += ' Is this possibly a chord for a different instrument than ' + instrumentService.getShortNameOfCurrentInstrument() + '?';
                            }
                            else {
                                error += ' Please consider revising.';
                            }
                            $scope.unknownElements.push({
                                error: error,
                                element: almostKnownCommandElement
                            });
                        }


                        var onSelection = function (selectedIndex) {
                            $scope.command = commandElement.Text + ' ' + categories[selectedIndex].text;
                            musicNavigationService.goToVirtualCowriter($scope.command);
                        };
                        for(var i = 0; i < data.ParsedCommand.CommandElements.length; i++) {
                            var commandElement = data.ParsedCommand.CommandElements[i];
                            $scope.commandElement = commandElement;

                            var categories = [];
                            var isChord = commandElement.IsAnyChord;
                            var isScale = commandElement.IsAnyScale;
                            var isTab = commandElement.IsTab;
                            var isChordProgression = commandElement.IsChordProgression;

                            if(isChord)
                                categories.push({
                                    answer: 'A Chord',
                                    text: 'Chord'
                                });
                            if(isScale) {
                                categories.push({
                                    answer: 'A Scale',
                                    text: 'Scale'
                                });
                            }
                            if(isTab) {
                                categories.push({
                                    answer: 'Tab',
                                    text: 'Tab'
                                });
                            }
                            if(isChordProgression) {
                                categories.push({
                                    answer: 'A Chord Progression',
                                    text: 'Chord Progression'
                                });
                            }
                            if(categories.length > 1) {
                                // We don't know exactly what this input was so we'll have
                                // to ask for clarification
                                $scope.categories = categories;



                                var answers = [];
                                for(var j = 0; j < categories.length; j++) {
                                    answers.push(categories[j].answer);
                                }

                                $scope.allQa = [
                                    {
                                        question: 'What is "' + commandElement.Text + '"?',
                                        answers: answers,
                                        selected: null,
                                        callback: onSelection
                                    }
                                ];

                                $scope.qIndex = 0;
                            }
                            else {
                                if(isChord) {
                                    var chord = commandElement.Chords[0];
                                    $scope.commandElement.musicElement = chord;

                                    $scope.chord = chord;

                                    chordService.fillChordData(chord);
                                }

                                if(isScale) {
                                    var scale = commandElement.Scales[0];
                                    $scope.scale = scale;
                                    $scope.commandElement.musicElement = scale;

                                    scaleService.fillScaleData(scale);
                                }

                                if(isTab) {
                                    var tab = commandElement.Tab[0];
                                    $scope.tab = tab;
                                    $scope.commandElement.musicElement = tab;

                                    chordService.fillChordData(tab.Chord);

                                }

                                if(isChordProgression) {
                                    var chordProgression = commandElement.ChordProgression;
                                    $scope.chordProgression = chordProgression;
                                    $scope.commandElement.musicElement = chordProgression;

                                    var chords = chordProgression.Chords;
                                    for(var n = 0; n < chords.length; n++) {
                                        chordService.fillChordData(chords[n].IsTabChord ? chords[n].Chord : chords[n], {
                                            RemoveSimilarCharts: true,
                                            ExcludedDifficulties: ['Impossible']
                                        });
                                    }

                                    scaleService.fillChordProgressionData(chordProgression);

                                }
                            }


                        }

                        virtualCowriterService.musicElements = [];
                        if($scope.chords)
                            virtualCowriterService.musicElements = virtualCowriterService.musicElements.concat($scope.chords);

                        if($scope.scale)
                            virtualCowriterService.musicElements.push($scope.scale);

                        $scope.processing = false;
                    }, function(data) {
                        // Failure
                        $scope.error = data.ErrorReason;
                        $scope.processing = false;
                    });
                };


                window.prerenderReady = false;

                $scope.initialized = function() {
                };



                var runController = function() {

                    $scope.processing = false;



                    var routeCommand = musicNavigationService.getCommandFromRoute();
                    var routeInstrument = musicNavigationService.getInstrumentFromRoute();

                    if(!routeCommand)
                        routeCommand = virtualCowriterService.lastCommand ? virtualCowriterService.lastCommand : 'Am7';


                    if(routeCommand)
                        routeCommand = routeCommand.replace(new RegExp('-', 'g'), ' ');

                    $scope.command = routeCommand;




                    // Only indicate that we're not done with rendering
                    // if we're actually going to execute a command
                    if(routeCommand) {
                        window.prerenderReady = false;

                        // Let's update the meta Title and Description with
                        // the command since we're going to execute it.
                        var strings = routeCommand.split(' ');

                        // If an instrument name was provided, put it in the meta info
                        var instrumentName = routeInstrument;
                        if(!instrumentName) {
                            instrumentName = instrumentService.getShortNameOfCurrentInstrument();
                        }

                        if(strings.length > 0) {
                            if(strings[strings.length - 1].toUpperCase() === 'TAB') {
                                strings[strings.length - 1] = 'Chord';
                                strings.push('Chart');
                            }
                        }

                        strings.push('-');
                        strings.push(instrumentName);

                        for(var i = 0; i < strings.length; i++) {
                            var str = strings[i];
                            if(str.length > 0)
                                strings[i] = str.charAt(0).toUpperCase() + str.slice(1);
                        }

                        var formattedCommand = strings.join(' ');
                        metaService.setTitle(formattedCommand + ' | Virtual Co-writer');
                        metaService.setDescription("Virtual Co-writer results for: '" + formattedCommand + "'");
                    }
                    else {
                        // Otherwise, we're done rendering already
                        window.prerenderReady = true;
                    }




                    if(routeInstrument) {
                        // Get the instrument from its name
                        commService.showWarningAlert('Your instrument is being changed to ' + routeInstrument + '.', {
                            onlyIfUnique: true
                        });

                        instrumentService.setInstrumentFromName(routeInstrument, function(result) {
                            // execute the command
                            $scope.search();
                        }, function(result) {
                            // Failure loading instrument from name. Use whichever instrument is currently loaded.
                            $scope.search();
                        });
                    }
                    else {
                        // No instrument was specified--use whichever one is loaded.
                        $scope.search();
                    }

                };

                if(instrumentService.initialized) {
                    runController();
                }
                else {
                    $scope.$on('instrumentServiceInitialized', function(event, data) {
                        runController();
                    });
                }

                $scope.$on('$routeChangeSuccess', function(event, data) {
                    runController();
                });
            }],
            link: function (scope, elem, attrs) {

            }
        };
    }])

    /* Used to display either a Chord or a TabChord Panel based on the scope input */
    .directive('dmusiclibraryChordOrTabChordPanel', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div ng-if="chordOrTabChord.IsTabChord">' +
                        '<dmusiclibrary-tab-chord-panel tab-chord="chordOrTabChord"></dmusiclibrary-tab-chord-panel>' +
                    '</div>' +
                    '<div ng-if="!chordOrTabChord.IsTabChord">' +
                        '<dmusiclibrary-chord-panel chord="chordOrTabChord"></dmusiclibrary-chord-panel>' +
                    '</div>' +
                '</div>',
            scope: {
                chordOrTabChord: '='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryTabChordPanel', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<dmusiclibrary-tab-basic-info tab-chord="tabChord"></dmusiclibrary-tab-basic-info>' +
                    '<dmusiclibrary-chord-staff-area chord="tabChord.Chord"></dmusiclibrary-chord-staff-area>' +
                    '<dmusiclibrary-chord-inversions-area chord="tabChord.Chord"></dmusiclibrary-chord-inversions-area>' +
                    '<div style="margin-top: 20px;">' +
                    '<h3>Chord Charts</h3>' +
                    '<dmusiclibrary-chord-charts ng-if="tabChord.Chord.ChordCharts" row-size="1" suppress-panels="true" chord="tabChord.Chord" chord-charts="tabChord.Chord.ChordCharts"></dmusiclibrary-chord-charts>' +
                    '</div>' +

                '</div>',
            scope: {
                tabChord: '='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryChordPanel', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<dmusiclibrary-chord-basic-info chord="chord"></dmusiclibrary-chord-basic-info>' +
                    '<dmusiclibrary-chord-staff-area chord="chord"></dmusiclibrary-chord-staff-area>' +
                    '<dmusiclibrary-chord-inversions-area chord="chord"></dmusiclibrary-chord-inversions-area>' +
                    '<div style="margin-top: 20px;">' +
                    '<h3>Chord Charts</h3>' +
                    '<dmusiclibrary-chord-charts ng-if="chord.ChordCharts" row-size="1" suppress-panels="true" chord="chord" chord-charts="chord.ChordCharts"></dmusiclibrary-chord-charts>' +
                    '</div>' +
                '</div>',
            scope: {
                chord: '='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])





    .directive('dmusiclibraryChordProgressionScalesOfBestFit', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h3>Scales of Best Fit</h3>' +
                    '<div ng-repeat="scale in scalesOfBestFit">' +
                    '<dmusiclibrary-scale-line scale="scale"></dmusiclibrary-scale-line>' +
                    '</div>' +
                    '</div>',
            scope: {
                chordProgression:'=',
                scalesOfBestFit: '='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryChordProgressionBasicInfo', ['dmusiclibraryNavigationService', function(musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h4 style="margin-top: 0px; font-weight: bolder;" ><span class="has-context-menu" ng-context-menu="menuOptions">{{chordProgression.Title}}</span> <dmusiclibrary-midi-sound midi-sound="chordProgression.MidiSound"></dmusiclibrary-midi-sound></h4>' +
                    '<div style="margin-top: 20px;">' +
                    '<div ng-repeat="chord in chordProgression.Chords">' +
                    '<div ng-if="chord.IsTabChord">' +
                    '<dmusiclibrary-chord-line chord="chord.Chord"></dmusiclibrary-chord-line>' +
                    '</div>' +
                    '<div ng-if="!chord.IsTabChord">' +
                    '<dmusiclibrary-chord-line chord="chord"></dmusiclibrary-chord-line>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                chordProgression:'='
            },
            link: function (scope, elem, attrs) {
                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.chordProgression.Title,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.chordProgression.Title);
                    }
                ]);
            }
        };
    }])
    .directive('dmusiclibraryTabChordName', ['navigationService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryNavigationService', function(navigationService, virtualCowriterService, musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<span ng-click="tabChordNameClicked()" class="has-context-menu" ng-context-menu="menuOptions">{{tabChord.Title}}</span>',
            scope: {
                tabChord: '='
            },
            link: function (scope, elem, attrs) {

                scope.tabChordNameClicked = function() {
                    virtualCowriterService.showChordOnFretboard(scope.tabChord, /*scrollToFretboard*/false);
                };


                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.tabChord.Title,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.tabChord.Title);
                    }
                ]);

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Scale',
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.tabChord.Title + ' Scale');
                    }
                ]);



                scope.menuOptions.items.push(['View on Fretboard',
                    function($itemScope) {
                        virtualCowriterService.showChordOnFretboard(scope.tabChord, /*scrollToFretboard*/true);
                    }
                ]);
            }
        };
    }])
    .directive('dmusiclibraryTabBasicInfo', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h3 style="margin-top: 0px; font-weight: bolder;"><dmusiclibrary-tab-chord-name tab-chord="tabChord"></dmusiclibrary-tab-chord-name> <dmusiclibrary-midi-sound midi-sound="tabChord.Chord.ChordSound"></dmusiclibrary-midi-sound></h3>' +
                    '<dmusiclibrary-chord-basic-info chord="tabChord.Chord"></dmusiclibrary-chord-basic-info>' +
                '</div>',
            scope: {
                tabChord:'='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryScaleBasicInfo', ['navigationService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryNavigationService', function(navigationService, virtualCowriterService, musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h3 style="margin-top: 0px; font-weight: bolder;"><span class="has-context-menu" ng-context-menu="menuOptions">{{scaleName}}</span></h3>' +
                    '<h5 style="font-weight: bolder;"><dmusiclibrary-note-name-list note-names="scale.NoteNamesWithinOctave"></dmusiclibrary-note-name-list> <dmusiclibrary-midi-sound midi-sound="scale.MidiSound"></dmusiclibrary-midi-sound></h5>' +
                    '<h5 style="font-weight: bolder;"><dmusiclibrary-note-number-name-list note-number-names="scale.ScaleFormula.NoteNumberNames"></dmusiclibrary-note-number-name-list></h5>' +
                '</div>',
            scope: {
                scale:'=',
                commandElement: '='
            },
            link: function (scope, elem, attrs) {

                scope.scaleName = virtualCowriterService.getScaleName(scope.scale);

                scope.noteNameString = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave);
                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + (scope.scale.IsNameUnknown ? scope.noteNameString : scope.scaleName),
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.noteNameString + ' Scale');
                    }
                ]);

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Chord',
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.noteNameString + ' as Chord');
                    }
                ]);

            }
        };
    }])
    .directive('dmusiclibraryScaleTabStaff', ['$timeout', 'navigationService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryNavigationService', function($timeout, navigationService, virtualCowriterService, musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="scale-tab-staff-container text-center">' +
                    '<div ng-if="ready">' +
                        '<div ng-if="scale.ScaleChartResult.CouldNotFit">' +
                            '<p style="color: red;">Sadly we had some difficulty fitting this scale onto the current instrument :(. Please consider modifying either the scale or the instrument.</p>' +
                        '</div>' +
                        '<div ng-if="!scale.ScaleChartResult.CouldNotFit">' +
                            '<dmusiclibrary-tab-staff class="has-context-menu" ng-context-menu="menuOptions" tab-staff="scale.ScaleChartResult.TabStaff"></dmusiclibrary-tab-staff>' +
                            '{{scale.ScaleChartResult.ScaleChart.GuitarType}} <dmusiclibrary-midi-sound midi-sound="scale.ScaleChartResult.TabScale.MidiSound"></dmusiclibrary-midi-sound>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                scale:'='
            },
            link: function (scope, elem, attrs) {
                scope.scaleName = virtualCowriterService.getScaleName(scope.scale, /*useNoteNamesIfUnknown*/true);
                scope.noteNameString = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave);
                scope.searchText = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave, /*includeOctaveNumber*/true);

                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.scaleName,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.searchText);
                    }
                ]);


                scope.$watch('scale.ScaleChartResult', function (newVal) {
                    if (newVal) {
                        scope.ready = false;
                        $timeout(function() {
                            scope.ready = true;
                        }, 0);
                    }

                });

            }
        };
    }])
    .directive('dmusiclibraryScaleStaff', ['navigationService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryNavigationService', function(navigationService, virtualCowriterService, musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="scale-staff-container row" style="width: 100%;">' +
                    '<dmusiclibrary-staff class="has-context-menu" ng-context-menu="menuOptions" staff="staff.Staff" report="staff.Report" container-parent-class="\'scale-staff-container\'"></dmusiclibrary-staff>' +
                    '<dmusiclibrary-midi-sound midi-sound="scale.MidiSound"></dmusiclibrary-midi-sound>' +
                '</div>',
            scope: {
                scale:'=',
                staff: '='
            },
            link: function (scope, elem, attrs) {
                scope.scaleName = virtualCowriterService.getScaleName(scope.scale, /*useNoteNamesIfUnknown*/true);
                scope.noteNameString = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave);
                scope.searchText = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave, /*includeOctaveNumber*/true);

                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.scaleName,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.searchText);
                    }
                ]);

            }
        };
    }])
    .directive('dmusiclibraryScaleLine', ['dmusiclibraryNavigationService', 'dmusiclibraryVirtualCowriterService', function(musicNavigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<span ng-show="!showDetails"><span class="has-context-menu" ng-context-menu="menuOptions">{{scaleName}} </span> <dmusiclibrary-midi-sound midi-sound="scale.MidiSound"></dmusiclibrary-midi-sound></span>' +
                    '<div class="darker-well" ng-if="showDetails">' +
                    '<span class="glyphicon glyphicon-remove remove-icon" ng-click="removeClicked()"></span>' +
                    '<dmusiclibrary-scale-basic-info scale="scale"></dmusiclibrary-scale-basic-info>' +
                    '</div>' +
                '</div>',
            scope: {
                scale:'='
            },
            link: function (scope, elem, attrs) {

                scope.showDetails = false;

                scope.removeClicked = function() {
                    scope.showDetails = false;
                };

                scope.$watch('scale', function (newVal) {
                    if (newVal) {
                        scope.scaleName = virtualCowriterService.getScaleName(scope.scale, /*useNoteNamesIfUnknown*/true);
                        scope.noteNameString = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave);
                        scope.searchText = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave, /*includeOctaveNumber*/true);

                        scope.menuOptions = {
                            onShow: null,
                            items: []
                        };

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.scaleName,
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.searchText + ' Scale');
                            }
                        ]);

                        scope.menuOptions.items.push(['Details',
                            function($itemScope) {
                                scope.showDetails = true;
                            }
                        ]);

                    }

                });
            }
        };
    }])
    .directive('dmusiclibraryScaleModes', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<div ng-repeat="mode in modes">' +
                    '<dmusiclibrary-scale-line scale="mode"></dmusiclibrary-scale-line>' +
                    '</div>' +
                '</div>',
            scope: {
                scale:'=',
                modes: '='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryHarmonizedChords', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h5 style="font-weight: bolder;">{{harmonizedChords.Title}}</h5>' +
                    '<div ng-if="chords">' +
                    '<div ng-repeat="chord in chords">' +
                    '<dmusiclibrary-chord-line chord="chord" prefer-chord-symbol="true"></dmusiclibrary-chord-line>' +
                    '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                scale:'=',
                harmonizedChords: '='
            },
            link: function (scope, elem, attrs) {
                scope.chords = [];
                scope.harmonizedChords.Chords.forEach(function(chordsList) {
                    if(chordsList.length > 0)
                        scope.chords.push(chordsList[0]);
                });

            }
        };
    }])
    .directive('dmusiclibraryVcScaleChart', ['$rootScope', 'dmusiclibraryNavigationService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryScaleService', function($rootScope, musicNavigationService, virtualCowriterService, scaleService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center" ng-click="scaleChartClicked()" >' +
                    '<dmusiclibrary-chord-chart ng-if="ready" class="has-context-menu" ng-context-menu="menuOptions" chord-chart="scaleChartResult.ScaleChart"></dmusiclibrary-chord-chart>' +
                    '<div>{{scaleChartResult.ScaleChart.GuitarType}} <dmusiclibrary-midi-sound midi-sound="scaleChartResult.TabScale.MidiSound"></dmusiclibrary-midi-sound></div>' +
                '</div>',
            scope: {
                scale: '=',
                scaleChartResult: '='
            },
            link: function (scope, elem, attrs) {
                scope.scaleName = virtualCowriterService.getScaleName(scope.scale);
                scope.noteNameString = virtualCowriterService.getNoteNameString(scope.scale.NoteNamesWithinOctave);

                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.noteNameString,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.noteNameString);
                    }
                ]);

                scope.menuOptions.items.push(['View on Fretboard',
                    function($itemScope) {
                        showScaleOnFretboard(true);
                    }
                ]);

                var showScaleOnFretboard = function(scrollToFretboard) {
                    var setFretboardNotesData = {
                        scaleChartResult: scope.scaleChartResult,
                        scrollToFirstNote: true,
                        scrollToFretboard: scrollToFretboard
                    };
                    $rootScope.$broadcast('setFretboardNotes', setFretboardNotesData);
                    $rootScope.$emit('setFretboardNotes', setFretboardNotesData);
                };

                scope.scaleChartClicked = function() {
                    showScaleOnFretboard(false);
                };

                scope.renderChart = function() {
                    scope.scaleChartResult.ScaleChart.Title = scope.scaleName;
                    scope.ready = true;

                    showScaleOnFretboard();
                };
                scope.renderChart();


                scope.$on('instrumentChanged', function(event, data) {
                    scope.ready = false;

                    scaleService.setScaleChartFromService(scope.scale, {
                        PreferredMaxFretsPerString: null
                    }, function(data) {
                        // Scale Chart Success
                        scope.scaleChartResult = scope.scale.ScaleChartResult;
                        scope.renderChart();
                    }, function(data) {
                        // Scale Chart Failure
                        scope.renderChart();
                    });
                });
            }
        };
    }])


    .directive('dmusiclibraryChordInversionsArea', [function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div ng-show="!chord.inversions"><loading></loading> Loading {{chord.TitleChordName.FullName}} Inversions...</div>' +
                    '<dmusiclibrary-chord-inversions ng-if="chord.inversions" chord="chord" inversions="chord.inversions"></dmusiclibrary-chord-inversions>' +
                '</div>',
            scope: {
                chord:'='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryChordStaffArea', [function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div ng-show="!chord.Staff"><loading></loading> Loading {{chord.TitleChordName.FullName}} Notation...</div>' +
                    '<dmusiclibrary-chord-staff ng-if="chord.Staff" chord="chord" staff="chord.Staff"></dmusiclibrary-chord-staff>' +
                '</div>',
            scope: {
                chord:'='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryChordStaff', ['dmusiclibraryNavigationService', function(musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="chord-staff-container">' +
                    '<dmusiclibrary-staff class="has-context-menu" ng-context-menu="menuOptions" staff="staff.Staff" report="staff.Report" container-parent-class="\'chord-staff-container\'"></dmusiclibrary-staff>' +
                '</div>',
            scope: {
                chord:'=',
                staff: '='
            },
            link: function (scope, elem, attrs) {

                scope.chordName = scope.chord.TitleChordName.FullName;

                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.chordName,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.chordName + ' Chord');
                    }
                ]);

            }
        };
    }])
    .directive('dmusiclibraryChordLine', ['dmusiclibraryNavigationService', function(musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<span ng-show=!showDetails><span class="has-context-menu" ng-context-menu="menuOptions">{{text}}</span> <dmusiclibrary-midi-sound midi-sound="chord.ChordSound"></dmusiclibrary-midi-sound></span>' +
                    '<div class="darker-well" ng-if="showDetails">' +
                        '<span class="glyphicon glyphicon-remove remove-icon" ng-click="removeClicked()"></span>' +
                        '<dmusiclibrary-chord-basic-info chord="chord"></dmusiclibrary-chord-basic-info>' +
                    '</div>' +
                '</div>',
            scope: {
                chord:'=',
                preferChordSymbol: '='
            },
            link: function (scope, elem, attrs) {

                scope.showDetails = false;

                scope.removeClicked = function() {
                    scope.showDetails = false;
                };

                scope.$watch('chord', function (newVal) {
                    if (newVal) {
                        scope.chordName = scope.chord.TitleChordName.FullName;
                        scope.text = scope.preferChordSymbol && scope.chord.ChordSymbol ? scope.chord.ChordSymbol.Name + ' (' + scope.chordName + ')' : scope.chordName;

                        scope.menuOptions = {
                            onShow: null,
                            items: []
                        };

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.chordName,
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.chordName);
                            }
                        ]);

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Scale',
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.chordName + ' Scale');
                            }
                        ]);

                        scope.menuOptions.items.push(['Details',
                            function($itemScope) {
                                scope.showDetails = true;
                            }
                        ]);

                    }

                });
            }
        };
    }])
    .directive('dmusiclibraryChordInversions', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h5 style="font-weight: bolder;">Inversions and Slash Chords</h5>' +
                    '<div ng-repeat="inversion in inversions">' +
                    '<dmusiclibrary-chord-line chord="inversion"></dmusiclibrary-chord-line>' +
                    '</div>' +
                '</div>',
            scope: {
                chord:'=',
                inversions: '='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryVcChordChart', ['$rootScope', 'dmusiclibraryNavigationService', 'dmusiclibraryVirtualCowriterService', function($rootScope, musicNavigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center" ng-click="chordChartClicked()" >' +
                    '<h4 style="margin-top: 0px;"><dmusiclibrary-tab-chord-name tab-chord="chordChart.TabChord"></dmusiclibrary-tab-chord-name> <dmusiclibrary-midi-sound midi-sound="chordChart.TabChord.Chord.ChordSound"></dmusiclibrary-midi-sound></h4>' +
                    '<div><dmusiclibrary-note-name-list note-names="chordChart.TabChord.Chord.NoteNames"></dmusiclibrary-note-name-list> <dmusiclibrary-midi-sound midi-sound="chordChart.TabChord.Chord.NotesSound"></dmusiclibrary-midi-sound></div>' +
                    '<div><dmusiclibrary-note-number-name-list note-number-names="chordChart.ChordFormula.NoteNumberNames"></dmusiclibrary-note-number-name-list></div>' +
                    '<dmusiclibrary-chord-chart ng-if="ready" max-width="maxWidth" class="has-context-menu" ng-context-menu="menuOptions" chord-chart="chordChart.ChordChart"></dmusiclibrary-chord-chart>' +
                    '<div>{{chordChart.ChordChart.GuitarType}}</div>' +
                    '<div>{{chordChart.ChordChart.Properties.DifficultyTypeString}} - {{chordChart.ChordChart.Properties.DifficultyRating}}</div>' +
                '</div>',
            scope: {
                chord:'=',
                chordChart: '='
            },
            controller: ['$scope', function($scope) {
                $scope.chordName = $scope.chord.TitleChordName.FullName;
                $scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                $scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + $scope.chordChart.TabChord.Title,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter($scope.chordChart.TabChord.Title);
                    }
                ]);

                $scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Scale',
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter($scope.chordChart.TabChord.Title + ' Scale');
                    }
                ]);



                $scope.menuOptions.items.push(['View on Fretboard',
                    function($itemScope) {
                        virtualCowriterService.showChordOnFretboard($scope.chordChart.TabChord, /*scrollToFretboard*/true);
                    }
                ]);
            }],
            link: function (scope, elem, attrs) {
                scope.maxWidth = elem.width();
                scope.ready = true;

                scope.chordChartClicked = function() {
                    virtualCowriterService.showChordOnFretboard(scope.chordChart.TabChord, /*scrollToFretboard*/false);
                };


            }
        };
    }])
    .directive('dmusiclibraryChordCharts', ['homeService', 'dmusiclibraryInstrumentService', 'dmusiclibraryChordService', 'dmusiclibraryVirtualCowriterService', '$timeout', '$compile', '$rootScope', function(homeService, instrumentService, chordService, virtualCowriterService, $timeout, $compile, $rootScope) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<div class="vc-chord-chart-container">' +
                    '</div>' +
                '</div>',
            scope: {
                chord:'=',
                chordCharts: '=',
                displayChartsInRow: '=',
                /* If true, the first chord chart will not be shown on the fretboard upon rendering */
                suppressShowingFirstChartOnFretboard: '=',
                rowSize: '@',
                suppressPanels: '='
            },
            link: function (scope, elem, attrs) {


                if(!scope.rowSize) {
                    scope.rowSize = 3;
                }

                scope.renderChordCharts = function() {

                    var chordChartContainer = $(elem).find('.vc-chord-chart-container');
                    chordChartContainer.empty();

                    if(scope.chordCharts.length <= 0 || (scope.chordCharts.length == 1 &&
                        scope.chordCharts[0] === null)) {
                        chordChartContainer.append('<h3>No Chord Charts Found</h3>');
                        return;
                    }

                    if(!scope.suppressShowingFirstChartOnFretboard)
                        virtualCowriterService.showChordOnFretboard(scope.chordCharts[0].TabChord, /*scrollToFretboard*/false);

                    var chordChartIndex = 0;

                    var chordChartGroupElement = null;
                    var chordChartGroup = [];
                    var chordGroupSize = scope.rowSize;

                    var processNextGroup = function() {

                        if(chordChartIndex >= scope.chordCharts.length)
                            return;

                        var chordChart = scope.chordCharts[chordChartIndex];

                        var isGroupFull = scope.displayChartsInRow ? false : chordChartGroup.length >= chordGroupSize;
                        if(isGroupFull || chordChartGroupElement === null) {
                            chordChartGroupElement = $('<div class="row' + (scope.suppressPanels ? '' : ' small-panel') + '" ' + (scope.displayChartsInRow ? 'style="white-space: nowrap; overflow-x: auto;"' : '') + '></div>');
                            if(scope.suppressPanels) {
                                chordChartGroupElement.css('margin-top', 20);
                            }
                            chordChartContainer.append(chordChartGroupElement);
                            chordChartGroup = [];
                        }
                        chordChartGroup.push(chordChart);

                        var chordChartScope = scope.$new(true);
                        chordChartScope.chordChart = chordChart;
                        chordChartScope.chord = scope.chord;
                        var compiledElement =
                            $compile(
                                '<div class="col-md-' + (12/chordGroupSize) + ' ' + (scope.displayChartsInRow ? 'chord-chart-panel' : '') + '">' +
                                    '<dmusiclibrary-vc-chord-chart chord-chart="chordChart" chord="chord"></dmusiclibrary-vc-chord-chart>' +
                                    '</div>')(chordChartScope);
                        chordChartGroupElement.append(compiledElement);

                        chordChartIndex++;

                        $timeout(processNextGroup, 0);
                    };
                    processNextGroup();
                };
                scope.renderChordCharts();

                scope.$on('instrumentChanged', function(event, data) {
                    chordService.getChordCharts(scope.chord, instrumentService.getChordChartOptions(),
                        function(data) {
                            // Success
                            scope.chordCharts = data.ChordCharts;
                            scope.chord.ChordCharts = scope.chordCharts;
                            scope.renderChordCharts();
                        }, function(data) {
                            // Failure
                            console.error('Could not retrieve chord charts.');
                        });
                });
            }
        };
    }])
    .directive('dmusiclibraryVcFretboard', ['$timeout', 'dmusiclibraryVirtualCowriterService', function($timeout, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div id="fretboard-container" ng-if="renderFretboard">' +
                        '<dmusiclibrary-instrument-fretboard clearFretsButton="false" options="fretboardOptions"></dmusiclibrary-instrument-fretboard>' +
                    '</div>' +
                '</div>',
            scope: {
                tabChord: '=?'
            },
            link: function (scope, elem, attrs) {

                /*
                 //To affix fretboard:
                 // Wait for the fretboard to be rendered using $timeout
                 $timeout(function() {
                 var fretboardContainerElement = elem.find('#fretboard-container');
                 fretboardContainerElement.affix({
                 offset: { top: $('#header').offset().top }
                 });
                 }, 0);
                 */

                scope.fretboardOptions = {
                    isChordMode: true,
                    fretboardConfig: {
                        /* enable readonly mode */
                        noteClickingDisabled: true
                    }
                };
                // We won't render the fretboard until the next round because it's slower to render
                // than the other elements we want to show immediately.
                $timeout(function() {
                    scope.renderFretboard = true;

                    if(scope.tabChord) {
                        $timeout(function() {
                            virtualCowriterService.showChordOnFretboard(scope.tabChord, /*scrollToFretboard*/false);
                        }, 0);
                    }
                }, 0);


            }
        };
    }])
    .directive('dmusiclibraryChordName', ['dmusiclibraryNavigationService', function(musicNavigationService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<span class="has-context-menu" ng-context-menu="menuOptions">{{chordName}}</span>',
            scope: {
                chordName:'='
            },
            link: function (scope, elem, attrs) {

                scope.menuOptions = {
                    onShow: null,
                    items: []
                };

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.chordName,
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.chordName + ' Chord');
                    }
                ]);

                scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Scale',
                    function($itemScope) {
                        musicNavigationService.goToVirtualCowriter(scope.chordName + ' Scale');
                    }
                ]);
            }
        };
    }])
    .directive('dmusiclibraryChordBasicInfo', ['navigationService', 'dmusiclibraryVirtualCowriterService', function(navigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="text-center">' +
                    '<h3 style="margin-top: 0px; font-weight: bolder;"><dmusiclibrary-chord-name chord-name="chord.TitleChordName.FullName"></dmusiclibrary-chord-name> <dmusiclibrary-midi-sound midi-sound="chord.ChordSound"></dmusiclibrary-midi-sound></h3>' +
                    '<h5 ng-show="chord.ChordSymbol" style="font-weight: bolder;">{{chord.ChordSymbol.Name}}</h5>' +
                    '<h5 style="font-weight: bolder;"><dmusiclibrary-note-name-list note-names="chord.NoteNames"></dmusiclibrary-note-name-list> <dmusiclibrary-midi-sound midi-sound="chord.NotesSound"></dmusiclibrary-midi-sound></h5>' +
                    '<h5 style="font-weight: bolder;"><dmusiclibrary-note-number-name-list note-number-names="chord.ChordFormula.NoteNumberNames"></dmusiclibrary-note-number-name-list></h5>' +
                '</div>',
            scope: {
                chord:'='
            },
            link: function (scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryNoteNameList', ['dmusiclibraryNavigationService', 'dmusiclibraryVirtualCowriterService', function(musicNavigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<span class="has-context-menu" ng-context-menu="menuOptions">' +
                    '{{text}}' +
                '</span>',
            scope: {
                noteNames:'='
            },
            link: function (scope, elem, attrs) {

                scope.$watch('noteNames', function (newVal) {
                    if (newVal) {
                        scope.text = virtualCowriterService.getNoteNameString(scope.noteNames);
                        scope.searchText = virtualCowriterService.getNoteNameString(scope.noteNames, /*includeOctaveNumber*/true);
                    }

                    scope.menuOptions = {
                        onShow: null,
                        items: []
                    };


                    scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.text,
                        function($itemScope) {
                            musicNavigationService.goToVirtualCowriter(scope.searchText);
                        }
                    ]);

                    scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Chord',
                        function($itemScope) {
                            musicNavigationService.goToVirtualCowriter(scope.searchText + ' Chord');
                        }
                    ]);


                    scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> as Scale',
                        function($itemScope) {
                            musicNavigationService.goToVirtualCowriter(scope.searchText + ' Scale');
                        }
                    ]);
                });
            }
        };
    }])
    .directive('dmusiclibraryNoteNumberNameList', ['dmusiclibraryNavigationService', 'dmusiclibraryVirtualCowriterService', function(musicNavigationService, virtualCowriterService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<span class="has-context-menu" ng-context-menu="menuOptions">' +
                    '{{text}}' +
                '</span>',
            scope: {
                noteNumberNames:'='
            },
            link: function (scope, elem, attrs) {

                scope.$watch('noteNumberNames', function (newVal) {
                    if (newVal) {
                        scope.text = virtualCowriterService.getNoteNumberNameString(scope.noteNumberNames);

                        scope.menuOptions = {
                            onShow: null,
                            items: []
                        };

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon> ' + scope.text,
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.text);
                            }
                        ]);

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon>  as Chord',
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.text + ' Chord');
                            }
                        ]);

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon>  as Scale',
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.text + ' Scale');
                            }
                        ]);

                        scope.menuOptions.items.push(['<dmusiclibrary-search-icon></dmusiclibrary-search-icon>  as Chord Progression',
                            function($itemScope) {
                                musicNavigationService.goToVirtualCowriter(scope.text + ' Chord Progression');
                            }
                        ]);
                    }
                });
            }
        };
    }])
    .directive('dmusiclibraryChordChart', ['uiService', 'dmusiclibraryInstrumentService', function(uiService, instrumentService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div class="chordChart">' +
                    '<canvas class="chordCanvas" style="display: none;"></canvas>' +
                    '<img class="chordCanvasImage" alt="Chord Chart">' +
                '</div>',
            scope: {
                chordChart: '=',
                maxWidth: '='
            },
            link: function($scope, element, attrs) {
                var chordChart = $scope.chordChart;
                var stringNotes = [];
                for(var i = 0; i < chordChart.StringNoteNames.length; i++) {
                    stringNotes.push(chordChart.StringNoteNames[i].Name);
                }


                var minChartHeight = stringNotes.length <= 4 ? 200 : 150;//150;

                var chartHeight = chordChart.FretCount * 27;
                if(chartHeight < minChartHeight)
                    chartHeight = minChartHeight;

                var chartWidth = stringNotes.length <= 4 ? stringNotes.length * 30 : stringNotes.length * 24;//stringNotes.length * 21;



                var chordChartElement = $(element);
                var chordCanvas = chordChartElement.find('.chordCanvas');
                var chordCanvasImage = chordChartElement.find('.chordCanvasImage');




                // Constrain the width if applicable
                if($scope.maxWidth) {
                    if(chartWidth > $scope.maxWidth)
                        chartWidth = $scope.maxWidth;

                    chordChartElement.width(chartWidth);

                    element.css('margin-left', -10);
                }
                var widthForFretNumber = 50;

                var paperHeight = chartHeight + ((angular.isDefined(chordChart.Title) && chordChart.Title !== null) ? 40 : 20);
                var paperWidth = chartWidth + widthForFretNumber;

                var tabString = "(";
                var tabStrings = [];
                for(i = 0; i < chordChart.FretsPerString.length; i++) {
                    var fret = chordChart.FretsPerString[i];
                    var fretIndex = (!angular.isDefined(fret.FretIndex) || fret.FretIndex === null ? "x" : fret.IsOpenFret ? 0 : fret.FretIndex);
                    tabString += fretIndex.toString();
                    tabStrings.push([fret.StringIndex, fretIndex, fret.Finger]);
                }
                tabString += ")";

                var bars = [];
                for(i = 0; i < chordChart.Bars.length; i++) {
                    var bar = chordChart.Bars[i];
                    bars.push({
                        from_string: bar.FromStringIndex,
                        to_string: bar.ToStringIndex,
                        fret: bar.Fret
                    });
                }

                var XOffset = (paperWidth - chartWidth)/2;
                var yOffset = 5;

                var chordCanvasElement = chordCanvas[0];
                var chordCanvasImageElement = chordCanvasImage[0];
                var paper = uiService.createHiDefContext(paperWidth, paperHeight, 2.5, chordCanvasElement, null, chordCanvasImageElement);


                var chord = new ChordBox(uiService, paper, /*x*/XOffset, /*y*/yOffset, /*width*/chartWidth, /*height*/chartHeight,
                    /*num_strings*/stringNotes.length,
                    /*num_frets*/ chordChart.FretCount);

                chord.setChord(tabStrings,
                    /*the absolute fret on the fretboard at which to begin drawing the frets*/ chordChart.AbsoluteChartFretPosition,
                    /*the fret on which to draw the number*/chordChart.FretAtWhichToDrawPositionText,
                    /*position text*/chordChart.AbsoluteChartFretPosition,
                    /*bars*/bars,
                    stringNotes, chordChart.Title);
                chord.draw();

                var canvas = chord.paper.canvas;

                var dataUrl = canvas.toDataURL();

                chordCanvasImageElement.src = dataUrl;
                var altString = tabString + ' - ' + instrumentService.getShortNameOfCurrentInstrument() + (angular.isDefined(chordChart.Title) && ' - ' + chordChart.Title !== null ? chordChart.Title : '');

                chordCanvasImageElement.alt = altString;

            }
        };
    }])
    .directive('dmusiclibrarySearchIcon', [function() {
        return {
            restrict: 'E',
            replace: true,
            template: '<span class="glyphicon glyphicon-search"></span>',
            link: function (scope, elem, attrs) {

            }
        };
    }]);

