angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryFretboardJsService', ['$rootScope', 'dmusiclibraryInstrumentService', '$q', function($rootScope, instrumentService, $q) {
        var mapFromFretboardJsNoteToBazzleNote = {
            "Ab/G#" : "Ab",
            "A#/Bb" : "Bb",
            "C#/Db" : "C#",
            "D#/Eb" : "Eb",
            "F#/Gb" : "F#"
        };

        var noteLetterValueMap = {
            "C": 0,
            "Db": 1,
            "C#": 1,
            "Db/C#": 1,
            "C#/Db": 1,
            "D": 2,
            "Eb": 3,
            "D#": 3,
            "Eb/D#": 3,
            "D#/Eb": 3,
            "E": 4,
            "F": 5,
            "Gb": 6,
            "F#": 6,
            "Gb/F#": 6,
            "F#/Gb": 6,
            "G": 7,
            "Ab": 8,
            "G#": 8,
            "Ab/G#": 8,
            "G#/Ab": 8,
            "A": 9,
            "A#": 10,
            "Bb": 10,
            "A#/Bb": 10,
            "Bb/A#": 10,
            "B": 11
        };

        function calculateUniqueNoteValue(note) {
            if ( angular.isNumber(note.noteOctave) && angular.isNumber(noteLetterValueMap[note.noteLetter]) ) {
                return (12 * note.noteOctave) + noteLetterValueMap[note.noteLetter];
            } else {
                return -1;
            }
        }

        // Will place B3 before C4, for example
        function noteSortLowToHigh(a, b) {
            return calculateUniqueNoteValue(a) - calculateUniqueNoteValue(b);
        }

        function getDefaultFretboardConfig(isChordMode) {
            return getFretboardJsTuning().then(function(fretboardJsTuning) {
                return {
                    clickedNotes: [],
                    fretboardOrigin: [35, 20],
                    numFrets: 16,
                    fretWidth: 63,
                    fretHeight: 35,
                    isChordMode: isChordMode,
                    noteClickingDisabled: false,
                    tuningClickingDisabled: true,
                    guitarStringNotes: fretboardJsTuning,
                    clickedNoteCircColor: "#3276b1",
                    clickedNoteTextColor: "white",
                    hoverNoteCircColor: "white",
                    hoverNoteTextColor: "black",
                    fretboardColor: "wheat",
                    stringColor: "black",
                    tuningTriangleColor: "lightgray",
                    fretsToDrawOneCircleOn: [3, 5, 7, 9, 12],
                    opacityAnimateSpeed: 200,
                    showTuningTriangles: false,
                    showTuningSquares: true,
                    tuningSquaresColor: "#3276b1",
                    tuningSquaresTextColor: "white",
                    nutColor: "black"
                };
            });
        }

        // Converts the tuning from the instrument service to something that
        // can be used by fretboard-js
        function getFretboardJsTuning() {
            var deferred = $q.defer();

            if (instrumentService.initialized) {
                deferred.resolve(convertToFretboardJsTuning());
            }
            else {
                $rootScope.$on('instrumentServiceInitialized', function(event, data) {
                    deferred.resolve(convertToFretboardJsTuning());
                });
            }

            return deferred.promise;
        }

        function convertToFretboardJsTuning() {
            var instrumentServiceTuning = instrumentService.instrument && instrumentService.instrument.Tuning && instrumentService.instrument.Tuning.Notes;

            var fretboardJsTuning = [];

            if (instrumentServiceTuning) {
                instrumentServiceTuning.forEach(function(note) {
                    if (!note || !note.Name || !note.OctaveNumber) {
                        return;
                    }

                    fretboardJsTuning.push({
                        noteLetter : note.Name,
                        noteOctave : note.OctaveNumber
                    });
                });
            }

            return fretboardJsTuning.reverse();
        }

        return {
            getDefaultFretboardConfig : getDefaultFretboardConfig,
            getTuning: getFretboardJsTuning,
            mapFromFretboardJsNoteToBazzleNote : mapFromFretboardJsNoteToBazzleNote,
            noteSortLowToHigh : noteSortLowToHigh,
            getTabStringFromFretboard: function(isChordMode, fretboardConfig) {
                var constructCommandFunc = null;
                if (isChordMode) {
                    constructCommandFunc = function() {
                        var i, clickedNotes, guitarStringNotes, mapFromGuitarStringToClickedFret = {}, tabString = "";

                        if (fretboardConfig && fretboardConfig.clickedNotes && fretboardConfig.guitarStringNotes) {
                            clickedNotes = angular.copy(fretboardConfig.clickedNotes);
                            guitarStringNotes = angular.copy(fretboardConfig.guitarStringNotes);

                            clickedNotes.reverse();
                            guitarStringNotes.reverse();

                            // For each guitar string, figure out if there is a note on that string.
                            // If there isn't, there will be an 'X' in the tab.
                            guitarStringNotes.forEach(function(note) {
                                if (!note || !note.noteLetter || !angular.isNumber(note.noteOctave)) {
                                    return;
                                }

                                mapFromGuitarStringToClickedFret[note.noteLetter + note.noteOctave] = 'x';
                            });

                            clickedNotes.forEach(function(note) {
                                if (!note || !angular.isNumber(note.fretNumber) || !note.stringItsOn ||
                                    !note.stringItsOn.noteLetter || !angular.isNumber(note.stringItsOn.noteOctave)) {
                                    return;
                                }

                                mapFromGuitarStringToClickedFret[note.stringItsOn.noteLetter + note.stringItsOn.noteOctave] = note.fretNumber;
                            });

                            angular.forEach(mapFromGuitarStringToClickedFret, function(clickedFret, guitarString) {
                                tabString += (clickedFret + "-"); // Will be 'x-' if no fret was clicked
                            });

                            // Remove the last hyphen
                            if (tabString[tabString.length-1] === "-") {
                                tabString = tabString.substring(0, tabString.length - 1);
                            }

                        }

                        return tabString;
                    };
                } else {
                    constructCommandFunc = function() {
                        var clickedNotes, clickedNotesSet = {}, tabString = "";

                        if (fretboardConfig && fretboardConfig.clickedNotes) {
                            clickedNotes = angular.copy(fretboardConfig.clickedNotes);

                            // Sort from low to high so the lowest note determines the scale
                            clickedNotes.sort(noteSortLowToHigh);

                            clickedNotes.forEach(function(note) {
                                if (!note || !note.noteLetter || !angular.isNumber(note.noteOctave)) {
                                    return;
                                }

                                var noteFormat = (mapFromFretboardJsNoteToBazzleNote[note.noteLetter] || note.noteLetter) + note.noteOctave;

                                clickedNotesSet[noteFormat] = true; // Just set the value to true, it just needs to act as a hash set
                            });

                            angular.forEach(clickedNotesSet, function(value, note) {
                                tabString += (note + ",");
                            });

                            // Remove the last comma
                            if (tabString[tabString.length-1] === ",") {
                                tabString = tabString.substring(0, tabString.length - 1);
                            }

                        }

                        return tabString;
                    };
                }

                return constructCommandFunc();
            },
            addScaleToFretboard: function(fretboardConfig, scaleChartResult) {
                var tabScale = scaleChartResult.TabScale;

                for(var i = 0; i < tabScale.Notes.length; i++) {
                    var stringAndFretIndex = tabScale.Notes[i];
                    this.addNoteToFretboard(fretboardConfig, stringAndFretIndex.StringIndex, stringAndFretIndex.FretIndex, stringAndFretIndex.Note);
                }
            },
            addChordToFretboard: function(fretboardConfig, tabChord) {
                var noteNames = tabChord.Chord.NoteNames;
                var noteIndex = 0;
                for(var i = 0; i < tabChord.FretsPerString.length; i++) {
                    var fretIndex = tabChord.FretsPerString[i];
                    if(fretIndex === null)
                        continue;
                    if(!this.addNoteToFretboard(fretboardConfig, i, fretIndex, noteNames[noteIndex]))
                        break;
                    noteIndex++;
                }
            },
            /* Adds the specified note to the given fretboardConfig. Returns false upon failure. */
            addNoteToFretboard: function(fretboardConfig, guitarStringIndex, fretNumber, note) {
                if(!fretboardConfig.clickedNotes) {
                    fretboardConfig.clickedNotes = [];
                }

                if(guitarStringIndex >= instrumentService.instrument.Tuning.Notes.length) {
                    return false;
                }

                var stringNote = instrumentService.instrument.Tuning.Notes[guitarStringIndex];

                fretboardConfig.clickedNotes.push({
                    fretNumber: fretNumber,
                    noteLetter: note.Name,
                    noteOctave: note.OctaveNumber,
                    stringItsOn: {
                        noteLetter: stringNote.Name,
                        noteOctave: stringNote.OctaveNumber
                    }
                });

                return true;
            }
            // noteLetterSortLowToHigh : noteLetterSortLowToHigh
        };
    }]);