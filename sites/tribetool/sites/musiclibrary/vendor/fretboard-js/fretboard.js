// The jQuery plugin
(function($) {
	"use strict";

	$.fn.fretboard = function(options) {
		// The plugin will be called like this:
		// $('#container').fretboard({ ... });
		// Iterate over each element in the jQuery 
		// collection, initializing a fretboard.   
		return this.each(function() {
			var element = $(this);

			// Return early if this element already has a plugin instance.
			// Otherwise, place a fretboard object on the element's data
			if (element.data('fretboard')) return;

			var fretboard = new Fretboard(element, options);

			element.data('fretboard', fretboard);
		});
	};
})(jQuery);

(function($) {
	"use strict";
	// Make this object available on the global scope
	window.Fretboard = function($fretboardContainer, settings) {
		var self = this; // the fretboard object

		var ALL_NOTE_LETTERS = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "Ab/G#", "A", "A#/Bb", "B" ];
		// The values in this object are used in note arithmetic and must also map correct to the ALL_NOTE_LETTERS array for validation purposes.
		// Example: C is value 0, and is at index 0 of ALL_NOTE_LETTERS
		var NOTE_LETTER_VALUE_MAP = {
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
			"B": 11,
		};

		// Default config settings
		var config = {
			// x and y location of the upper left of the fretboard (the tuning squares will be further to the left)
			fretboardOrigin: [80, 15],
			noteClickingDisabled: false,
			tuningClickingDisabled: false,
			numFrets: 15,
			fretWidth: 67, // (px) 
			fretHeight: 31, // (px)  
			isChordMode: false,
			// Default strings (note letters), from high to low.
			guitarStringNotes: [{
				"noteLetter": "E",
				"noteOctave": 5
			}, {
				"noteLetter": "B",
				"noteOctave": 5
			}, {
				"noteLetter": "G",
				"noteOctave": 4
			}, {
				"noteLetter": "D",
				"noteOctave": 4
			}, {
				"noteLetter": "A",
				"noteOctave": 4
			}, {
				"noteLetter": "E",
				"noteOctave": 3
			}, ],
			clickedNoteCircColor: 'green',
			clickedNoteTextColor: 'black',
			hoverNoteCircColor: 'white',
			hoverNoteTextColor: 'black',
			tuningTriangleColor: 'green',
			showTuningTriangles: true,
			showTuningSquares: true,
			tuningSquaresColor: "white",
			tuningSquaresTextColor: "black",
			fretsToDrawOneCircleOn: [3, 5, 7, 9, 12], // Will do octaves of these numbers as well 
			opacityAnimateSpeed: 125,
			fretboardColor: 'tan',
			stringColor: 'black',
			nutColor: 'black'
		};


		// Make a copy of the original settings provided by the user, because we may modify it in the code before
		// programatically calling "init()" when redrawing the fretboard. We don't want to overwrite their original object.
		var settingsCopy = $.extend(true, {}, settings || {}),
			extendedConfig, // Config options will be copied to these private variables
			fretboardOrigin,
			numFrets,
			fretWidth,
			fretHeight,
			isChordMode,
			guitarStringNotes,
			clickedNoteCircColor,
			clickedNoteTextColor,
			hoverNoteCircColor,
			hoverNoteTextColor,
			fretboardColor,
			stringColor,
			tuningTriangleColor,
			fretsToDrawOneCircleOn,
			opacityAnimateSpeed,
			letterFontSize,
			noteCircRad,
			noteTuningSquareWidth,
			numStrings,
			// Will hold the squares (Raphael objects) that show the each string's note letter
			tuningSquares,
			showTuningSquares,
			showTuningTriangles,
			tuningSquaresColor,
			tuningSquaresTextColor,
			nutColor,
			// A 2-d array that holds each Raphael group that contains both the circle and text for each note                           
			allRaphaelNotes,
			svgWidth,
			svgHeight,
			svgHeightBuffer,
			svgWidthBuffer,
			$svg,
			$window,
			paper,
			noteClickingDisabled,
			tuningClickingDisabled,
			// This holds the fret numbers that are clicked, from high to low.
			// Example for a maj7 fingering in Standard E tuning:
			// [[3], [5], [4], [], [3], []] .
			notesClickedTracker;

		// This function initializes all private variables and can be called
		// internally if a fretboard redraw is necessary, such as when adding/removing 
		// strings. It would be faster to just draw or remove the strings in question,
		// but for now that is not implemented as it is more complex.
		// For any variables that can be set by fretboard methods make sure to
		// use that variable's value if it exists, or else it will be reset.

		function init() {
			//console.log("init called");
			notesClickedTracker = [];
			extendedConfig = {};

			$.extend(extendedConfig, config, settingsCopy);

			// Copy config options to fretboard private variables
			fretboardOrigin = extendedConfig.fretboardOrigin;
			numFrets = extendedConfig.numFrets;
			fretWidth = extendedConfig.fretWidth;
			fretHeight = extendedConfig.fretHeight / 1.1;
			isChordMode = extendedConfig.isChordMode;
			noteClickingDisabled = extendedConfig.noteClickingDisabled;
			tuningClickingDisabled = extendedConfig.tuningClickingDisabled;
			guitarStringNotes = extendedConfig.guitarStringNotes;
			numStrings = guitarStringNotes.length;
			// Will hold the squares that show the each string's note letter
			tuningSquares = [];
			showTuningTriangles = extendedConfig.showTuningTriangles;
			showTuningSquares = extendedConfig.showTuningSquares;
			tuningSquaresColor = extendedConfig.tuningSquaresColor;
			tuningSquaresTextColor = extendedConfig.tuningSquaresTextColor;
			// A 2-d array that holds each group (circle and text) for each string
			allRaphaelNotes = new Array(numStrings);
			// Default color a note gets when clicked by a user. You can programatically set clicked notes with diffferent colors
			clickedNoteCircColor = extendedConfig.clickedNoteCircColor;
			clickedNoteTextColor = extendedConfig.clickedNoteTextColor;
			hoverNoteCircColor = extendedConfig.hoverNoteCircColor;
			hoverNoteTextColor = extendedConfig.hoverNoteTextColor;
			fretboardColor = extendedConfig.fretboardColor;
			stringColor = extendedConfig.stringColor;
			nutColor = extendedConfig.nutColor;
			tuningTriangleColor = extendedConfig.tuningTriangleColor; // need letter color
			fretsToDrawOneCircleOn = extendedConfig.fretsToDrawOneCircleOn; // only specify the first octaves (0, 3, 5, 7, 9)
			opacityAnimateSpeed = extendedConfig.opacityAnimateSpeed; // ms
			letterFontSize = extendedConfig.fretHeight / 4;
			noteCircRad = extendedConfig.fretHeight / 2.5;
			noteTuningSquareWidth = extendedConfig.fretHeight / 1.35;

			svgWidth = 0;
			svgHeight = 0;
			svgHeightBuffer = 5;
			svgWidthBuffer = 0;
			$svg = null;
			$window = $(window);

			// create paper object (requires Raphael.js)
			paper = new Raphael($fretboardContainer.attr('id'), '100%', '100%');

			for (var i = 0; i < numStrings; i++) {
				// Probably don't need to call Array, but it works for now
				allRaphaelNotes[i] = new Array(numFrets);
				notesClickedTracker[i] = [];
			}

			validateGuitarStringNotes();

			drawAndWireUpFretboard();
		}

		//self.disable = function () {
		//    $svg.css('z-index', -1000);
		//};

		//self.enable = function () {
		//    $svg.css('z-index', 1);
		//}

		self.disableNoteClicking = function() {
			noteClickingDisabled = true;
		}

		self.disableTuningClicking = function() {
			tuningClickingDisabled = true;
		}

		self.enableNoteClicking = function() {
			noteClickingDisabled = false;
		}

		self.enableTuningClicking = function() {
			tuningClickingDisabled = false;
		}

		self.setChordMode = function(isChordModeInput) {
			isChordMode = isChordModeInput;
		}

		self.clearClickedNotes = function() {
			var i, j, clickedFrets, clickedFret, clickedGroup, color;

			for (i = 0; i < guitarStringNotes.length; i++) {
				clickedFrets = notesClickedTracker[i];

				// See if any of the frets were also clicked            
				for (j = 0; j < clickedFrets.length; j++) {
					clickedFret = clickedFrets[j].fret;
					clickedGroup = allRaphaelNotes[i][clickedFret];

					makeNoteInvisible(clickedGroup);
					clickedGroup.hover(noteMouseOver, noteMouseOut);
				}

				notesClickedTracker[i] = [];
			}

			$fretboardContainer.trigger("notesCleared");
		}

		self.getGuitarStringNotes = function() {
			return guitarStringNotes;
		}

		self.getClickedNotes = function() {
			var i, j, frets, fret, group, musicalNote, notes = [];

			for (i = 0; i < guitarStringNotes.length; i++) {
				frets = notesClickedTracker[i];

				for (j = 0; j < frets.length; j++) {
					fret = frets[j].fret;

					group = allRaphaelNotes[i][fret];

					musicalNote = {
						noteLetter: group.noteLetter,
						noteOctave: group.noteOctave,
						fretNumber: group.fretNumber,
						stringItsOn: {
							noteLetter: group.stringLetter,
							noteOctave: group.stringOctave
						}
					}

					notes.push(musicalNote);
				}
			}

			return notes;
		}

		function validateGuitarStringNotes() {
			for (var i = 0; i < guitarStringNotes.length; i++) {
				guitarStringNotes[i].noteLetter = validateNoteLetter(guitarStringNotes[i].noteLetter);
			}
		}

		// This inspects a note letter and returns the representation that
		// will be used in this code

		function validateNoteLetter(noteLetter) {
			// Make sure it's a valid note by checking to see if it has a numeric value
			var noteVal = NOTE_LETTER_VALUE_MAP[noteLetter];

			if (!isNaN(noteVal)) {
				return ALL_NOTE_LETTERS[noteVal];
			}

			throwNoteLetterError(noteLetter);
		}

		function throwNoteLetterError(noteLetter) {
			throw noteLetter + " is not a valid note. All valid notes are defined in the following array: " + ALL_NOTE_LETTERS;
		}

		function validateFretNum(fretNum) {
			if (!isNaN(fretNum) && fretNum <= numFrets) {
				return fretNum;
			}
		}

		function throwFretNumError(fretNum) {
			throw fretNum + " is not a valid fret number. There are " + numFrets + " frets.";
		}

		// To be used internally

		function setClickedNoteByStringNoteAndFretNum(stringNote, fretNumber, params) {
			for (var i = 0; i < guitarStringNotes.length; i++) {
				// Find the note, and click it if it's not clicked (otherwise it will disappear)
				// Edit* actually it should be the user's responsibility to check what they are clicking,
				// and this should be called "clickNote..." 
				if (getNoteUniqueValue(guitarStringNotes[i]) === getNoteUniqueValue(stringNote) /*&& !notesClickedTracker[i]*/ ) {
					var group = allRaphaelNotes[i][fretNumber];
					var circ = group[0];
					circ.trigger("click", circ, params);
				}
			}
		}

		// to be used externally as API function
		self.setClickedNoteByStringNoteAndFretNum = function(note) {
			//console.log("note inside setClickedNoteByStringNoteAndFretNum");
			//console.log(note);
			setClickedNoteByStringNoteAndFretNum({
				noteLetter: validateNoteLetter(note.stringItsOn.noteLetter),
				noteOctave: note.stringItsOn.noteOctave
			}, validateFretNum(note.fretNumber), {
				wasCalledProgramatically: true,
				circColor: note.circColor,
				textColor: note.textColor
			});
		}

		// self.addString = function (stringNote) {
		// if (stringNote) {
		// var oldClickedNotes = notesClickedTracker.slice();

		// // add the new
		// settings.guitarStringNotes.push(stringNote);

		// init();

		// resetOldClickedNotes(oldClickedNotes);

		// $fretboardContainer.trigger("tuningChanged");
		// }
		// }

		// self.removeString = function () {
		// if (guitarStringNotes.length > 1) {
		// var oldClickedNotes = notesClickedTracker.slice();

		// settings.guitarStringNotes.pop();

		// init();

		// resetOldClickedNotes(oldClickedNotes);

		// $fretboardContainer.trigger("tuningChanged");
		// }
		// }

		self.setTuning = function(newGuitarStringNotes) {
			var newLength, oldClickedNotes, difference, i;

			if (newGuitarStringNotes && newGuitarStringNotes.length > 0) {
				newLength = newGuitarStringNotes.length;

				oldClickedNotes = notesClickedTracker.slice(0); // copy

				if (newLength <= oldClickedNotes.length) {
					oldClickedNotes = notesClickedTracker.slice(0, newLength);
				} else {
					difference = newLength - oldClickedNotes.length;

					for (var i = 0; i < difference; i++) {
						oldClickedNotes.push([]);
					}
				}

				// Any time init() is called after the first time, we need to modify
				// the settings object so settings changed throughout the fretboard's life
				// are preserved. Might need to create a function for this.
				settingsCopy.guitarStringNotes = newGuitarStringNotes;
				settingsCopy.isChordMode = isChordMode;
				settingsCopy.noteClickingDisabled = noteClickingDisabled;
				settingsCopy.tuningClickingDisabled = tuningClickingDisabled;

				paper.remove();

				init();

				resetOldClickedNotes(oldClickedNotes);

				$fretboardContainer.trigger("tuningChanged");
			}
		}

		// Could make this a public function that loops over a list of clicked notes and sets them

		function resetOldClickedNotes(oldClickedNotes) {
			var i, j, stringNum, fretNums, fretNum;

			for (i = 0; i < oldClickedNotes.length; i++) {
				stringNum = i;
				fretNums = oldClickedNotes[i];

				for (j = 0; j < fretNums.length; j++) {
					fretNum = fretNums[j].fret;

					setClickedNoteByStringNoteAndFretNum({
						noteLetter: guitarStringNotes[stringNum].noteLetter,
						noteOctave: guitarStringNotes[stringNum].noteOctave
					}, fretNum, {
						immediate: true,
						wasCalledProgramatically: true,
						circColor: fretNums[j].circColor,
						textColor: fretNums[j].textColor
					});
				}
			}
		}

		function bindEventHandlersToNote(group) {
			group.click(noteClick); // bind click events
			group.hover(noteMouseOver, noteMouseOut); // bind hover events
		}

		function makeNoteVisibleAnimated(group, circColor, textColor) {
			var circ = group[0];
			var text = group[1];
			circ.animate({
				'fill-opacity': 1,
				'stroke-opacity': 1,
				'opacity': 1,
				'fill': circColor
			}, opacityAnimateSpeed);
			text.animateWith(circ, null, {
				'fill-opacity': 1,
				'stroke-opacity': 1,
				'opacity': 1,
				'fill': textColor
			}, opacityAnimateSpeed);
			group.attr('cursor', 'pointer');
		}

		function makeNoteVisibleImmediate(group, circColor, textColor) {
			var circ = group[0];
			var text = group[1];
			circ.attr({
				'fill-opacity': 1,
				'stroke-opacity': 1,
				'opacity': 1,
				'fill': circColor
			});
			text.attr({
				'fill-opacity': 1,
				'stroke-opacity': 1,
				'opacity': 1,
				'fill': textColor
			});
			group.attr('cursor', 'pointer');
		}

		function makeNoteInvisible(group) {
			group.animate({
				'fill-opacity': 0,
				'stroke-opacity': 0,
				'opacity': 0
			}, opacityAnimateSpeed);
		}

		function makeNoteInvisibleImmediate(group) {
			group.attr({
				'fill-opacity': 0,
				'stroke-opacity': 0,
				'opacity': 0
			});
		}

		function bindEventHandlersToTuningTriangle(triangle) {
			triangle.click(tuningTriangleClick);
		}

		function drawFretCircle(fret, circX, circY, topFretExtended, bottomFretExtended) {
			for (var k = 0; k < fretsToDrawOneCircleOn.length; k++) {
				var num = fretsToDrawOneCircleOn[k];

				var matchOrMultiple = ((fret - num) % 12);

				if (matchOrMultiple === 0) {
					paper.circle(circX, topFretExtended + ((bottomFretExtended - topFretExtended) / 2), noteCircRad / 3).attr("fill", "black");
					break;
				}
			}
		}

		function makeTextUnselectable(text) {
			$(text.node).css({
				"-webkit-touch-callout": "none",
				"-webkit-user-select": "none",
			});
		}

		function noteMouseOver() {
			var group = this.data("group");
			makeNoteVisibleAnimated(group, hoverNoteCircColor, hoverNoteTextColor);
		}

		function noteMouseOut() {
			var group = this.data("group");
			makeNoteInvisible(group);
		}

		function noteClick(params) {
			//console.log(params);
			var wasCalledProgramatically = params && params.wasCalledProgramatically;
			var circColor = (params && params.circColor) || clickedNoteCircColor;
			var textColor = (params && params.textColor) || clickedNoteTextColor;

			if (noteClickingDisabled && !wasCalledProgramatically) {
				return false;
			}

			var immediatelyVisible = params && params.immediate;

			var group = this.data("group");

			var circ = group[0];
			var text = group[1];
			var thisString = group.stringNumber;
			var thisFret = group.fretNumber;

			var clickedFrets = notesClickedTracker[thisString];

			var atLeastOneFretWasClicked = clickedFrets.length > 0; // needs plural name

			var fretNumberIndex = -1;

			for (var i = 0; i < clickedFrets.length; i++) {
				if (clickedFrets[i].fret === thisFret) {
					fretNumberIndex = i;
				}
			}
			var clickedFretWasAlreadyClicked = fretNumberIndex !== -1;

			if (!clickedFretWasAlreadyClicked && atLeastOneFretWasClicked && isChordMode) {
				// Go through and unclick all others
				for (var i = 0; i < clickedFrets.length; i++) {
					var alreadyClickedFret = clickedFrets[i].fret;
					var alreadyClickedGroup = allRaphaelNotes[thisString][alreadyClickedFret];

					makeNoteInvisible(alreadyClickedGroup);
					alreadyClickedGroup.hover(noteMouseOver, noteMouseOut);
				}

				notesClickedTracker[thisString] = [];
			}

			if (clickedFretWasAlreadyClicked) {
				makeNoteInvisible(group);

				group.hover(noteMouseOver, noteMouseOut);
				notesClickedTracker[thisString].splice(fretNumberIndex, 1);
			} else {
				if (immediatelyVisible) {
					makeNoteVisibleImmediate(group, circColor, textColor); // make this a parameter
				} else {
					makeNoteVisibleAnimated(group, circColor, textColor);
				}

				group.unhover(noteMouseOver, noteMouseOut);

				notesClickedTracker[thisString].push({
					fret: thisFret,
					circColor: circColor,
					textColor: textColor
				});
			}

			//if (!wasCalledProgramatically) {
			$fretboardContainer.trigger("noteClicked")
			//}
		}

		function tuningTriangleClick() {
			if (tuningClickingDisabled) {
				return false;
			}

			var triangle = this;

			var thisStringNumber = triangle.data("stringNumber");
			var direction = triangle.data("direction");
			var previousStringLetter = guitarStringNotes[thisStringNumber].noteLetter;

			//console.log("new notes");

			for (var i = 0; i <= numFrets; i++) {
				var group = allRaphaelNotes[thisStringNumber][i];
				var circ = group[0];
				var text = group[1];

				var previousNoteOctave = group.noteOctave;
				var newNoteLetter;
				var newNoteOctave;

				if (direction === "right") {
					newNoteLetter = getNoteLetterByFretNumber(previousStringLetter, i + 1);
					if (newNoteLetter === ALL_NOTE_LETTERS[0])
						newNoteOctave = ++previousNoteOctave;
					else
						newNoteOctave = previousNoteOctave;
				} else {
					newNoteLetter = getNoteLetterByFretNumber(previousStringLetter, i - 1);
					if (newNoteLetter === ALL_NOTE_LETTERS[11])
						newNoteOctave = --previousNoteOctave;
					else
						newNoteOctave = previousNoteOctave;
				}

				// Set the new string letter on the tuning square and array 
				if (i === 0) {
					guitarStringNotes[thisStringNumber].noteLetter = newNoteLetter;

					if (showTuningSquares) {
						tuningSquares[thisStringNumber].attr("text", newNoteLetter).data("octaveText").attr("text", newNoteOctave);
					}

					guitarStringNotes[thisStringNumber].noteOctave = newNoteOctave;
				}

				text.attr("text", newNoteLetter); // change the text    

				group.noteLetter = newNoteLetter;
				group.noteOctave = newNoteOctave;
				group.stringLetter = guitarStringNotes[thisStringNumber].noteLetter;
				group.stringOctave = guitarStringNotes[thisStringNumber].noteOctave;
				//stringNumber should not change, or fretNumber

				//console.log(newNoteLetter + " " + newNoteOctave);
			}

			//console.log(guitarStringNotes);

			$fretboardContainer.trigger("tuningChanged");
		}

		function drawTuningTriangleAndBindEventHandlers(midX, midY, topX, topY, bottomX, bottomY, direction, stringNumber) {
			var tri = paper.path("M" + midX + "," + midY + "L" + topX + "," + topY + "L" + bottomX + "," + bottomY + "z");

			tri.attr("fill", tuningTriangleColor).attr("cursor", "pointer").data({
				"direction": direction,
				"stringNumber": stringNumber
			});

			bindEventHandlersToTuningTriangle(tri)
		}

		function getNoteLetterByFretNumber(stringLetter, fretNumber) {
			var fretOffset = NOTE_LETTER_VALUE_MAP[stringLetter] + fretNumber;
			//var dividedByTwelve = fretOffset / 12;
			var numOctavesAboveString = Math.floor(fretOffset / 12);
			// reduce the index by the correct amount to get it below 12
			fretOffset = fretOffset - (12 * numOctavesAboveString);

			return ALL_NOTE_LETTERS[fretOffset];
		}

		function getNoteOctaveByFretNumber(stringOctave, stringLetter, fretNumber) {
			// The string letter has a value, which can be thought of as an amount
			// of notes above the note that begins an octave (C, whose value is 0).
			// Add the fret number to that.
			var fretOffset = NOTE_LETTER_VALUE_MAP[stringLetter] + fretNumber;
			// Now divide by 12 and floor it. That is the number of octaves this
			// fret is above the string.
			var numOctavesAboveString = Math.floor(fretOffset / 12);

			return stringOctave + numOctavesAboveString;
		}

		function getNoteUniqueValue(note) {
			return NOTE_LETTER_VALUE_MAP[note.noteLetter] + (12 * note.noteOctave);
		}

		function setScrollBar($svg, $fretboardContainer) {
			var svgRightPosition = $svg.width() + $svg.position().left;
			var containerRightPosition = $fretboardContainer.width() + $fretboardContainer.position().left;

			if (svgRightPosition > containerRightPosition) {
				$fretboardContainer.css({
					"overflow-x": "scroll"
				});
			} else {
				$fretboardContainer.css({
					"overflow-x": "hidden"
				});
			}
		}

		function drawAndWireUpFretboard() {
			var topFretExtended, bottomFretExtended, stringXBegin, stringXEnd, stringY, i, j, x, y,
				circX, circY, circ, stringLetter, noteLetter, stringOctave, noteOctave, text, group,
				squareWidth, squareX, squareY, square, midX, midY, topX, topY, bottomX, bottomY,
				squareNoteText, squareOctaveText, squareOctaveTextX, squareOctaveTextY;

			// For drawing things that extend above or below the top/bottom string, 
			// like the left vertical part of the fret or the guitar body
			topFretExtended = fretboardOrigin[1] - (1 / 4 * fretHeight);
			bottomFretExtended = fretboardOrigin[1] + ((numStrings - 1) * fretHeight) + (1 / 4 * fretHeight);

			// For the instrument's strings
			stringXBegin = fretboardOrigin[0] + (fretWidth * (1 / 5));
			stringXEnd = fretboardOrigin[0] + (fretWidth * (numFrets)) + (1 * fretWidth); // (1/2 * fretWidth)

			// Draw the rectangle that represents the guitar body 
			paper.rect(stringXBegin, topFretExtended, stringXEnd - stringXBegin, bottomFretExtended - topFretExtended).attr({
				"fill": fretboardColor,
				'stroke-opacity': 0
			});

			// Add frets and circles for note letters, attach data to the frets, and other things
			for (i = 0; i < numStrings; i++) {
				stringY = fretboardOrigin[1] + (i * fretHeight);

				paper.path("M" + stringXBegin + "," + stringY + "L" + stringXEnd + "," + stringY + "z").attr("stroke", stringColor);

				for (j = 0; j < numFrets + 1; j++) {

					// Coordinates for the left of the fret and string
					x = fretboardOrigin[0] + j * (fretWidth);
					y = fretboardOrigin[1] + i * (fretHeight);

					// Coordinates for the center of the fret and string
					circX = x + fretWidth * (1 / 2);
					circY = y;

					if (j > 0) {
						// Draw the left vertical line (left edge of the fret)
						paper.path("M" + x + "," + topFretExtended + "L" + x + "," + bottomFretExtended + "z").attr("stroke", stringColor);

						// If it's the last fret, close it on the right
						//if (j === numFrets) {
						//    var lineRight = paper.path("M" + (x + fretWidth) + "," + topFretExtended + 
						// "L" + (x + fretWidth) + "," + bottomFretExtended + "z").attr("stroke", 'black');
						//}

						if (j === 1) {
							// Draw a rectangle at the left of the first fret, which represents the nut.
							// + 1 to prevent fret division from appearing right next to it
							paper.rect(x - (fretWidth / 5) + 1, topFretExtended, (fretWidth / 5), bottomFretExtended - topFretExtended).attr({
								fill: nutColor,
								stroke: nutColor
							});
						}

						// Draw the circles you usually see on the 3rd, 5th, etc. fret (only do it once, so just
						// choose i === 0)
						if (i === 0) {
							drawFretCircle(j, circX, circY, topFretExtended, bottomFretExtended);
						}

						if (j === numFrets) {
							svgWidth = x + fretWidth + svgWidthBuffer;
						}
					}

					// Draw note circle and note text, and attach data to them
					circ = paper.circle(circX, circY, noteCircRad).attr("fill", "white");

					stringLetter = guitarStringNotes[i].noteLetter;
					noteLetter = getNoteLetterByFretNumber(stringLetter, j);
					stringOctave = guitarStringNotes[i].noteOctave;
					noteOctave = getNoteOctaveByFretNumber(stringOctave, stringLetter, j);

					text = paper.text(circX, circY, noteLetter).attr("font-size", letterFontSize);

					// Don't let the note text be selectable because that's annoying and ugly
					makeTextUnselectable(text);

					// Create a group to hold the circle and its text
					group = paper.set();

					// Assign it a unique id
					group.id = "group" + "_string_" + i + "_fret_" + j;
					group.stringNumber = i;
					group.stringLetter = stringLetter;
					group.stringOctave = stringOctave;
					group.fretNumber = j;
					group.noteLetter = noteLetter;
					group.noteOctave = noteOctave;

					// When you click on a note, it could be either the circle or the text. 
					// So for both cases, store a pointer to the group, which event handlers
					// will use to then retrieve the circle and text together.
					circ.data({
						group: group
					});
					text.data({
						group: group
					});

					group.push(circ, text);

					bindEventHandlersToNote(group);
					makeNoteInvisibleImmediate(group);

					group.toFront();

					// Store it for tracking
					allRaphaelNotes[i][j] = group;
				}
			}

			// Add the squares and triangles which will show/control the string tunings
			for (var i = 0; i < numStrings; i++) {
				x = fretboardOrigin[0] - fretWidth;
				y = fretboardOrigin[1] + i * (fretHeight);

				squareWidth = noteTuningSquareWidth;
				squareX = x + squareWidth / 2 + (showTuningTriangles ? 0 : squareWidth);
				squareY = y - (squareWidth / 2)

				if (showTuningSquares) {
					square = paper.rect(squareX, squareY, squareWidth, squareWidth).attr("fill", tuningSquaresColor);
					squareNoteText = paper.text(squareX + squareWidth / 2, squareY + squareWidth / 2, guitarStringNotes[i].noteLetter).attr({
						"font-size": letterFontSize,
						fill: tuningSquaresTextColor
					});

					// Show the octave near the note on the tuning square
					squareOctaveTextX = squareX + (.80 * squareWidth);
					squareOctaveTextY = squareY + (.20 * squareWidth);

					squareOctaveText = paper.text(squareOctaveTextX, squareOctaveTextY, allRaphaelNotes[i][0].stringOctave).attr({
						"font-size": letterFontSize,
						fill: tuningSquaresTextColor
					});


					squareNoteText.data({
						x: squareOctaveTextX,
						y: squareOctaveTextY,
						octaveText: squareOctaveText
					});

					makeTextUnselectable(squareNoteText);
					makeTextUnselectable(squareOctaveText);

					tuningSquares[i] = squareNoteText;
				}

				if (showTuningTriangles) {
					// Triangles for changing the string tunings
					midX = squareX + squareWidth * 2;
					midY = squareY + squareWidth / 2;
					topX = midX - squareWidth / 1.5;
					topY = midY - squareWidth / 2;
					bottomX = topX;
					bottomY = midY + squareWidth / 2;

					drawTuningTriangleAndBindEventHandlers(midX, midY, topX, topY, bottomX, bottomY, "right", i);

					midX = squareX - (showTuningSquares ? squareWidth : 0);
					midY = squareY + squareWidth / 2;
					topX = midX + squareWidth / 1.5;
					topY = midY - squareWidth / 2;
					bottomX = topX;
					bottomY = midY + squareWidth / 2;

					drawTuningTriangleAndBindEventHandlers(midX, midY, topX, topY, bottomX, bottomY, "left", i);
				}

				if (i === numStrings - 1) {
					svgHeight = squareY + squareWidth + svgHeightBuffer;
				}
			}

			$svg = $fretboardContainer.find("svg");

			$svg.css({
				height: svgHeight,
				width: svgWidth,
				"z-index": 1
			});

			$window.on("load resize", function() {
				setScrollBar($svg, $fretboardContainer);
			});

			setScrollBar($svg, $fretboardContainer);
		} // drawAndWireUpFretboard method

		init();
	};
})(jQuery);

// This function allows us to call a "trigger" event on a Raphael element.
// It takes the name of the event to fire and the scope to fire it with
Raphael.el.trigger = function(str, scope, params) {
	scope = scope || this;
	for (var i = 0; i < this.events.length; i++) {
		if (this.events[i].name === str) {
			this.events[i].f.call(scope, params);
		}
	}
};
