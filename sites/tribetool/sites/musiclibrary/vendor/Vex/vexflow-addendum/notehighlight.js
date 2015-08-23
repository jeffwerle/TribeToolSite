Vex.Flow.NoteHighlight = (function(){
    function NoteHighlight(options) {
        if (arguments.length > 0) this.init(options);
    }

    // To enable logging for this class. Set `Vex.Flow.Accidental.DEBUG` to `true`.
    function L() { if (NoteHighlight.DEBUG) Vex.L("Vex.Flow.NoteHighlight", arguments); }

    var Modifier = Vex.Flow.Modifier;

    // ## Prototype Methods
    //
    // An `NoteHighlight` inherits from `Modifier`, and is formatted within a
    // `ModifierContext`.
    Vex.Inherit(NoteHighlight, Modifier, {
        init: function(options) {
            NoteHighlight.superclass.init.call(this);
            L("New note highlight: ", options);

            this.note = null;
            // The `index` points to a specific note in a chord.
            this.index = null;
            this.options = options;
            this.position = Modifier.Position.LEFT;
        },

        // Return the modifier type. Used by the `ModifierContext` to calculate
        // layout.
        getCategory: function() { return "notehighlights"; },

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

            var width = this.note.note_heads[0].width;
            // Figure out the start `x` and `y` coordinates for this note and index.
            var start = this.note.getModifierStartXY(this.position, this.index);
            var mod_x = (start.x + this.x_shift);
            var mod_y = start.y + this.y_shift;



            var strokeWidth = 2;

            var radius = width + 1;
            var x_offset = 0;
            if(this.options.highlightIndex)
            {
                x_offset = (this.options.highlightIndex * (strokeWidth + 1));
                radius += x_offset * 2;
            }
            var circle_x = mod_x + (radius/2) - x_offset;
            var circle_y = mod_y;
            var strokeStyle = this.options.color || 'red';
            var ctx = this.context;

            if(ctx.paper) {
                // Raphael
                var c = ctx.paper.circle(circle_x,circle_y,radius);
                c.attr({ stroke: strokeStyle, 'stroke-width': strokeWidth })
            }
            else {
                this.context.save();

                ctx.beginPath();
                ctx.arc(circle_x,circle_y,radius,0,2*Math.PI);
                ctx.stroke();

                this.context.restore();
            }



            /*

            var bounds = this.getNoteHeadBounds();
            var highest_line = bounds.highest_line;
            var lowest_line = bounds.lowest_line;
            var head_x = this.note_heads[0].getAbsoluteX();

            var that = this;
            function stroke(y) {
                if (that.use_default_head_x === true)  {
                    head_x = that.getAbsoluteX() + that.x_shift;
                }
                var x = head_x - that.render_options.stroke_px;
                var length = ((head_x + that.glyph.head_width) - head_x) +
                    (that.render_options.stroke_px * 2);

                ctx.fillRect(x, y, length, 1);
            }

            var line; // iterator
            for (line = 6; line <= highest_line; ++line) {
                stroke(this.stave.getYForNote(line));
            }

            for (line = 0; line >= lowest_line; --line) {
                stroke(this.stave.getYForNote(line));
            }

*/

        }
    });

    return NoteHighlight;
}());