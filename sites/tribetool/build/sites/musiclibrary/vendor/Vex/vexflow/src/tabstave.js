// Vex Flow
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Cheppudira 2010

/** @constructor */
Vex.Flow.TabStave = (function() {
  function TabStave(x, y, width, options) {
    if (arguments.length > 0) this.init(x, y, width, options);
  }

  Vex.Inherit(TabStave, Vex.Flow.Stave, {
    init: function(x, y, width, options) {
      var tab_options = {
        spacing_between_lines_px: 13,
        num_lines: 6,
        top_text_position: 1
      };

      Vex.Merge(tab_options, options);
      TabStave.superclass.init.call(this, x, y, width, tab_options);
    },

    getYForGlyphs: function() {
      return this.getYForLine(2.5);
    },

    addTabGlyph: function() {
      var glyphScale;
      var glyphOffset;

      switch(this.options.num_lines) {
        case 12:
          glyphScale = 90;
          glyphOffset = 42;
          break;
        case 11:
          glyphScale = 81;
          glyphOffset = 35;
          break;
        case 10:
          glyphScale = 72;
          glyphOffset = 28;
          break;
        case 9:
          glyphScale = 63;
          glyphOffset = 21;
          break;
        case 8:
          glyphScale = 55;
          glyphOffset = 14;
          break;
        case 7:
          glyphScale = 47;
          glyphOffset = 8;
          break;
        case 6:
          glyphScale = 40;
          glyphOffset = 1;
          break;
        case 5:
          glyphScale = 30;
          glyphOffset = -6;
          break;
        case 4:
          glyphScale = 23;
          glyphOffset = -12;
          break;
        case 3:
          glyphScale = 16;
          glyphOffset = -18;
          break;
        case 2:
          glyphScale = 9;
          glyphOffset = -34;
          break;
        case 1:
          glyphScale = 1;
          glyphOffset = -40;
          break;
      }

      var tabGlyph = new Vex.Flow.Glyph("v2f", glyphScale);
      tabGlyph.y_shift = glyphOffset;
      this.addGlyph(tabGlyph);
      return this;
    }
  });

  return TabStave;
}());