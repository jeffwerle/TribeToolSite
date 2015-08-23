/*
 * Vex Guitar Chord Chart Renderer.
 * Mohit Muthanna Cheppudira -- http://0xfe.blogspot.com
 * Edited by Ross Hartmann
 * Now uses Html5 Canvas for mobile support instead of Raphael
 */
ChordBox = function(uiService, paper, x, y, width, height, num_strings, num_frets) {
    this.paper = paper;

    this.x = x;
    this.y = y;

    this.width = (!width) ? 100 : width;
    this.height = (!height) ? 100 : height;
    this.num_strings = (!num_strings) ? 6 : num_strings;
    this.num_frets = (!num_frets) ? 5 : num_frets;

    this.spacing = this.width / (this.num_strings);
    this.fret_spacing = (this.height)  / (this.num_frets + 2);

    // Add room on sides for finger positions on 1. and 6. string
    this.x += this.spacing/2;
    //this.y += this.fret_spacing;

    this.metrics = {
        open_circle_radius: this.width / 28,
        circle_radius: this.width / 21,//this.width / 28,
        text_shift_x: this.width / 29,
        text_shift_y: (this.fret_spacing/2),//(this.height /29) + 5,//this.height / 29,
        finger_font_size: Math.ceil(this.width / 12),
        font_size: Math.ceil(this.width / 9),
        bar_shift_x: this.width / 28,
        bridge_stroke_width: 5,//Math.ceil(this.height / 36),
        chord_fill: "#444",
        finger_name_fill: "#fff",
        chord_name_height: this.height / 8
    };

    // Content
    this.absolutePosition = 0;
    this.fretAtWhichToDrawPositionText = 1;
    this.position_text = 0;
    this.chord = [];
    this.bars = [];
};

ChordBox.prototype.vexLine = function(x, y, new_x, new_y) {
    this.paper.moveTo(x,y);
    this.paper.lineTo(new_x,new_y);
    this.paper.stroke();

    return this;
};

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
ChordBox.prototype.roundRect = function(x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined" ) {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }

    this.paper.beginPath();
    this.paper.moveTo(x + radius, y);
    this.paper.lineTo(x + width - radius, y);
    this.paper.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.paper.lineTo(x + width, y + height - radius);
    this.paper.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.paper.lineTo(x + radius, y + height);
    this.paper.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.paper.lineTo(x, y + radius);
    this.paper.quadraticCurveTo(x, y, x + radius, y);
    this.paper.closePath();
    if (stroke) {
        this.paper.stroke();
    }
    if (fill) {
        this.paper.fill();
    }

    return this;
};

/*
    elementToFill: Only used if using Raphael (i.e. not Html5)
 */
ChordBox.prototype.fill = function(fillStyle) {
    this.paper.fillStyle = fillStyle;
    this.paper.fill();

    return this;
};

/*
 elementToStroke: Only used if using Raphael (i.e. not Html5)
 */
ChordBox.prototype.stroke = function(lineWidth, strokeStyle) {
    var previousLineWidth = this.paper.lineWidth;
    this.paper.lineWidth = lineWidth;
    this.paper.strokeStyle = strokeStyle || 'black';
    this.paper.stroke();
    this.paper.lineWidth = previousLineWidth;

    return this;
};

ChordBox.prototype.text = function(x, y, text, fontSize, fill) {
    this.paper.font = fontSize + "px Arial";
    if(fill)
        this.paper.fillStyle = fill;
    this.paper.fillText(text,x -4,y);
    return this;
};

ChordBox.prototype.measureText = function(text, fontSize) {
    this.paper.font = fontSize + "px Arial";
    return this.paper.measureText(text);
};

ChordBox.prototype.circle = function(x, y, radius) {

    this.paper.beginPath();
    this.paper.arc(x,y,radius,0,2*Math.PI, false);
    this.paper.stroke();
    return this;
};



