Vex.Flow.NoteSection = (function() {
    function NoteSection(struct, text) {
        if (arguments.length > 0) this.init(struct, text);
    }

    NoteSection.prototype = {
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
       *    followNotes: Boolean (if true, the section will stay close to the notes, otherwise it will be above the staff),
       *    isDotted: Boolean,
       *    displayAbove: Boolean (if true, displays the section above the notes. If false, displays underneath).
       *    height: Integer (the height of the bar that will denote the section),
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

            var textHeight = parseInt(this.font.size, 10);

            this.context.save();

            if(this.struct.color)
                this.context.setStrokeStyle(this.struct.color);


            this.context.setFont(this.font.family, this.font.size, this.font.style);

            var stave = (this.first_note || this.last_note).getStave();
            //var y = this.struct.displayAbove ? stave.getYForTopText() - this.getHeight() : stave.getYForBottomText() + this.getHeight();
            var y = this.struct.displayAbove ? this.min_y - 10 - textHeight : this.max_y + 10 + textHeight;
            this.context.fillText(
                this.text, center_x + this.render_options.text_shift_x,
                y);
            this.context.restore();
        },

        getHeight: function() {
            return this.struct.height || 10;
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
            var height = this.getHeight();

            var renderLeftSide = !!this.first_note;
            var renderRightSide = !!this.last_note;

            var followNotes = this.struct.followNotes;


            var bottomNoteBoundingBox = this.bottom_note.getBoundingBox();
            var topNoteBoundingBox = this.top_note.getBoundingBox();
            if(renderLeftSide)
                var firstNoteBoundingBox = this.first_note.getBoundingBox();
            if(renderRightSide)
                var lastNoteBoundingBox = this.last_note.getBoundingBox();

            this.min_y = bottomNoteBoundingBox.getY() + padding;
            this.max_y = topNoteBoundingBox.getY() + padding;

            var staveY;
            var stave = (this.first_note || this.last_note).getStave();
            if(!this.struct.displayAbove) {
                // Display below
                staveY = stave.getYForBottomText();
                this.min_y += bottomNoteBoundingBox.getH();
                this.max_y += topNoteBoundingBox.getH() + height;

                if(this.max_y < staveY){
                    this.max_y = staveY;
                    this.min_y = this.max_y - height;
                }
            }
            else {
                // Display above
                staveY = stave.getYForTopText();
                this.max_y -= height;

                if(this.max_y > staveY){
                    this.max_y = staveY;
                    this.min_y = this.max_y + height;
                }
            }

            if(this.struct.passthroughMeasure) {
                this.min_y = this.max_y;
                this.min_x = stave.x;
                this.max_x = stave.x + stave.width;
            }
            else {
                this.min_x = renderLeftSide ? firstNoteBoundingBox.getX() - padding : this.last_note.getStave().x;
                this.max_x = renderRightSide ? lastNoteBoundingBox.getX() + lastNoteBoundingBox.getW() + padding : this.first_note.getStave().x + this.first_note.getStave().width;
            }


            var ctx = this.context;
            var strokeWidth = this.struct['stroke-width'] || 2;
            var strokeStyle = this.struct.color || 'red';
            var isDotted = this.struct.isDotted;

            if(ctx.paper) {
                var r = null;
                if(renderLeftSide && renderRightSide) {
                    // M = "move to" and L = "line to"
                    // Start at bottom left, line to top left, line to top right, line to bottom right
                    r = ctx.paper.path(["M", this.min_x, this.min_y,  "L", this.min_x, this.max_y, "L", this.max_x, this.max_y,  "L", this.max_x, this.min_y]);
                }
                else if(renderLeftSide) {
                    // Don't render right side
                    // M = "move to" and L = "line to"
                    // Start at bottom left, line to top left, line to top right
                    r = ctx.paper.path(["M", this.min_x, this.min_y,  "L", this.min_x, this.max_y, "L", this.max_x, this.max_y]);
                }
                else if(renderRightSide) {
                    // Don't render left side
                    // Start at top left, line to top right, line to bottom right
                    r = ctx.paper.path(["M", this.min_x, this.max_y, "L", this.max_x, this.max_y,  "L", this.max_x, this.min_y]);
                }
                else {
                    // Don't render either side
                    // Start at top left, line to top right, line to bottom right
                    r = ctx.paper.path(["M", this.min_x, this.max_y, "L", this.max_x, this.max_y]);
                }

                var rectAttr = { stroke: strokeStyle, 'stroke-width': strokeWidth };
                if(isDotted)
                    rectAttr['stroke-dasharray'] = '--';
                r.attr(rectAttr)
            }

            this.renderText(this.min_x, this.max_x);
            return true;
        }

    };

    return NoteSection;
}());
