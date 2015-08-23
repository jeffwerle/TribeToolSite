



(function() {
    var $injector = angular.element('*[ng-app]').injector();
    var OPTIONS = $injector.get('OPTIONS');

    var moduleDependencies = [];
    /*
     if(OPTIONS.isDebug) {
     // In debug, we'll have to load the individual vendor files
     moduleDependencies = [{
     name: "dependencyModule",
     files: ["sites/default/vendor/dependencyModule.js"]
     }]
     }
     else {
     // In production, the vendor modules will be in this same app.js
     // file so we can inject them the standard way
     moduleDependencies = [
     'dependencyModule'
     ];
     }
     */

    angular.module('dmusiclibrary', ['Scope.safeApply', 'angularFretboard'])
        .config(['$locationProvider', function($locationProvider) {

        }]);

    angular.module('dmusiclibrary.Controllers', []);
    angular.module('dmusiclibrary.Directives', []);
    angular.module('dmusiclibrary.Services', []);




    var communityService = $injector.get('communityService');

    var dependencies = []; // an array of communities
    communityService.loadCommunityScripts({
        community: {
            Url: 'musiclibrary'
        },
        files: [

            /* Canvg */
            'sites/musiclibrary/vendor/canvg/rgbcolor.js',
            'sites/musiclibrary/vendor/canvg/canvg.js',

            /* Raphael */
            'sites/musiclibrary/vendor/fretboard-js/raphael-min.js',

            /* Vex (the order matters here) */
            'sites/musiclibrary/vendor/Vex/vexchords/js/chart.js',
            'sites/musiclibrary/vendor/Vex/vexchords/js/chord.js',

            'sites/musiclibrary/vendor/Vex/vexflow/src/vex.js',

            'sites/musiclibrary/vendor/Vex/vexflow/src/flow.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/canvascontext.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/raphaelcontext.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/tickcontext.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/modifiercontext.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/renderer.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/fraction.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/tickable.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/tables.js',

            'sites/musiclibrary/vendor/Vex/vexflow/src/note.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stem.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stemmablenote.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/modifier.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/accidental.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/dot.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/notehead.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/boundingbox.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/beam.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stavetie.js',

            'sites/musiclibrary/vendor/Vex/vexflow/src/stavenote.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/formatter.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stavemodifier.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stavebarline.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/timesignature.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stave.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/keysignature.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/textnote.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/stavetext.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/clef.js',


            'sites/musiclibrary/vendor/Vex/vexflow/src/fonts/vexflow_font.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/glyph.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/tabstave.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/tabnote.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/modifier.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/bend.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/vibrato.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/voice.js',
            'sites/musiclibrary/vendor/Vex/vexflow/src/tuplet.js',


            'sites/musiclibrary/vendor/Vex/vexflow-addendum/notehighlight.js',
            'sites/musiclibrary/vendor/Vex/vexflow-addendum/noteselection.js',
            'sites/musiclibrary/vendor/Vex/vexflow-addendum/notesection.js',
            'sites/musiclibrary/vendor/Vex/vexflow-addendum/notetext.js',






            /* MIDI */
            'sites/musiclibrary/vendor/midi/js/MIDI/AudioDetect.js',
            'sites/musiclibrary/vendor/midi/js/MIDI/LoadPlugin.js',
            'sites/musiclibrary/vendor/midi/js/MIDI/Plugin.js',
            'sites/musiclibrary/vendor/midi/js/MIDI/Player.js',
            'sites/musiclibrary/vendor/midi/js/Window/DOMLoader.XMLHttp.js',
            'sites/musiclibrary/vendor/midi/inc/Base64.js',
            'sites/musiclibrary/vendor/midi/inc/base64binary.js',


            /* Fretboard.js */
            'sites/musiclibrary/vendor/fretboard-js/fretboard.js',
            'sites/musiclibrary/vendor/fretboard-js/safeApply.js',
            'sites/musiclibrary/vendor/fretboard-js/angular-fretboard.js',







            /* Music Library files */
            'sites/musiclibrary/controllers/homeControllers.js',

            'sites/musiclibrary/services/commServices.js',
            'sites/musiclibrary/services/bazzleServices.js',
            'sites/musiclibrary/services/virtualCowriterServices.js',
            'sites/musiclibrary/services/instrumentServices.js',
            'sites/musiclibrary/services/notationServices.js',
            'sites/musiclibrary/services/midiServices.js',
            'sites/musiclibrary/services/chordServices.js',
            'sites/musiclibrary/services/scaleServices.js',
            'sites/musiclibrary/services/fretboardJsServices.js',
            'sites/musiclibrary/services/navigationServices.js',

            'sites/musiclibrary/services/chord-progressions/chordGridServices.js',
            'sites/musiclibrary/services/chord-progressions/chordProgressionGeneratorServices.js',


            'sites/musiclibrary/directives/bazzleDirectives.js',
            'sites/musiclibrary/directives/instrumentDirectives.js',
            'sites/musiclibrary/directives/virtualCowriterDirectives.js',
            'sites/musiclibrary/directives/midiDirectives.js',
            'sites/musiclibrary/directives/toolDirectives.js',
            'sites/musiclibrary/directives/navigationDirectives.js',
            'sites/musiclibrary/directives/notationDirectives.js',

            'sites/musiclibrary/directives/chord-progressions/chord-grid.js',
            'sites/musiclibrary/directives/chord-progressions/chordProgressionGeneratorDirectives.js'

        ],
        dependencyCommunities: dependencies
    });


})();