ChordBox.prototype.setNumFrets = function(num_frets) {
    this.num_frets = num_frets;
    this.fret_spacing = (this.height) / (this.num_frets + 1 );
    return this;
};

ChordBox.prototype.setChord = function(chord, absolutePosition, fretAtWhichToDrawPositionText, position_text, bars, tuning, chordName) {
    this.chord = chord;
    this.absolutePosition = absolutePosition || 0;
    this.fretAtWhichToDrawPositionText = fretAtWhichToDrawPositionText;
    this.position_text = position_text || 0;
    this.bars = bars || [];
    this.tuning =  tuning || ["E", "A", "D", "G", "B", "E"];
    this.chordName = chordName;
    if (tuning == [])
        this.fret_spacing = (this.height)  / (this.num_frets + 1);
    return this;
};

ChordBox.prototype.setPositionText = function(position) {
    this.position_text = position;
    return this;
};

ChordBox.prototype.necessitatesBridge = function() {
    return this.absolutePosition - this.fretAtWhichToDrawPositionText <= 0;
};

ChordBox.prototype.hasChordName = function() {
    return angular.isDefined(this.chordName) && this.chordName !== null;
};

ChordBox.prototype.getChartY = function() {
    if(this.hasChordName()) {
        return this.y + this.fret_spacing + (this.metrics.chord_name_height);
    }
    else {
        return this.y + this.fret_spacing;
    }
};

ChordBox.prototype.draw = function() {
    var spacing = this.spacing;
    var fret_spacing = this.fret_spacing;

    if(this.hasChordName()) {
        var textMeasurement = this.measureText(this.chordName, this.metrics.font_size);
        this.text((this.x + ((this.width/2) - (textMeasurement.width/2))) - this.metrics.text_shift_x,
            this.y + this.metrics.chord_name_height,
            this.chordName,
            this.metrics.font_size);
    }

    // Draw guitar bridge if necessary
    if (this.necessitatesBridge()) {
        this.vexLine(this.x, this.getChartY() - this.metrics.bridge_stroke_width/2,
                this.x + (spacing * (this.num_strings - 1)),
                this.getChartY() - this.metrics.bridge_stroke_width/2 )
            .stroke(this.metrics.bridge_stroke_width, null);
    }

    if(this.fretAtWhichToDrawPositionText) {
        var x = this.x - (this.spacing / 2) - this.metrics.text_shift_x;
        if(this.position_text.toString().length > 1) {
            x -= this.metrics.text_shift_x;
        }
        this.text(x,
            this.getChartY() + (this.fret_spacing / 4) +
                this.metrics.text_shift_y +
                (this.fret_spacing * (this.fretAtWhichToDrawPositionText - 1)),
            this.position_text,
                this.metrics.font_size);
    }

    // Draw strings
    for (var i = 0; i < this.num_strings; ++i) {
        this.vexLine(this.x + (spacing * i), this.getChartY(),
            this.x + (spacing * i),
            this.getChartY() + (fret_spacing * (this.num_frets)));
    }

    // Draw frets
    for (var i = 0; i < this.num_frets + 1; ++i) {
        this.vexLine(this.x, this.getChartY() + (fret_spacing * i),
            this.x + (spacing * (this.num_strings - 1)),
            this.getChartY() + (fret_spacing * i));
    }

    // Draw tuning keys
    if (this.tuning!=[]) {
        var tuning = this.tuning;
        for (var i = 0; i < tuning.length; ++i) {
            var t = this.text(
                this.x + (this.spacing * i),
                this.getChartY() +
                    ((this.num_frets + 1) * this.fret_spacing),
                tuning[i], this.metrics.font_size);
        }
    }


    // Draw bars
    for (var i = 0; i < this.bars.length; ++i) {
        this.lightBar(this.bars[i].from_string,
            this.bars[i].to_string,
            this.bars[i].fret);
    }

    // Draw chord
    for (var i = 0; i < this.chord.length; ++i) {
        var bar = null;
        var string_num = this.chord[i][0];
        var fret_num = this.chord[i][1];
        for (var j = 0; j < this.bars.length; ++j) {
            if(this.bars[j].fret === fret_num &&
                string_num >= this.bars[j].from_string &&
                string_num <= this.bars[j].to_string) {
                bar = this.bars[j];
                break;
            }
        }
        this.lightUp(string_num, fret_num, this.chord[i][2], bar);
    }

};

