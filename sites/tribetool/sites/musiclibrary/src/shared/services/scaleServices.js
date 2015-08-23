angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryScaleService', ['$rootScope', '$http', 'commService', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryCommService', function($rootScope, $http, commService, virtualCowriterService, musicCommService) {
        return {
            /* Sets the inversions and modes for the given scale, using the web service */
            setModesAndInversionsFromService: function(scale, onSuccess, onFailure) {
                scale.Inversions = null;
                scale.ParallelModes = null;
                scale.RelativeModes = null;

                var tabScale = scale.ScaleChartResult ? scale.ScaleChartResult.TabScale : null;
                this.getModesAndInversions(scale, {
                    TabScale: tabScale
                }, function(data) {
                    // Success
                    scale.Inversions = data.Inversions;
                    scale.ParallelModes = data.ParallelModes;
                    scale.RelativeModes = data.RelativeModes;

                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            getModesAndInversions: function(scale, modesAndInversionsOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('scale', {
                    RequestType: 'ModesAndInversions',
                    Scale: scale,
                    ParserOptions: virtualCowriterService.getParserOptions(),
                    ModesAndInversionsOptions: modesAndInversionsOptions
                }, onSuccess, onFailure);
            },
            getNotation: function(scale, onSuccess, onFailure) {
                musicCommService.postWithParams('scale', {
                    RequestType: 'Notation',
                    Scale: scale
                }, function(data) {
                    if(data.Staff && data.Staff.Report && data.Staff.Report.MeasureText &&
                        data.Staff.Report.MeasureText.length > 0)
                        data.Staff.Report.MeasureText[0].Text = virtualCowriterService.getScaleName(scale, /*useNoteNamesIfUnknown*/ true);
                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            /* Loads the scaleChartResult for the given scale. */
            setScaleChartFromService: function(scale, scaleChartOptions, onSuccess, onFailure) {
                var options = {
                    PreferredMaxFretsPerString: null
                };
                options = angular.extend(options, scaleChartOptions);

                this.getScaleChart(scale, options, function(data) {
                    // Success
                    scale.ScaleChartResult = data.ScaleChartResult;
                    if(onSuccess)
                        onSuccess(data);

                }, onFailure);
            },
            getScaleChart: function(scale, scaleChartOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('scale', {
                    RequestType: 'ScaleChart',
                    Scale: scale,
                    ScaleChartOptions: scaleChartOptions,
                    ParserOptions: virtualCowriterService.getParserOptions()
                }, function(data) {
                    if(data.ScaleChartResult.TabScale) {
                        if(data.ScaleChartResult.TabScale.MidiSound)
                            scale.MidiSound = data.ScaleChartResult.TabScale.MidiSound;
                        if(!scale.IsAscending)
                            scale.AscendingMidiSound = data.ScaleChartResult.TabScale.AscendingMidiSound;
                    }

                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            getChordSymbols: function(scale, chordSymbolOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('scale', {
                    RequestType: 'ChordSymbols',
                    Scale: scale,
                    ChordSymbolOptions: chordSymbolOptions
                }, onSuccess, onFailure);
            },
            getScales: function(getScalesOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('scale', {
                    RequestType: 'GetScales',
                    GetScalesOptions: getScalesOptions
                }, onSuccess, onFailure);
            },
            setScaleOfBestFitForChordProgression: function(chordProgression, scaleOfBestFitOptions, onSuccess, onFailure) {
                var options = {
                    Chords: chordProgression.Chords
                };
                options = angular.extend(options, scaleOfBestFitOptions);

                this.getScaleOfBestFit(options, function(data) {
                    // Success
                    var scalesOfBestFit = data.ScaleOfBestFitResult.Scales;
                    chordProgression.ScalesOfBestFit = scalesOfBestFit;

                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            getScaleOfBestFit: function(scaleOfBestFitOptions, onSuccess, onFailure) {
                var options = {
                    ConsiderExoticScales: false,
                    ConsiderModes: true,
                    FitByHarmony: true,
                    ChordSize: 4,
                    ChordDistances: 3,
                    ScalesToConsider: ['Ionian', 'Melodic Minor', 'Harmonic Minor']
                };
                options = angular.extend(options, scaleOfBestFitOptions);

                musicCommService.postWithParams('scale', {
                    RequestType: 'ScaleOfBestFit',
                    ScaleOfBestFitOptions: options,
                    ParserOptions: virtualCowriterService.getParserOptions()
                }, onSuccess, onFailure);
            },
            harmonize: function(scale, scaleName, harmonizationOptions, onSuccess, onFailure) {
                musicCommService.postWithParams('scale', {
                    RequestType: 'Harmonize',
                    Scale: scale,
                    ScaleName: scaleName,
                    HarmonizationOptions: harmonizationOptions,
                    ParserOptions: virtualCowriterService.getParserOptions()
                }, function(data) {
                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            setHarmonizedChords: function(scale, scaleName) {
                var onFailure = function() { };
                this.harmonize(scale, scaleName, {
                    HarmonizeAtAllChromaticIndexes: false,
                    ChordDistances: 3,
                    ChordSize: 3
                }, function(data) {
                    // Success
                    scale.HarmonizedChords.ThreeNoteChords = data.HarmonizedChords;
                }, onFailure);
                this.harmonize(scale, scaleName, {
                    HarmonizeAtAllChromaticIndexes: true,
                    ChordDistances: 3,
                    ChordSize: 3
                }, function(data) {
                    // Success
                    scale.HarmonizedChords.ThreeNoteBorrowedChords = data.HarmonizedChords;
                }, onFailure);
                this.harmonize(scale, scaleName, {
                    HarmonizeAtAllChromaticIndexes: false,
                    ChordDistances: 3,
                    ChordSize: 4
                }, function(data) {
                    // Success
                    scale.HarmonizedChords.FourNoteChords = data.HarmonizedChords;
                }, onFailure);
                this.harmonize(scale, scaleName, {
                    HarmonizeAtAllChromaticIndexes: true,
                    ChordDistances: 3,
                    ChordSize: 4
                }, function(data) {
                    // Success
                    scale.HarmonizedChords.FourNoteBorrowedChords = data.HarmonizedChords;
                }, onFailure);
            },
            /* Fills the given scale with notation, inversions, modes, harmonized chords, etc. */
            fillScaleData: function(scale) {
                if(!scale.HarmonizedChords) {
                    scale.HarmonizedChords = {
                        ThreeNoteChords: null,
                        ThreeNoteBorrowedChords: null,
                        FourNoteChords: null,
                        FourNoteBorrowedChords: null
                    };
                }

                // Start getting the notation
                this.getNotation(scale, function(data) {
                    // Success
                    scale.Staff = data.Staff;
                }, function(data) {
                    // Failure
                    var k = 3;
                });

                this.setModesAndInversionsFromService(scale, function(data) {
                    // Success
                }, function(data) {
                    // Failure
                    var k = 3;
                });


                this.setScaleChartFromService(scale, {
                    PreferredMaxFretsPerString: null
                }, function(data) {
                    // Scale Chart Success
                }, function(data) {
                    // Scale Chart Failure
                });

                this.setHarmonizedChords(scale);
            },
            fillChordProgressionData: function(chordProgression) {
                this.setScaleOfBestFitForChordProgression(chordProgression);
            }
        };
    }]);