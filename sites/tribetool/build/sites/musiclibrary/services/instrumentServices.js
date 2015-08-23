angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryInstrumentService', ['$rootScope', '$http', '$modal', '$routeParams', '$location', 'commService', 'navigationService', 'dmusiclibraryCommService', function($rootScope, $http, $modal, $routeParams, $location, commService, navigationService, musicCommService) {
        return {
            tabOptions: {
                AllowDifficultBars: false,
                PreferNoBarChords: true,
                UseThumb: false
            },
            // The current search parameters for chord chart searches
            tabSearchParameters: {
                AllowInversions: false
            },
            getChordChartOptions: function() {
                return {
                    TabSearchParameters: this.tabSearchParameters
                };
            },
            editInstrumentOptions: {
                sourcePath: null
            },
            basicGuitars: [],
            guitarTypes: [],
            instrumentCombinations: [],
            standardGuitar: null,
            instrument: null,
            initialized: false,
            isInstrument: function(instrument) {
                return instrument && instrument.Fretboard && angular.isDefined(instrument.Fretboard.IsCustom);
            },
            getShortNameOfCurrentInstrument: function() {
                return (this.instrument.Fretboard.IsCustom || this.instrument.Tuning.IsCustom ? 'Custom ' : '') + this.instrument.GuitarType;
            },
            getNameOfCurrentInstrument: function() {
                return this.getInstrumentName(this.instrument);
            },
            loadInstrumentFromUrl: function() {
                if($routeParams.instrument && $routeParams.instrument !== 'null') {
                    if(this.isInstrumentJson($routeParams.instrument)) {
                        var instrument;
                        try {
                            instrument = angular.fromJson($routeParams.instrument);
                            if(this.isInstrument(instrument)) {
                                this.setInstrument(instrument);
                            }
                        }
                        catch(e) {
                            // invalid instrument
                        }

                    }
                }
            },
            /* Sets the instrument from the given instrument name (makes call to web service) */
            setInstrumentFromName: function(instrumentName, onSuccess, onFailure) {
                var my = this;
                this.getInstrumentFromName(instrumentName, function(result) {
                    if(result.Instruments && result.Instruments.length > 0) {
                        my.setInstrument(result.Instruments[0]);
                    }
                    else {
                        my.setInstrumentToGuitar();
                    }

                    if(onSuccess)
                        onSuccess(result);

                }, onFailure);
            },
            loadInstrumentNameFromRouteParams: function(onSuccess, onFailure) {
                if($routeParams.instrument) {
                    if(this.isInstrumentJson($routeParams.instrument)) {
                        // The instrument is json, so it will be taken care of elsewhere.
                        return;
                    }

                    var my = this;
                    var loadInstrumentFromName = function() {
                        commService.hideLoading();

                        // Get the instrument from its name
                        commService.showWarningAlert('Your instrument is being changed to ' + $routeParams.instrument + '.');

                        my.setInstrumentFromName($routeParams.instrument, onSuccess, onFailure);
                    };

                    commService.showLoading();
                    if(this.initialized) {
                        loadInstrumentFromName();
                    }
                    else {
                        $rootScope.$on('instrumentServiceInitialized', function(event, data) {
                            loadInstrumentFromName();
                        });
                    }
                }
            },
            isInstrumentJson: function(instrument) {
                try {
                    angular.fromJson($routeParams.instrument);
                    return true;
                }
                catch(e) {
                    // invalid json
                    return false;
                }
            },
            /* returns a bool indicating whether the instrument was added to the url */
            addInstrumentToUrl: function() {
                if(this.instrument) {
                    // all changes to $location during current $digest will be replacing the current history record, instead of adding a new one.
                    $location.replace();

                    if(JSON.stringify(this.instrument) !== $location.$$search.instrument) {

                        $location.search('instrument', JSON.stringify(this.instrument));
                        return true;
                    }
                }

                return false;
            },
            getInstrumentName: function(instrument) {
                if(instrument.Fretboard.IsCustom)
                    instrument.Fretboard.Name = "Custom " + instrument.Fretboard.StringFretBounds.length + "-String " + instrument.GuitarType;
                if(instrument.Tuning.IsCustom){
                    instrument.Tuning.Name = "";
                    for(var i = 0; i < instrument.Tuning.Notes.length; i++) {
                        var note = instrument.Tuning.Notes[i];
                        if(i > 0)
                            instrument.Tuning.Name += " ";
                        instrument.Tuning.Name += note.Name + note.OctaveNumber;
                    }
                }

                var capoString = '';
                if(instrument.Capo) {
                    capoString += ' Capo at ' + instrument.Capo.Fret;
                    if(!instrument.Capo.CoverAllStrings && instrument.Capo.StringsCovered < instrument.Fretboard.StringFretBounds.length) {
                        capoString += ' covering ' + instrument.Capo.StringsCovered + ' strings from ' + (instrument.Capo.LowToHighStrings ? 'low to high.' : 'high to low.');
                    }
                }

                return (instrument.IsLeftHanded ? 'Left-Handed  ' : '') + instrument.Fretboard.Name + ' (Tuning: "' + instrument.Tuning.Name + '")' + capoString;
            },
            getInstrumentBasicName: function(instrument) {
                return instrument.GuitarType + ' ' + instrument.Tuning.Name;
            },
            setInstrument: function(instrument, sender) {
                this.instrument = instrument;

                if(!this.instrument.Name)
                    this.instrument.Name = this.getInstrumentName(this.instrument);

                $rootScope.$emit('instrumentChanged', {
                    instrument: this.instrument,
                    sender: sender
                });
                $rootScope.$broadcast('instrumentChanged', {
                    instrument: this.instrument,
                    sender: sender
                });
            },
            setInstrumentToGuitar: function() {
                this.setInstrument(this.standardGuitar);
            },
            finishedEditInstrument: function($scope) {
                if(this.editInstrumentOptions.sourcePath){
                    $scope.goToPath(this.editInstrumentOptions.sourcePath);
                }
                else {
                    $scope.go('bazzle');
                }
            },
            goToEditInstrument: function() {
                this.editInstrumentOptions.sourcePath = $location.$$path;

                navigationService.go('instrument-settings');
            },
            getInstrumentFromInstrumentCombination: function(instrumentCombination, fretboard, tuning) {
                var instrument = {
                    Fretboard: fretboard,
                    IsLeftHanded: false,
                    InstrumentType: instrumentCombination.InstrumentType,
                    GuitarType: instrumentCombination.GuitarType,
                    Tuning: tuning
                };
                instrument.Name = this.getInstrumentName(instrument);
                instrument.BasicName = this.getInstrumentBasicName(instrument);
                return instrument;
            },
            initialize: function(onSuccess, onFailure) {
                var my = this;
                musicCommService.postWithParams('instrument', {
                }, function(data) {
                    my.instrumentCombinations = data.InstrumentCombinations;
                    my.standardGuitar = data.StandardGuitar;

                    my.initialized = true;

                    my.guitarTypes = [];
                    for(var i = 0; i < my.instrumentCombinations.length; i++) {
                        var alreadyContained = false;
                        for(var j = 0; j < my.guitarTypes.length; j++) {
                            if(my.guitarTypes[j] === my.instrumentCombinations[i].GuitarType) {
                                alreadyContained = true;
                                break;
                            }
                        }
                        if(!alreadyContained) {
                            my.guitarTypes.push(my.instrumentCombinations[i].GuitarType);
                        }
                    }

                    for(i = 0; i < my.instrumentCombinations.length; i++) {
                        var instrumentCombination = my.instrumentCombinations[i];
                        var fretboardAndTunings = instrumentCombination.FretboardAndTunings[0];
                        var fretboard = fretboardAndTunings.Fretboard;

                        var tunings = [fretboardAndTunings.Tunings[0]];

                        if(instrumentCombination.GuitarType === 'Guitar') {
                            for(var k = 0; k < fretboardAndTunings.Tunings.length; k++) {
                                if(fretboardAndTunings.Tunings[k].Name === 'Drop D') {
                                    tunings.push(fretboardAndTunings.Tunings[k]);
                                }
                            }
                        }
                        for(var l = 0; l < tunings.length; l++) {
                            var tuning = tunings[l];
                            my.basicGuitars.push(my.getInstrumentFromInstrumentCombination(instrumentCombination, fretboard, tuning));
                        }
                    }

                    if(onSuccess)
                        onSuccess();

                    $rootScope.$emit('instrumentServiceInitialized', []);
                    $rootScope.$broadcast('instrumentServiceInitialized', []);

                }, onFailure);
            },
            getInstrumentFromName: function(instrumentName, onSuccess, onFailure) {
                var my = this;
                musicCommService.postWithParams('instrument', {
                    InstrumentName: instrumentName
                }, onSuccess, onFailure);
            },
            /* Gets the maximum fret used in the current instrument */
            getMaxFret: function() {
                var maxFret = 0;
                for(var i = 0; i < this.instrument.Fretboard.StringFretBounds.length; i++) {
                    var stringFretBound = this.instrument.Fretboard.StringFretBounds[i];
                    if(stringFretBound.EndingFret > maxFret) {
                        maxFret = stringFretBound.EndingFret;
                    }
                }
                return maxFret;
            }
        };
    }]);