angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryVirtualCowriterService', ['$rootScope', 'OPTIONS', 'commService', 'dmusiclibraryInstrumentService', 'accountService', 'dmusiclibraryCommService', function($rootScope, OPTIONS, commService, instrumentService, accountService, musicCommService) {
        return {
            /* The last command that was executed */
            lastCommand: null,
            /* A list of the commandElements currently being viewed. Note that command elements
             may contain music elements but are not themselves music elements.
             See virtualCowriterService.musicElements.
             */
            commandElements: [],
            /* An array of the music elements currently being viewed. Music elements are
             chords, scales, chord formulas, scale formulas, chord symbols, etc.
             */
            musicElements: [],
            /* Indicates whether multiple Music Elements are being viewed */
            isViewingMultipleMusicElements: function() {
                return this.musicElements && this.musicElements.length > 1;
            },
            getParserOptions: function() {
                return {
                    InstrumentParameter: instrumentService.instrument,
                    ParserTabOptions: instrumentService.tabOptions
                };
            },
            parse: function(command, onSuccess, onFailure) {
                var my = this;
                musicCommService.postWithParams('parser', {
                    RequestType: 'Parse',
                    Command: command,
                    IsDebug: OPTIONS.isDebug,
                    ParserOptions: my.getParserOptions()
                }, function(data) {
                    if(onSuccess) {
                        // data.ParsedCommand;
                        onSuccess(data);
                    }
                }, onFailure);
            },
            getNoteNameString: function(noteNames, includeOctaveNumber) {
                var text = '';
                for(var i = 0; i < noteNames.length; i++) {
                    var noteName = noteNames[i];
                    text += noteName.Name + (includeOctaveNumber ? noteName.OctaveNumber : '') + (i + 1 >= noteNames.length ? '' : ', ');
                }
                return text;
            },
            getNoteNumberNameString: function(noteNumberNames) {
                var text = '';
                for(var i = 0; i < noteNumberNames.length; i++) {
                    var noteNumberName = noteNumberNames[i];
                    text += noteNumberName.Name + (i + 1 >= noteNumberNames.length ? '' : ', ');
                }
                return text;
            },
            getScaleName: function(scale, useNoteNamesIfUnknown) {
                if(useNoteNamesIfUnknown && scale.IsNameUnknown) {
                    return this.getNoteNameString(scale.NoteNamesWithinOctave);
                }
                else {
                    var scaleName = scale.Name;
                    if(scale.IsNameUnknown) {
                        scaleName = 'Unknown Scale';
                    }
                    return scaleName;
                }
            },
            showChordOnFretboard: function(tabChord, scrollToFretboard) {
                var setFretboardNotesData = {
                    tabChord: tabChord,
                    scrollToFirstNote: true,
                    scrollToFretboard: scrollToFretboard
                };
                $rootScope.$broadcast('setFretboardNotes', setFretboardNotesData);
                $rootScope.$emit('setFretboardNotes', setFretboardNotesData);
            }
        };
    }]);