angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryChordProgressionGeneratorService', ['$rootScope', '$http', 'commService', 'dmusiclibraryScaleService', 'dmusiclibraryInstrumentService', 'dmusiclibraryMidiService', 'dmusiclibraryCommService', function($rootScope, $http, commService, scaleService, instrumentService, midiService, musicCommService) {
        return {
            chordColors: ['green', 'orange', 'yellow', 'MediumOrchid ', 'lightblue',
                'tan', 'brown', 'pink', 'LightSeaGreen', 'LawnGreen', 'MediumSlateBlue',
                'PaleGoldenRod', 'PowderBlue'],
            assignChordColors: function(chords) {
                for(var i = 0; i < chords.length; i++) {
                    chords[i].color = this.chordColors[i];
                }
            },
            /* destinationsInKey should be a ServiceChordDirectionalityInKey
             * getCategoryFromChordCharacteristics: Func<ChordCharacterstics, ChordCharacteristicCategory>
             * desiredValueIndex: the value of this.ValueIndex that the ChordCharacteristicCategory must have */
            filterByChordCharacteristicCategoryValue: function(destinationsInKey, getCategoryFromChordCharacteristics,
                                                               desiredClusterIndex) {
                var newDestinationsInKey = {
                    Key: destinationsInKey.Key,
                    Chords: [],
                    ChordCharacteristicsExtrema: destinationsInKey.ChordCharacteristicsExtrema
                };

                for(var i = 0; i < destinationsInKey.Chords.length; i++) {
                    var directionalityChord = destinationsInKey.Chords[i];
                    var chordCharacteristicCategory = getCategoryFromChordCharacteristics(directionalityChord.ChordCharacteristics);
                    if(chordCharacteristicCategory.ClusterIndex === desiredClusterIndex) {
                        newDestinationsInKey.Chords.push(directionalityChord);
                    }
                }

                return newDestinationsInKey;
            },
            getChordChoices: function(scale, onThreeNoteChordsReady, onFourNoteChordsReady, onFailure) {
                var threeNoteChordChoices = [];
                var fourNoteChordChoices = [];
                var my = this;

                var loadChords = function() {
                    var getChords = function(harmonizedChords) {
                        var finalChords = [];
                        for(var i = 0; i < harmonizedChords.Chords.length; i++) {
                            var chords = harmonizedChords.Chords[i];
                            if(chords.length > 0) {
                                var chord = chords[0];
                                chord.name = chord.TitleChordName.FullName;
                                finalChords.push(chord);
                            }
                        }
                        my.assignChordColors(finalChords);
                        return finalChords;
                    };
                    scaleService.harmonize(scale, null, {
                        HarmonizeAtAllChromaticIndexes: true,
                        ChordDistances: 3,
                        ChordSize: 3
                    }, function(data) {
                        // Success
                        threeNoteChordChoices = getChords(data.HarmonizedChords);
                        onThreeNoteChordsReady(threeNoteChordChoices);
                    }, onFailure);
                    scaleService.harmonize(scale, null, {
                        HarmonizeAtAllChromaticIndexes: true,
                        ChordDistances: 3,
                        ChordSize: 4
                    }, function(data) {
                        // Success
                        fourNoteChordChoices = getChords(data.HarmonizedChords);
                        onFourNoteChordsReady(fourNoteChordChoices);
                    }, onFailure);
                };

                if(instrumentService.initialized) {
                    loadChords();
                }
                else {
                    $rootScope.$on('instrumentServiceInitialized', function(event, data) {
                        loadChords();
                    });
                }
            }
        };
    }]);