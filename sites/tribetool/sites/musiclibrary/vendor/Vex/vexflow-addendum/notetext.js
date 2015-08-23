Vex.Flow.NoteText = (function(){
    function NoteText(options) {
        if (arguments.length > 0) this.init(options);
    }

    var Modifier = Vex.Flow.Modifier;

    // ## Prototype Methods
    //
    // An `NoteText` inherits from `Modifier`, and is formatted within a
    // `ModifierContext`.
    /**
     * options is a struct that has:
     *
     *  {
     *      text: String
       *    position: (e.g. Vex.Flow.Modifier.Position.BELOW),
       *    color: Color (optional)
       *    textIndex: The index of the text. A higher index indicates that the text will be drawn further away from the note.
       *  }
     *
     **/
    Vex.Inherit(NoteText, Modifier, {
        init: function(options) {
            NoteText.superclass.init.call(this);

            this.note = null;
            // The `index` points to a specific note in a chord.
            this.index = null;
            this.options = options;
            if(!this.options.position)
                this.options.position = Vex.Flow.Modifier.Position.BELOW;
            this.font = { family: "Arial", size: 10, style: "" };
        },

        // Return the modifier type. Used by the `ModifierContext` to calculate
        // layout.
        getCategory: function() { return "notetexts"; },

        // Attach this accidental to `note`, which must be a `StaveNote`.
        setNote: function(note){
            if (!note) throw new Vex.RERR("ArgumentError", "Bad note value: " + note);
            this.note = note;
            this.setWidth(this.note.width);
        },

        // Render accidental onto canvas.
        draw: function() {
            if (!this.context) throw new Vex.RERR("NoContext",
                "Can't draw accidental without a context.");
            if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
                "Can't draw accidental without a note and index.");

            var stave = this.note.getStave();
            var boundingBox = this.note.getBoundingBox();
            var stemExtents = this.note.getStemExtents();
            var text = this.options.text;

            var staveY;
            var y = boundingBox.getY();
            var textIndexOffset = this.options.textIndex ? this.options.textIndex * (5) : 0;
            if(this.options.position === Vex.Flow.Modifier.Position.BELOW) {
                staveY = stave.getYForBottomText();
                y += boundingBox.getH();
                y += 15;

                if(y < staveY)
                    y = staveY;

                y += textIndexOffset;
            }
            else {
                staveY = stave.getYForTopText();
                y -= boundingBox.getH();
                y -= 15;
                if(y > staveY)
                    y = staveY;

                y -= textIndexOffset;
            }


            var center_x = (boundingBox.getX() + (boundingBox.getW() / 2));
            center_x -= this.context.measureText(text).width / 2;

            this.context.save();

            if(this.options.color)
                this.context.setStrokeStyle(this.options.color);

            this.context.setFont(this.font.family, this.font.size, this.font.style);
            this.context.fillText(
                text, center_x,
                y);
            this.context.restore();
        }
    });

    return NoteText;
}());