ChordBox.prototype.lightUp = function(string_num, fret_num, fingerName, bar) {
    var shift_position = 0;
    if (this.absolutePosition == 1 && this.fretAtWhichToDrawPositionText == 1) {
        shift_position = this.fretAtWhichToDrawPositionText;
    }

    var mute = false;

    if (fret_num == "x") {
        fret_num = 0;
        mute = true;
    }
    else {
        fret_num -= shift_position;
    }

    var x = this.x + (this.spacing * string_num);
    var y = this.getChartY() + (this.fret_spacing * (fret_num)) ;

    if (fret_num == 0) {
        y -= this.metrics.bridge_stroke_width;
    }

    var noteAboveBridgePaddingBottom = this.fret_spacing <= 15 ? this.fret_spacing : 15;

    if (!mute) {
        var noteY = fret_num == 0
            ? y-(noteAboveBridgePaddingBottom/2)
            : y-Math.floor(this.fret_spacing/2);

        // Don't display the circle if there's a bar on this fret.
        if(!bar) {
            var c = this.circle(x, noteY, fret_num == 0 ? this.metrics.open_circle_radius : this.metrics.circle_radius);
            if (fret_num > 0) {
                // Fill the circle
                this.fill(this.metrics.chord_fill);
            }
        }

        // Only show the finger names if this is one of the endpoints of a bar
        // or if there is no bar
        if(!bar || (string_num === bar.from_string ||
            string_num === bar.to_string)) {
            if(fingerName) {
                var fingerText = fingerName[0] === 'I' ? '1' : fingerName[0] === 'M' ? '2' : fingerName[0] === 'R' ? '3' : fingerName[0] === 'P' ? '4' : fingerName[0];
                //var fingerText = fingerName[0];
                var text_metrics = this.paper.measureText(fingerText);
                var text_width = text_metrics.width;
                var textOffset = 0;
                if(text_width <= 5)
                    textOffset -= 3;
                this.text(x - textOffset, noteY + (this.metrics.finger_font_size/4) + 1, fingerText, this.metrics.finger_font_size, this.metrics.finger_name_fill);
            }
        }
    } else {
        if(this.necessitatesBridge())
            noteAboveBridgePaddingBottom += (this.metrics.bridge_stroke_width/2);

        c = this.text(x, y-(noteAboveBridgePaddingBottom-this.metrics.font_size), "X", this.metrics.font_size, this.metrics.chord_fill);
    }

    return this;
};

ChordBox.prototype.lightBar = function(string_from, string_to, fret_num) {
    if (this.absolutePosition == 1 && this.fretAtWhichToDrawPositionText == 1) {
        fret_num -= this.fretAtWhichToDrawPositionText;
    }

    var string_from_num = string_from;
    var string_to_num = string_to;

    var x = this.x + (this.spacing * string_from_num) - this.metrics.bar_shift_x;
    var x_to = this.x + (this.spacing * string_to_num) + this.metrics.bar_shift_x;

    var y = this.getChartY() + (this.fret_spacing * (fret_num - 1)) +
        (this.fret_spacing / 4);
    var y_to = this.getChartY() + (this.fret_spacing * (fret_num - 1)) +
        ((this.fret_spacing / 4) * 3);

    this.roundRect(x, y, (x_to - x), (y_to - y), this.metrics.circle_radius)
        .fill(this.metrics.chord_fill);

    return this;
};