angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryEditInstrumentDropdown', ['dmusiclibraryInstrumentService', '$rootScope', 'commService', function(instrumentService, $rootScope, commService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div class="col-md-10" style="margin-left: 0px; padding-left: 0px;">' +
                        '<select class="form-control" ng-model="basicGuitar" ng-options="basicGuitar.BasicName for basicGuitar in basicGuitars" ng-change="instrumentChanged()">' +
                            '<option value="">{{originallySelectedInstrument.Name}}</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="col-md-2" style="margin-right: 0px; margin-left: 0px; padding-right: 0px; padding-left: 0px;">' +
                        '<div class="input-group-btn">' +
                            '<button ng-click="editInstrument()" tooltip="Customize Your Instrument" tooltip-placement="bottom" type="submit" class="btn form-control" ng-class="{\'btn-primary\' : blueButton}" style="border-radius: 4px;"><span class="glyphicon glyphicon-pencil"></span></button>' +
                        '</div>' +
                    '</div>' +

                '</div>',
            scope: {
                blueButton: '='
            },
            link: function($scope, elem, attrs) {

                $scope.editInstrument = function() {
                    instrumentService.goToEditInstrument();
                };

                var senderName = 'editInstrumentLink' + $scope.$id;
                var initializeInstrumentInformation = function() {
                    $scope.originallySelectedInstrument = instrumentService.instrument;
                    $scope.basicGuitar = null;
                    $scope.basicGuitars = instrumentService.basicGuitars;

                    $rootScope.$on('instrumentChanged', function(event, data) {
                        // make sure we aren't the one that caused the instrument change or else
                        // we'll just enter an infinite loop.
                        if(data.sender !== senderName) {
                            for(var i = 0; i < $scope.basicGuitars.length; i++) {
                                if(data.instrument.Name === $scope.basicGuitars[i].Name) {
                                    $scope.basicGuitar = $scope.basicGuitars[i];
                                    break;
                                }
                            }
                        }
                    });
                };

                if(instrumentService.initialized) {
                    initializeInstrumentInformation();
                }
                else {
                    $rootScope.$on('instrumentServiceInitialized', function(event, data) {
                        initializeInstrumentInformation();
                    });
                }

                $scope.instrumentChanged = function() {
                    // Change the instrument
                    if(!$scope.basicGuitar) {
                        instrumentService.setInstrument($scope.originallySelectedInstrument, /*sender*/senderName);
                    }
                    else {
                        instrumentService.setInstrument($scope.basicGuitar, /*sender*/senderName);
                    }

                    commService.showSuccessAlert('Your instrument has been changed to ' + instrumentService.getNameOfCurrentInstrument() + '.');
                };
            }
        };
    }])
    .directive('dmusiclibraryGuitarString', function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div class="row guitar-string-well" style="margin-top: 5px;">' +
                    '<div style="float: left">{{guitarString.stringNumber}}</div>' +
                    '<div class="col-sm-3">' +
                        'Start Fret: <select ng-change="onGuitarStartingFretChanged(guitarString)" class="form-control" required ng-model="guitarString.startingFret" ng-options="fretOption for fretOption in fretOptions"></select>' +
                    '</div>' +
                    '<div class="col-sm-3">' +
                        'End Fret: <select ng-change="onGuitarEndingFretChanged(guitarString)" class="form-control" required ng-model="guitarString.endingFret" ng-options="fretOption for fretOption in fretOptions"></select>' +
                    '</div>' +
                    '<div class="col-sm-2">' +
                        'Note: <select ng-change="onGuitarTuningChanged(guitarString)" class="form-control" required ng-model="guitarString.noteName" ng-options="noteOption for noteOption in noteOptions"></select>' +
                    '</div>' +
                    '<div class="col-sm-2">' +
                        'Octave: <select ng-change="onGuitarTuningChanged(guitarString)" class="form-control" required ng-model="guitarString.octave" ng-options="octaveOption for octaveOption in octaveOptions"></select>' +
                    '</div>' +
                    '<div class="col-sm-1">' +
                        '<a ng-click="onRemoveString(guitarString)">Remove String<span class="glyphicon glyphicon-remove"></span></a>' +
                    '</div>' +
                '</div>',
            scope: {
                guitarString: '=',
                noteOptions: '=',
                octaveOptions: '=',
                fretOptions: '=',
                onRemoveString: '=',
                onGuitarTuningChanged: '=',
                onGuitarStartingFretChanged: '=',
                onGuitarEndingFretChanged: '='
            },
            link: function(scope, elem, attrs) {


            }
        };
    })
    .directive('dmusiclibraryInstrumentFretboard', ['dmusiclibraryFretboardJsService', 'navigationService', '$timeout', 'dmusiclibraryInstrumentService', function(fretboardJsService, navigationService, $timeout, instrumentService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div class="instrument-fretboard-container">' +
                    '<a id="fretboard"></a>' +
                    '<div ng-if="fretboardConfig" class="instrument-fretboard" fretboard fretboard-config="fretboardConfig"></div>' +
                    '<div ng-if="clearFretsButton" class="clearfix">' +
                        '<button class="btn-warning unclick-btn pull-left" ng-click = "unclick()">Clear Frets</button>' +
                    '</div>' +
                '</div>',
            scope: {
                /* {
                 isChordMode: boolean,
                 fretboardConfig: { }
                 }*/
                options: '=',
                clearFretsButton: '='
            },
            link: function($scope, elem, attrs) {

                $scope.fretboardConfig = null;

                $scope.initializeFretboard = function() {
                    fretboardJsService.getDefaultFretboardConfig($scope.isChordMode).then(function(config) {
                        // The config being present will trigger a render by the fretboard directive
                        $scope.fretboardConfig = angular.extend(config, $scope.options.fretboardConfig);

                        if(!$scope.options.fretboardConfig || !angular.isDefined($scope.options.fretboardConfig.numFrets)) {
                            $scope.fretboardConfig.numFrets = instrumentService.getMaxFret();
                        }
                    });
                };
                $timeout(function() {
                    $scope.initializeFretboard();
                });

                $scope.getTabString = function() {
                    return fretboardJsService.getTabStringFromFretboard($scope.isChordMode, $scope.fretboardConfig);
                };
                $scope.unclick = function() {
                    $scope.fretboardConfig.clickedNotes = [];
                };

                $scope.$on('instrumentChanged', function(event, data) {
                    $timeout(function() {
                        fretboardJsService.getTuning().then(function(tuning) {
                            if ($scope.fretboardConfig) {
                                $scope.fretboardConfig.numFrets = instrumentService.getMaxFret();
                                $scope.fretboardConfig.guitarStringNotes = angular.copy(tuning);
                            }
                        });
                    }, 0);

                });

                $scope.$on('setFretboardNotes', function(event, data) {
                    $scope.fretboardConfig.clickedNotes = [];

                    var lastFret = 0;
                    if(data.tabChord) {
                        fretboardJsService.addChordToFretboard($scope.fretboardConfig, data.tabChord);

                        data.tabChord.FretsPerString.forEach(function(fret) {
                            if(fret !== null && fret > lastFret)
                                lastFret = fret;
                        });
                    }
                    else if(data.scaleChartResult) {
                        fretboardJsService.addScaleToFretboard($scope.fretboardConfig, data.scaleChartResult);

                        data.scaleChartResult.TabScale.Notes.forEach(function(stringAndFretIndex) {
                            if(stringAndFretIndex.FretIndex !== null && stringAndFretIndex.FretIndex > lastFret)
                                lastFret = stringAndFretIndex.FretIndex;
                        });
                    }

                    if(data.scrollToFirstNote) {
                        /*
                         you'll have to do a little math based on the fret width and the offset, both
                         defined in the config for the fretboard. So you'd grab the element that the
                         fretboard directive is on, and scroll to the x-offset + (fretWidth * fretNumber)
                         */
                        var offsetWidth = $scope.fretboardConfig.fretboardOrigin[1];
                        var fretWidth = $scope.fretboardConfig.fretWidth;


                        var fretboardContainerElement = elem;//elem.siblings('.instrument-fretboard-container');
                        var fretboardElement = fretboardContainerElement.find('.instrument-fretboard');
                        var viewWidth = fretboardElement.width();

                        // We want to give some viewing space on the right of the chord
                        lastFret += 3;

                        var scrollPosition = (lastFret * fretWidth) - viewWidth + offsetWidth;
                        if(scrollPosition <= 0)
                            scrollPosition = 0;

                        fretboardElement[0].scrollLeft = scrollPosition;
                    }

                    if(data.scrollToFretboard) {
                        navigationService.scrollToHash('fretboard');
                    }
                });

            }
        };
    }]);