angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryChordService', ['$rootScope', '$http', 'commService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryInstrumentService', 'dmusiclibraryCommService', function($rootScope, $http, commService, virtualCowriterService, instrumentService, musicCommService) {
        return {
            getInversions: function(chord, inversionOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'Inversions',
                    Chord: chord,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    InversionOptions: inversionOptions
                }, onSuccess, onFailure);
            },
            getNotation: function(chord, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'Notation',
                    Chord: chord
                }, onSuccess, onFailure);
            },
            getChordCharts: function(chord, chordChartOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'ChordCharts',
                    Chord: chord,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    ChordChartOptions: chordChartOptions
                }, onSuccess, onFailure);
            },
            /* Fills the given chord with notation, inversions, chord charts, etc. */
            fillChordData: function(chord, chordChartOptions) {
                // Start getting the notation
                this.getNotation(chord, function(data) {
                    // Success
                    chord.Staff = data.Staff;
                }, function(data) {
                    // Failure
                    var k = 3;
                });

                // Start getting the inversions
                this.getInversions(chord, {
                    AllowSlashChords: true
                }, function(data) {
                    // Success
                    chord.inversions = data.Inversions;
                }, function(data) {
                    // Failure
                    var k = 3;
                });

                // Start getting the chord charts
                var chordChartOptionsFromInstrumentService = instrumentService.getChordChartOptions();
                if(chordChartOptions)
                    chordChartOptionsFromInstrumentService = angular.extend(chordChartOptionsFromInstrumentService, chordChartOptions);

                this.getChordCharts(chord, chordChartOptionsFromInstrumentService, function(data) {
                    // Success
                    chord.ChordCharts = data.ChordCharts;
                    if(chord.ChordCharts.length <= 0) {
                        chord.ChordCharts.push(null);
                    }
                }, function(data) {
                    // Failure
                    var k = 3;
                });
            },
            getVoicings: function(chord, chordVoicingsOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'Voicings',
                    Chord: chord,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    ChordVoicingsOptions: chordVoicingsOptions
                }, onSuccess, onFailure);
            },
            getChordDestinations: function(chord, chordDestinationOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'Destinations',
                    Chord: chord,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    ChordDestinationOptions: chordDestinationOptions
                }, onSuccess, onFailure);
            },
            getChordSources: function(chord, chordSourceOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'Sources',
                    Chord: chord,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    ChordSourceOptions: chordSourceOptions
                }, onSuccess, onFailure);
            },
            getChordSubstitutions: function(chord, chordSubstitutionOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('chord', {
                    RequestType: 'Substitutions',
                    Chord: chord,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    ChordSubstitutionOptions: chordSubstitutionOptions
                }, onSuccess, onFailure);
            },
            getDefaultChordDirectionalityOptions: function(keys, useChordProgressionFormulas) {
                return {
                    Keys: keys,
                    MinChordSize: 3,
                    MaxChordSize: 4,
                    MaxMovementInHalfSteps: 3,
                    ExcludeSusChords: true,
                    MinUniqueNoteNames: 3,
                    MustHaveSecondThirdOrFourth: true,
                    UseChordProgressionFormulas: useChordProgressionFormulas,
                    ExcludeExtensions: true,
                    GatherChordCharacteristics: true
                };
            },
            getDefaultChordSubstitutionOptions: function(key, useChordProgressionFormulas) {
                return {
                    Key: key,
                    SubstitutionMustShareCharacteristicTones: true,
                    EnforceOctaveMatchForSubstitution: false,
                    MinChordSize: 3,
                    MaxChordSize: 4,
                    MaxMovementInHalfSteps: 3
                };
            },
            generateChords: function(previousChord, chordToReplace, nextChord, key, useChordProgressionFormulas, onSuccess, onFailure,
                                     chordDirectionalityOptions, chordSubstitutionOptions) {

                if(!chordDirectionalityOptions) {
                    chordDirectionalityOptions = this.getDefaultChordDirectionalityOptions(null, useChordProgressionFormulas);
                }
                if(!chordSubstitutionOptions) {
                    chordSubstitutionOptions = this.getDefaultChordSubstitutionOptions();
                }

                musicCommService.postWithParams('chord', {
                    RequestType: 'GenerateChords',
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    GenerateChordOptions: {
                        PreviousChord: previousChord,
                        ChordToReplace: chordToReplace,
                        NextChord: nextChord,
                        Key: key,
                        ChordDirectionalityOptions: chordDirectionalityOptions,
                        ChordSubstitutionOptions: chordSubstitutionOptions
                    }
                }, onSuccess, onFailure);
            }
        };
    }]);