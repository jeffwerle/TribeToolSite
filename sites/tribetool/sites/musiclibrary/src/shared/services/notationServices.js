angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryNotationService', ['$rootScope', '$http', 'commService', 'uiService', function($rootScope, $http, commService, uiService) {
        return {
            getVexPosition: function(position) {
                return position === 'Below' ? Vex.Flow.Modifier.Position.BELOW : Vex.Flow.Modifier.Position.ABOVE;
            },
            getBarHeight: function() {
                return 100;
            },
            getStaffWidthFromRenderer: function(renderer) {
                var $svgCanvas = $(renderer.ctx.paper.canvas);
                var staffLine = $svgCanvas.find('rect').first();
                var chartWidth = parseFloat(staffLine.attr('width'));
                return chartWidth;
            },
            getStaffHeight: function(staff) {
                var measures = staff.Measures;

                var barsPerLine = 2;
                var barHeight = this.getBarHeight();

                var lineCount = Math.ceil(measures.length/barsPerLine);
                // +(barHeight/2) to leave some note space
                var canvasHeight = barHeight*lineCount + 20;//(barHeight/2);

                return canvasHeight;
            },
            formatAndDrawTickables: function(context, barProperties, tickables) {
                if(!tickables || tickables.length <= 0)
                    return;

                var measure = barProperties.measure;
                var bar = barProperties.bar;
                var timeSignature = measure.TimeSignature ? {
                    num_beats: measure.TimeSignature.BeatsInMeasure,
                    beat_value: measure.TimeSignature.BeatValue
                } : { num_beats: 4, beat_value: 4};
                // Start by creating a voice and adding all the notes to it.
                var voice = new Vex.Flow.Voice(timeSignature).setMode(Vex.Flow.Voice.Mode.SOFT);
                voice.addTickables(tickables);

                // Instantiate a `Formatter` and format the notes.
                new Vex.Flow.Formatter().
                    joinVoices([voice], {align_rests: true}).
                    formatToStave([voice], bar, {align_rests: true});

                // Render the voice to the stave.
                voice.setStave(bar);
                voice.draw(context, bar);
            },
            getNoteSelections: function(staff, modifications, barProperties) {
                // Handle the selections
                var noteSelections = [];
                if(modifications.NoteSelections) {
                    for(var i = 0; i < modifications.NoteSelections.length; i++) {
                        var noteSelection = modifications.NoteSelections[i];
                        var firstNoteLocation = noteSelection.NoteLocations[0];
                        var lastNoteLocation = noteSelection.NoteLocations[noteSelection.NoteLocations.length - 1];
                        var firstNote = barProperties[firstNoteLocation.MeasureIndex].notes[firstNoteLocation.ElementIndex];
                        var lastNote = barProperties[lastNoteLocation.MeasureIndex].notes[lastNoteLocation.ElementIndex];
                        if(firstNoteLocation.MeasureIndex !== lastNoteLocation.MeasureIndex) {
                            noteSelections.push(new Vex.Flow.NoteSelection({
                                first_note: firstNote,
                                notes: [firstNote],
                                color: noteSelection.TextColor,
                                'stroke-width': 2,
                                isDotted: noteSelection.IsDotted
                            }, noteSelection.Text));

                            for(var j = firstNoteLocation.MeasureIndex + 1; j < (lastNoteLocation.MeasureIndex); j++) {
                                var middleMeasureFirstNote = barProperties[j].notes[0];
                                var middleMeasureLastNote = barProperties[j].notes[barProperties[j].notes.length - 1];
                                noteSelections.push(new Vex.Flow.NoteSelection({
                                    first_note: middleMeasureFirstNote,
                                    last_note: middleMeasureLastNote,
                                    notes: [middleMeasureFirstNote, middleMeasureLastNote],
                                    color: noteSelection.TextColor,
                                    'stroke-width': 2,
                                    isDotted: noteSelection.IsDotted,
                                    passthroughMeasure: true
                                }, null));
                            }

                            noteSelections.push(new Vex.Flow.NoteSelection({
                                last_note: lastNote,
                                notes: [lastNote],
                                color: noteSelection.TextColor,
                                'stroke-width': 2,
                                isDotted: noteSelection.IsDotted
                            }, null));
                        }
                        else {
                            noteSelections.push(new Vex.Flow.NoteSelection({
                                first_note: firstNote,
                                last_note: lastNote,
                                notes: [firstNote, lastNote],
                                color: noteSelection.TextColor,
                                'stroke-width': 2,
                                isDotted: noteSelection.IsDotted
                            }, noteSelection.Text));
                        }
                    }
                }

                return noteSelections;
            },
            getNoteSections: function(staff, modifications, barProperties) {
                // Handle the sections
                var noteSections = [];
                if(modifications.NoteSections) {
                    for(var i = 0; i < modifications.NoteSections.length; i++) {
                        var noteSection = modifications.NoteSections[i];
                        var firstNoteLocation = noteSection.NoteLocations[0];
                        var lastNoteLocation = noteSection.NoteLocations[noteSection.NoteLocations.length - 1];
                        var firstNote = barProperties[firstNoteLocation.MeasureIndex].notes[firstNoteLocation.ElementIndex];
                        var lastNote = barProperties[lastNoteLocation.MeasureIndex].notes[lastNoteLocation.ElementIndex];
                        if(firstNoteLocation.MeasureIndex !== lastNoteLocation.MeasureIndex) {
                            noteSections.push(new Vex.Flow.NoteSection({
                                first_note: firstNote,
                                notes: [firstNote],
                                color: noteSection.TextColor,
                                'stroke-width': 2,
                                isDotted: noteSection.IsDotted,
                                displayAbove: noteSection.DrawAbove
                            }, noteSection.Text));

                            for(var j = firstNoteLocation.MeasureIndex + 1; j < (lastNoteLocation.MeasureIndex); j++) {
                                var middleMeasureFirstNote = barProperties[j].notes[0];
                                var middleMeasureLastNote = barProperties[j].notes[barProperties[j].notes.length - 1];
                                noteSections.push(new Vex.Flow.NoteSection({
                                    first_note: middleMeasureFirstNote,
                                    last_note: middleMeasureLastNote,
                                    notes: [middleMeasureFirstNote, middleMeasureLastNote],
                                    color: noteSection.TextColor,
                                    'stroke-width': 2,
                                    isDotted: noteSection.IsDotted,
                                    displayAbove: noteSection.DrawAbove,
                                    passthroughMeasure: true
                                }, null));
                            }

                            noteSections.push(new Vex.Flow.NoteSection({
                                last_note: lastNote,
                                notes: [lastNote],
                                color: noteSection.TextColor,
                                'stroke-width': 2,
                                isDotted: noteSection.IsDotted,
                                displayAbove: noteSection.DrawAbove
                            }, null));
                        }
                        else {
                            noteSections.push(new Vex.Flow.NoteSection({
                                first_note: firstNote,
                                last_note: lastNote,
                                notes: [firstNote, lastNote],
                                color: noteSection.TextColor,
                                'stroke-width': 2,
                                isDotted: noteSection.IsDotted,
                                displayAbove: noteSection.DrawAbove
                            }, noteSection.Text));
                        }
                    }
                }

                return noteSections;
            },
            getTies: function(staff, barProperties) {
                // Handle the ties
                var ties = [];
                for(var i = 0; i < staff.Ties.length; i++) {
                    var tie = staff.Ties[i];
                    var firstNoteLocation = tie.NoteLocations[0];
                    var lastNoteLocation = tie.NoteLocations[tie.NoteLocations.length - 1];
                    var firstNote = barProperties[firstNoteLocation.MeasureIndex].notes[firstNoteLocation.ElementIndex];
                    var lastNote = barProperties[lastNoteLocation.MeasureIndex].notes[lastNoteLocation.ElementIndex];
                    if(firstNoteLocation.MeasureIndex !== lastNoteLocation.MeasureIndex) {
                        ties.push(new Vex.Flow.StaveTie({
                            first_note: firstNote,
                            first_indices: [firstNoteLocation.StaffHeadIndex]
                        }));
                        ties.push(new Vex.Flow.StaveTie({
                            last_note: lastNote,
                            last_indices: [lastNoteLocation.StaffHeadIndex]
                        }));
                    }
                    else {
                        ties.push(new Vex.Flow.StaveTie({
                            first_note: firstNote,
                            last_note: lastNote,
                            first_indices: [firstNoteLocation.StaffHeadIndex],
                            last_indices: [lastNoteLocation.StaffHeadIndex]
                        }));
                    }
                }

                return ties;
            },
            getBeams: function(barProperties) {
                var beams = [];
                for(var i = 0; i < barProperties.length; i++) {
                    var properties = barProperties[i];
                    var measure = properties.measure;
                    var bar = properties.bar;

                    // Handle the beams
                    for(var j = 0; j < measure.Beams.length; j++) {
                        var beam = measure.Beams[j];
                        var notesInBeam = [];
                        for(var k = 0; k < beam.NoteLocations.length; k++) {
                            var noteLocation = beam.NoteLocations[k];
                            notesInBeam.push(barProperties[noteLocation.MeasureIndex].notes[noteLocation.ElementIndex]);
                        }
                        beams.push(new Vex.Flow.Beam(notesInBeam));
                    }
                }
                return beams;
            },
            getTuplets: function(barProperties) {
                var tuplets = [];
                for(var i = 0; i < barProperties.length; i++) {
                    var properties = barProperties[i];
                    var measure = properties.measure;

                    // Handle the tuplets
                    for(var j = 0; j < measure.Tuplets.length; j++) {
                        var tuplet = measure.Tuplets[j];
                        var notesInTuplet = [];
                        for(var k = 0; k < tuplet.NoteLocations.length; k++) {
                            var noteLocation = tuplet.NoteLocations[k];
                            notesInTuplet.push(barProperties[noteLocation.MeasureIndex].notes[noteLocation.ElementIndex]);
                        }
                        tuplets.push(new Vex.Flow.Tuplet(notesInTuplet));
                    }
                }
                return tuplets;
            },
            renderNoteText: function(ctx, modifications, barProperties) {
                for(var i = 0; i < barProperties.length; i++) {
                    var properties = barProperties[i];
                    var measure = properties.measure;

                    for(var j = 0; j < measure.Notes.length; j++) {
                        var barNote = properties.notes[j];

                        var noteTextCollection = this.getNoteTextCollection(modifications, i, j);

                        for(var p = 0; p < noteTextCollection.length; p++) {
                            var text = noteTextCollection[p];

                            barNote.addModifier(0, new Vex.Flow.NoteText({
                                text: text.Text,
                                textIndex: text.TextIndex,
                                color: text.Color,
                                position: this.getVexPosition(text.Position)
                            }));
                        }
                    }
                }
            },
            getMeasureTextCollection: function(modifications, measureIndex) {
                var textCollection = [];
                for(var i = 0; i < modifications.MeasureText.length; i++) {
                    var text = modifications.MeasureText[i];
                    if(text.Location.MeasureIndex === measureIndex) {
                        textCollection.push(text);
                    }
                }
                return textCollection;
            },
            getNoteTextCollection: function(modifications, measureIndex, noteIndex) {
                var textCollection = [];
                for(var i = 0; i < modifications.NoteText.length; i++) {
                    var text = modifications.NoteText[i];
                    if(text.Location.MeasureIndex === measureIndex &&
                        text.Location.ElementIndex === noteIndex) {
                        textCollection.push(text);
                    }
                }
                return textCollection;
            },
            getChordTextCollection: function(modifications, measureIndex, chordIndex) {
                var textCollection = [];
                for(var i = 0; i < modifications.ChordText.length; i++) {
                    var text = modifications.ChordText[i];
                    if(text.Location.MeasureIndex === measureIndex &&
                        text.Location.ElementIndex === chordIndex) {
                        textCollection.push(text);
                    }
                }
                return textCollection;
            },
            getNoteHighlights: function(modifications, measureIndex, noteIndex, noteHeadIndex) {
                var highlights = [];
                for(var i = 0; i < modifications.Highlights.length; i++) {
                    var highlight = modifications.Highlights[i];
                    if(highlight.Location.MeasureIndex === measureIndex &&
                        highlight.Location.ElementIndex === noteIndex &&
                        highlight.NoteHeadIndex === noteHeadIndex) {
                        highlights.push(highlight);
                    }
                }
                return highlights;
            },
            /* canvas should be jquery element */
            renderStaff: function(staff, modifications, canvas) {
                var measures = staff.Measures;

                var barsPerLine = 2;
                var barHeight = this.getBarHeight();

                var canvasHeight = this.getStaffHeight(staff);
                canvas.height(canvasHeight);

                var canvasElement = canvas[0];

                var renderer;
                if(canvasElement.tagName === 'canvas') {
                    renderer = new Vex.Flow.Renderer(canvasElement,
                        Vex.Flow.Renderer.Backends.CANVAS);
                }
                else {
                    // Use Raphael
                    renderer = new Vex.Flow.Renderer(canvasElement,
                        Vex.Flow.Renderer.Backends.RAPHAEL);
                }

                var canvasWidth = canvas.width();
                var ctx = renderer.getContext();
                ctx = uiService.createHiDefContext(canvasWidth, canvasHeight, null, canvasElement, ctx);

                // Set the bar width after the canvas' width has been set by createHiDefContext()
                var barWidth = (canvasWidth/barsPerLine);


                var startingBarPosition = 10;
                var barPosition = startingBarPosition;
                var line = 0;
                var barIndexInLine = 0;
                var barProperties = [];
                var measure, bar, properties;
                var j = 0, k = 0;
                for(var i = 0; i < measures.length; i++) {

                    if(barIndexInLine == barsPerLine) {
                        barIndexInLine = 0;
                        barPosition = startingBarPosition;
                        line++;
                    }
                    measure = measures[i];
                    var barY = line * barHeight;
                    bar = new Vex.Flow.Stave(barPosition, barY, barWidth);

                    properties = {
                        bar: bar,
                        measure: measure,
                        chords: [],
                        notes: [],
                        noteTextCollection: []
                    };

                    if(barIndexInLine === 0) {
                        if(measure.Clef === 'Bass') {
                            bar.addClef("bass");
                        }
                        else {
                            bar.addClef('treble');
                        }

                        if(measure.KeySignature && measure.KeySignature.Key) {
                            var keySignature = new Vex.Flow.KeySignature(measure.KeySignature.Key.Name + (measure.KeySignature.IsMajor ? "" : "m"));
                            keySignature.addToStave(bar);
                        }
                    }


                    if(i === 0 && measure.TimeSignature) {
                        bar.addTimeSignature(measure.TimeSignature.BeatsInMeasure + "/" + measure.TimeSignature.BeatValue);
                    }

                    bar.setContext(ctx).draw();

                    var m;
                    for(j = 0; j < measure.Chords.length; j++ ) {
                        var chord = measure.Chords[j];
                        var chordTextCollection = this.getChordTextCollection(modifications, i, j);
                        var finalChordText = '';
                        if(chordTextCollection.length > 0) {
                            for(m = 0; m < chordTextCollection.length; m++) {
                                var chordText = chordTextCollection[m];
                                finalChordText += chordText.Text;
                            }
                        }
                        else {
                            finalChordText = chord.IsRest || !modifications.DisplayMeasureChords ? '' : chord.Name;
                        }
                        var textChord = new Vex.Flow.TextNote({ text: finalChordText, superscript: null, subscript: null, duration: chord.NoteRhythm.DisplayNoteValueAsNumeric + (chord.NoteRhythm.IsDotted ? "d" : "")})
                            .setLine(2)
                            .setStave(bar)
                            .setJustification(Vex.Flow.TextNote.Justification.CENTER);
                        properties.chords.push(textChord);
                    }

                    // Render the chords
                    this.formatAndDrawTickables(ctx, properties, properties.chords);

                    barPosition += barWidth;

                    for(j = 0; j < measure.Notes.length; j++) {
                        var note = measure.Notes[j];

                        var duration = note.NoteRhythm.DisplayNoteValueAsNumeric + (note.NoteRhythm.IsDotted ? "d" : "");
                        var noteHead;
                        var staffNoteStruct;
                        if(note.IsRest) {
                            staffNoteStruct = { keys: ["b/4"], duration: duration + "r" };
                        }
                        else {
                            var keys = [];
                            for(m = 0; m < note.NoteHeads.length; m++) {
                                noteHead = note.NoteHeads[m];
                                keys.push(noteHead.NameAndPitch.NoteName.Name.toLowerCase() + '/' + noteHead.NameAndPitch.OctaveNumber);
                            }
                            staffNoteStruct = { clef: bar.clef, keys: keys, duration: duration, stem_direction: note.IsStemUp ? 1 : -1 };
                        }

                        var staffNote = new Vex.Flow.StaveNote(staffNoteStruct);



                        for(var p = 0; p < note.NoteHeads.length; p++) {
                            noteHead = note.NoteHeads[p];

                            var highlights = this.getNoteHighlights(modifications, i, j, p);
                            for(m = 0; m < highlights.length; m++) {
                                var highlight = highlights[m];
                                staffNote.addModifier(p, new Vex.Flow.NoteHighlight({highlightIndex: highlight.HighlightIndex, color: highlight.Color}));
                            }

                            if(noteHead.Accidentals) {
                                staffNote.addAccidental(p, new Vex.Flow.Accidental(noteHead.Accidentals));
                            }
                        }

                        if(note.NoteRhythm.IsDotted)
                            staffNote.addDotToAll();

                        properties.notes.push(staffNote);
                    }



                    barProperties.push(properties);



                    barIndexInLine++;
                }




                var beams = this.getBeams(barProperties);

                var tuplets = this.getTuplets(barProperties);

                // Handle the ties
                var ties = this.getTies(staff, barProperties);

                // Handle the selections
                var noteSelections = this.getNoteSelections(staff, modifications, barProperties);

                // Handle the sections
                var noteSections = this.getNoteSections(staff, modifications, barProperties);



                this.renderNoteText(ctx, modifications, barProperties);


                var staveTextCollection = [];
                for(i = 0; i < barProperties.length; i++) {
                    properties = barProperties[i];
                    measure = properties.measure;
                    bar = properties.bar;

                    var measureTextCollection = this.getMeasureTextCollection(modifications, i);
                    for(k = 0; k < measureTextCollection.length; k++) {
                        var text = measureTextCollection[k];
                        var staveText = new Vex.Flow.StaveText(text.Text, this.getVexPosition(text.Position), {
                            shift_y: 5
                        });
                        staveText.draw(bar);
                    }

                    this.formatAndDrawTickables(ctx, properties, properties.notes);
                }

                for(i = 0; i < staveTextCollection.length; i++) {
                    staveTextCollection[i].setContext(ctx).draw();
                }




                for(i = 0; i < beams.length; i++) {
                    beams[i].setContext(ctx).draw();
                }

                for(i = 0; i < tuplets.length; i++) {
                    tuplets[i].setContext(ctx).draw();
                }


                for(i = 0; i < ties.length; i++) {
                    ties[i].setContext(ctx).draw();
                }

                for(i = 0; i < noteSelections.length; i++) {
                    noteSelections[i].setContext(ctx).draw();
                }

                for(i = 0; i < noteSections.length; i++) {
                    noteSections[i].setContext(ctx).draw();
                }

                return renderer;
            }
        };
    }]);