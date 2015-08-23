Vex.Flow.NoteSelection = (function() {
    function NoteSelection(struct, text) {
        if (arguments.length > 0) this.init(struct, text);
    }

    NoteSelection.prototype = {
        init: function(struct, text) {
            /**
             * struct is a struct that has:
             *
             *  {
       *    first_note: Note,
       *    last_note: Note,
       *    color: Color,
       *    notes: [notes array],
       *    stroke-width: Integer,
       *    isDotted: Boolean,
       *    passthroughMeasure: Boolean (if true, the entire measure will be selected and it will be assumed that the previous and next measure will also be selected).
       *  }
             *
             **/
            this.struct = struct;
            this.context = null;
            this.text = text;

            this.render_options = {
                cp1: 8,      // Curve control point 1
                cp2: 12,      // Curve control point 2
                text_shift_x: 0,
                first_x_shift: 0,
                last_x_shift: 0,
                y_shift: 7,
                tie_spacing: 0,
                font: { family: "Arial", size: 10, style: "" }
            };

            this.font = this.render_options.font;
            this.setNotes(struct);
        },

        setContext: function(context) { this.context = context; return this; },
        setFont: function(font) { this.font = font; return this; },

        /**
         * Set the notes to select.
         *
         * @param {!Object} notes The notes to tie up.
         */
        setNotes: function(struct) {
            if (!struct.first_note && !struct.last_note)
                throw new Vex.RuntimeError("BadArguments",
                    "Selection needs to have either first_note or last_note set.");

            this.first_note = this.struct.first_note;
            this.last_note = this.struct.last_note;

            return this;
        },

        /**
         * @return {boolean} Returns true if this is a partial bar.
         */
        isPartial: function() {
            return (!this.first_note || !this.last_note);
        },


        renderText: function(first_x_px, last_x_px) {
            if (!this.text) return;
            var center_x = (first_x_px + last_x_px) / 2;
            center_x -= this.context.measureText(this.text).width / 2;

            this.context.save();

            if(this.struct.color)
                this.context.setStrokeStyle(this.struct.color);

            this.context.setFont(this.font.family, this.font.size, this.font.style);
            this.context.fillText(
                this.text, center_x + this.render_options.text_shift_x,
                (this.first_note || this.last_note).getStave().getYForTopText() - 1);
            this.context.restore();
        },


        draw: function() {
            if (!this.context)
                throw new Vex.RERR("NoContext", "No context to render selection.");


            this.min_y = Number.MAX_SAFE_INTEGER;
            this.max_y = Number.MIN_SAFE_INTEGER;
            this.top_note = null;
            this.bottom_note = null;
            for(var i = 0; i < this.struct.notes.length; i++) {
                var note = this.struct.notes[i];
                var ys = note.getYs();
                for(var j = 0; j < ys.length; j++) {
                    var y = ys[j];
                    if(y > this.max_y) {
                        this.max_y = y;
                        this.top_note = note;
                    }
                    if(y < this.min_y) {
                        this.min_y = y;
                        this.bottom_note = note;
                    }
                }
            }

            var padding = 3;

            var renderLeftSide = !!this.first_note;
            var renderRightSide = !!this.last_note;

            if(this.struct.passthroughMeasure) {
                renderLeftSide = renderRightSide = false;
            }

            var bottomNoteBoundingBox = this.bottom_note.getBoundingBox();
            var topNoteBoundingBox = this.top_note.getBoundingBox();
            if(renderLeftSide)
                var firstNoteBoundingBox = this.first_note.getBoundingBox();
            if(renderRightSide)
                var lastNoteBoundingBox = this.last_note.getBoundingBox();

            this.min_y = bottomNoteBoundingBox.getY() - padding;
            this.max_y = topNoteBoundingBox.getY() + topNoteBoundingBox.getH() + padding;
            this.min_x = renderLeftSide ? firstNoteBoundingBox.getX() - padding : this.last_note.getStave().x;
            this.max_x = renderRightSide ? lastNoteBoundingBox.getX() + lastNoteBoundingBox.getW() + padding : this.first_note.getStave().x + this.first_note.getStave().width;

            var width = this.max_x - this.min_x;
            var height = this.max_y - this.min_y;

            var ctx = this.context;
            var strokeWidth = this.struct['stroke-width'] || 2;
            var strokeStyle = this.struct.color || 'red';
            var isDotted = this.struct.isDotted;

            if(ctx.paper) {
                var r = null;
                if(renderLeftSide && renderRightSide) {
                    // Raphael
                    r = ctx.paper.rect(this.min_x, this.min_y,width,height);
                }
                else if(renderLeftSide) {
                    // Don't render right side
                    // M = "move to" and L = "line to"
                    // Start at top right, line to top left, line to bottom left, line to bottom right
                    r = ctx.paper.path(["M", this.max_x, this.max_y, "L", this.min_x, this.max_y, "L", this.min_x, this.min_y, "L", this.max_x, this.min_y]);
                }
                else if(renderRightSide) {
                    // Don't render left side
                    // Start at top left, line to top right, line to bottom right, line to bottom left
                    r = ctx.paper.path(["M", this.min_x, this.max_y, "L", this.max_x, this.max_y, "L", this.max_x, this.min_y,  "L", this.min_x, this.min_y]);
                }
                else {
                    // Don't render either side
                    // Start at top left, line to top right, move to bottom right, line to bottom left
                    r = ctx.paper.path(["M", this.min_x, this.max_y, "L", this.max_x, this.max_y, "M", this.max_x, this.min_y,  "L", this.min_x, this.min_y]);
                }

                var rectAttr = { stroke: strokeStyle, 'stroke-width': strokeWidth };
                if(isDotted)
                    rectAttr['stroke-dasharray'] = '--';
                r.attr(rectAttr)
            }
            else {
                this.context.save();

                ctx.beginPath();
                ctx.rect(this.min_x, this.min_y,width,height);
                ctx.stroke();

                this.context.restore();
            }

            this.renderText(this.min_x, this.max_x);
            return true;
        }

    };

    return NoteSelection;
}());