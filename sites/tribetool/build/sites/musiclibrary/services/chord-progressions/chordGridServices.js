angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryChordGridService', ['$rootScope', 'dmusiclibraryMidiService', function($rootScope, midiService) {
        return {
            // Tracks the DOM elements of the chords in the progression that will be created.
            progChordElements: {},
            // The current chord progression in the chord grid
            progression: [],
            // push an object that stores the chord data and the chord DOM element
            registerMe: function($chord, chord) {
                var id = chord.$$hashKey;

                this.progChordElements[id] = $chord;
            },
            // chords pass themselves to this method for deletion
            deleteMe: function(chord) {
                var i,
                    prog = this.progression,
                    progId;

                for (i = 0; i < prog.length; i++) {
                    progId = prog[i].$$hashKey;

                    if (progId === chord.$$hashKey) {
                        prog = prog.splice(i, 1);
                        delete this.progChordElements[progId];
                    }
                }
            },
            getGridHelper: function(scope) {
                // This is a set of helper functions that will be used by chords
                // and chord-handles
                var my = this;
                var gridHelper = {
                    getQuarterNotesByWidth: function(width) {
                        return width / this.getWidthPerQuarterNote();
                    },

                    getUnitsPerQuarterNote: function() {
                        return scope.chordGridOptions.unitsPerQuarterNote;
                    },

                    // Returns a full measure if units is undefined
                    getChordNumberOfQuarterNotes: function(units) {
                        return units ? (units / this.unitsPerQuarterNote) : this.quarterNotesPerMeasure;
                    },

                    getUnitsByWidth: function(width) {
                        return this.getQuarterNotesByWidth(width) * scope.chordGridOptions.unitsPerQuarterNote;
                    },

                    setGridDivisions: function() {
                        var $division,
                            extraCssClass,
                            i,
                            divisionsPerMeasure = scope.chordGridOptions.timeSignature.Numerator,
                            iTracker = 1,
                            chordNumOfQuarterNotes,
                            $chord,
                            height,
                            width,
                            unitsPerQuarterNote = this.unitsPerQuarterNote;

                        angular.forEach(my.progression, function(chord, index) {
                            $chord = my.progChordElements[chord.$$hashKey];

                            // To get the number of divisions for this chord:
                            // # quarter notes / 4   =  x / timing denom
                            // solve for x - that's the number of timing-numerator notes, i.e. number of divisions
                            chordNumOfQuarterNotes = chord.units / unitsPerQuarterNote;
                            numDivisions = (scope.chordGridOptions.timeSignature.Denominator * chordNumOfQuarterNotes) / 4;

                            height = $chord.height();
                            width = $chord.width();
                            //numDivisions = width / gridUnit;

                            $chord.find(".grid-division").remove();

                            // i tracks the division relative the current chord,
                            // iTracker is relative to the whole grid
                            for (i = 1; i <= numDivisions; i++) {
                                if (iTracker % divisionsPerMeasure === 0) {
                                    extraCssClass = "chord-boundary";
                                } else {
                                    extraCssClass = "chord-middle";
                                }

                                iTracker++;

                                $division = $("<div class='grid-division'></div>").addClass(extraCssClass);

                                $division.height(height).offset({
                                    left: (i / numDivisions) * width,
                                    top: 0
                                });

                                $chord.append($division);
                            }
                        });
                    },

                    getWidthPerQuarterNote: function() {
                        return $chordWidthTestEl.width();
                    },

                    // force grid variables to reflect responsiveness
                    computeGridVars: function() {
                        this.unitsPerQuarterNote = this.getUnitsPerQuarterNote();
                        this.widthPerQuarterNote = this.getWidthPerQuarterNote();
                        this.quarterNotesPerMeasure = (4 * scope.chordGridOptions.timeSignature.Numerator) / scope.chordGridOptions.timeSignature.Denominator;
                        this.measureWidth = this.quarterNotesPerMeasure * this.widthPerQuarterNote;
                        this.gridUnit = this.measureWidth / scope.chordGridOptions.timeSignature.Numerator;
                        this.snapThreshold = scope.chordGridOptions.snapThreshold;
                    },

                    executeClickCallback: function(chordInProgression) {
                        if (!angular.isFunction(scope.chordGridOptions.clickCallback)) {
                            console.log("The callback is not a function: ");
                            console.log(scope.chordGridOptions.callback);
                            return;
                        }

                        scope.chordGridOptions.clickCallback(chordInProgression);
                    }
                };

                return gridHelper;
            },
            getSortableOptions: function(scope, getGridChordsFromScope, onChordStartMove, onChordClick) {
                var chords = [];
                var sortableOptions = {
                    connectWith: ".chord-grid-container",
                    start: function(e, ui) {
                        // Ensure that our placeholders have height and width
                        var placeholders = $('.ui-sortable-placeholder');
                        placeholders.width(ui.item.width());
                        placeholders.height(ui.item.height());

                        // Don't just copy the chords or you'll get the hashes copied over
                        // and the repeater will throw errors about duplicates
                        chords = $.extend(true, [], scope.chordChoices);
                        angular.forEach(chords, function(chord, index) {
                            delete chord.$$hashKey;
                        });

                        var chord = getGridChordsFromScope(scope)[ui.item.sortable.index];
                        midiService.playSound(chord.ChordSound, { }, function() {
                            // sound complete
                        });
                        if(onChordStartMove) {
                            onChordStartMove(chord, ui.item, e);
                        }

                        // Ensure that when we move a chord from the chord choices that the size of
                        // the chord choices grid stays the same (so that things don't jump around while
                        // we're moving the chord).
                        var chordGridChords = $('.chord-grid-chords');
                        chordGridChords.css('width', chordGridChords.width());
                        chordGridChords.css('height', chordGridChords.height());
                    },
                    stop: function(e, ui) {
                        // Restore natural order to the width/height of the chord choices grid
                        var chordGridChords = $('.chord-grid-chords');
                        chordGridChords.css('width', '');
                        chordGridChords.css('height', '');

                        var $dropped = e && e.target && $(e.target),
                            $dropTarget = ui && ui.item && ui.item.sortable && ui.item.sortable.droptarget;
                        // If the element is removed from the first container (chords)
                        // and placed into the second container (progression) clone the original chords
                        // to restore the removed item.
                        if ($dropped && $dropped.hasClass('chord-grid-chords') && $dropTarget && $dropTarget.hasClass('progression')) {
                            scope.chordChoices = $.extend(true, [], chords);
                        }

                        if(onChordClick) {
                            var lineDistance = function( point1, point2 )
                            {
                                var xs = 0;
                                var ys = 0;

                                xs = point2.left - point1.left;
                                xs = xs * xs;

                                ys = point2.top - point1.top;
                                ys = ys * ys;

                                return Math.sqrt( xs + ys );
                            };

                            var chord = getGridChordsFromScope(scope)[ui.item.sortable.index];

                            // How far did the element move? If not far, consider it a click
                            if(lineDistance(ui.position, ui.originalPosition) <= 10) {
                                onChordClick(chord, ui.item, e);
                            }

                        }
                    },
                    update: function(e, ui) {
                        var sortable = ui && ui.item && ui.item.sortable,
                            $dropTarget = sortable && sortable.droptarget;
                        // If element is being moved into the first container (chords) cancel
                        if ($dropTarget && $dropTarget.hasClass('chord-grid-chords')) {
                            sortable.cancel();
                        }
                    },
                    activate: function(e, ui) {

                    },
                    "ui-floating": true,
                    revert: true, // animation
                    tolerance: "pointer",
                    helper: "clone", // fixes bug where it's hard to drag into last position
                    distance: 0
                };
                return sortableOptions;
            }
        };
    }]);