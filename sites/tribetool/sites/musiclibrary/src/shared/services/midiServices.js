angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryMidiService', ['$rootScope', '$http', '$timeout', 'dmusiclibraryInstrumentService',  function($rootScope, $http, $timeout, instrumentService) {
        return {
            instrumentsLoaded: [],
            instrumentMap: {
                "Banjo": "banjo",
                "Guitar": "acoustic_guitar_nylon", // alternative: "acoustic_guitar_steel"
                "Bass": "acoustic_bass" // alternative: "electric_bass_finger"
            },
            initialize: function() {
                var my = this;
                $rootScope.$on('instrumentChanged', function(event, data) {
                    $timeout(function() {
                        my.loadMidiInstrument(instrumentService.instrument.GuitarType);
                    }, 0);
                });
            },
            getMidiInstrument: function(guitarType) {
                var instrument = this.instrumentMap[guitarType];
                if(!instrument)
                    instrument = "acoustic_grand_piano";
                return instrument;
            },
            loadMidiInstrument: function(guitarType, onLoaded) {
                var instrument = this.getMidiInstrument(guitarType);

                var alreadyLoaded = false;
                for(var i = 0; i < this.instrumentsLoaded.length; i++) {
                    if(this.instrumentsLoaded[i] === instrument) {
                        alreadyLoaded = true;
                        if(onLoaded)
                            onLoaded();
                        break;
                    }
                }

                var my = this;
                if(!alreadyLoaded) {
                    my.instrumentsLoaded.push(instrument);
                    MIDI.loadPlugin({
                        soundfontUrl: "sites/musiclibrary/sound-fonts/",
                        instrument: instrument,
                        callback: function() {
                            if(onLoaded)
                                onLoaded();
                        }
                    });
                }
            },
            getBeatDuration: function(tempo) {
                var beatsPerMillisecond = tempo / 60000;
                return 1 / beatsPerMillisecond;
            },
            getUnitDuration: function(tempo, timeSignature) {
                var beatDuration = this.getBeatDuration(tempo);
                return beatDuration / (512/timeSignature.Denominator);
            },
            /*
             options: {
             tempo:
             timeSignature: {
             Numerator: int,
             Denominator: int
             },
             duration: int (in milliseconds. If provided, this will be used instead of calculating from tempo and time signature).
             }
             */
            getMidiSoundFromChordProgression: function(progression, options) {
                var unitDuration = options.duration ? null : this.getUnitDuration(options.tempo, options.timeSignature);

                var midiSound = {
                    StandardChromaticOctavesBelowA0: progression[0].ChordSound.StandardChromaticOctavesBelowA0,
                    GuitarType: progression[0].ChordSound.GuitarType,
                    TotalDuration: 0,
                    Chords: []
                };
                for(var i = 0; i < progression.length; i++) {
                    var chord = progression[i];
                    var chordSound = chord.ChordSound;
                    var durationPerChord = options.duration ? options.duration : chord.units * unitDuration;
                    for(var j = 0; j < chordSound.Chords.length; j++) {
                        var midiChord = chordSound.Chords[j];

                        for(var k = 0; k < midiChord.Notes.length; k++) {
                            var note = midiChord.Notes[k];
                            note.Duration = durationPerChord;
                        }
                        midiChord.LongestDuration = durationPerChord;

                        midiSound.Chords.push(midiChord);
                    }
                    midiSound.TotalDuration += durationPerChord * chordSound.Chords.length;
                }

                return midiSound;
            },
            stop: function() {
                MIDI.stopAllNotes();
                MIDI.Player.stop();
            },
            playChord: function(chord) {
                this.playSound(chord.ChordSound);
            },
            /* options: {
             playing: // If changed to false, playing will stop
             } */
            playSound: function(midiSound, options, onComplete) {
                // We can find the "prefix" and the "offset" by stepping into MIDI.noteOn
                // and looking at the values in the audioBuffers array. The audioBuffers array for
                // the piano, for instance, starts on "027" (hence the 0 prefix and 27 offset)
                if(!options) {
                    options = { };
                }
                options.playing = true;

                var prefix = "0"; // "0" prefix for the piano
                var keyOffset = MIDI.pianoKeyOffset;


                //var instrument = this.getMidiInstrument(midiSound.GuitarType);
                var guitarType = instrumentService.instrument.GuitarType;
                var instrument = this.getMidiInstrument(guitarType);

                var indexOffset = 0; // note index offset


                if(guitarType === 'Banjo') {
                    prefix = "";
                    keyOffset = 10521;
                    //indexOffset = -24;
                    indexOffset = 3 - 12; // Up 3, down 12
                }
                else if(guitarType === 'Guitar') {
                    if(instrument === "acoustic_guitar_steel") {
                        // Acoustic steel guitar
                        prefix = "";
                        keyOffset = 2521;
                        //indexOffset = -12;
                        indexOffset = 3 - 12; // Up 3, down 12
                    }
                    else if(instrument === "acoustic_guitar_nylon") {
                        // Nylon guitar
                        prefix = "";
                        keyOffset = 2421;
                        //indexOffset = -12;
                        indexOffset = 3 - 12; // Up 3, down 12
                    }

                }
                else if(guitarType === 'Bass') {
                    if(instrument === "acoustic_bass") {
                        prefix = "";
                        keyOffset = 3221;
                        indexOffset = 3 - 12; // Up 3, down 12
                    }
                    else if(instrument === "electric_bass_finger") {
                        prefix = "";
                        keyOffset = 3321;
                        indexOffset = 3 - 12; // Up 3, down 12
                    }

                }
                else {
                    indexOffset = 3 - 12; // Up 3, down 12
                }


                var play = function() {
                    var calledComplete = false;

                    $timeout(function() {
                        if(!calledComplete && onComplete)
                            onComplete();
                    }, midiSound.TotalDuration);


                    MIDI.setVolume(0, 127);

                    var processChord = function(chord) {
                        for(var i = 0; i < chord.Notes.length ; i++) {
                            var note = chord.Notes[i];
                            var noteIndex = note.ChromaticIndex + keyOffset + indexOffset - (midiSound.StandardChromaticOctavesBelowA0 * 12);
                            var noteName = prefix + "" + noteIndex;
                            MIDI.noteOn(0, noteName, note.Velocity, 0);
                            MIDI.noteOff(0, noteName, note.Duration);
                        }
                    };

                    var chordIndex = 0;

                    var iterateChord = function() {
                        if(!options.playing)
                        {
                            if(onComplete)
                                onComplete();
                            return;
                        }

                        if(chordIndex < midiSound.Chords.length)
                        {
                            var midiChord = midiSound.Chords[chordIndex];
                            processChord(midiChord);
                            chordIndex++;
                            $timeout(function() {
                                iterateChord();
                            }, midiChord.LongestDuration);
                        }
                    };
                    iterateChord();

                };

                this.loadMidiInstrument(midiSound.GuitarType, function() {
                    // On Loaded
                    play();
                });


            }
        };
    }]);
