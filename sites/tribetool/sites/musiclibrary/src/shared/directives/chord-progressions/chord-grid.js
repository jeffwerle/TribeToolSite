angular.module('dmusiclibrary.Directives')
    .directive("dmusiclibraryChordChoicesGrid", ["$timeout", 'dmusiclibraryChordGridService', function($timeout, chordGridService) {
        var link = function(scope, element, attrs, ctrls) {
            // Options for the underlying library we use for drag/drop/sorting
            var getChordChoicesFromScope = function(s) {
                return s.chordChoices;
            };
            scope.sortableOptions = chordGridService.getSortableOptions(scope,
                getChordChoicesFromScope,
                function(chord, chordElement, e) {
                    // Chord move start
                },
                function(chord, chordElement, e) {
                    // Chord clicked
                });

            scope.gridHelper = chordGridService.getGridHelper(scope);

            // We have to keep scope.chords different from scope.chordChoices so that we can
            // manipulate scope.chordChoices for sorting but also let the user change the chords
            // that we're handling in this grid
            scope.$watch(function() {
                return scope.chords;
            }, function() {
                scope.chordChoices = angular.copy(scope.chords, []);
            }, true);
        };

        var template = // This is where the chords available are shown
            "<div ui-sortable='sortableOptions' class='chord-choices-grid-container chord-grid-chords' ng-model='chordChoices'>" +
                "<div ng-repeat = 'chord in chordChoices' dmusiclibrary-chord-grid-chord chord='chord' grid-helper='gridHelper'></div>" +
                "</div>";
        return {
            restrict: "AE",
            scope: {
                chords: "=",
                chordGridOptions: "="
            },
            link: link,
            template: template
        };
    }])
    .directive("dmusiclibraryChordGrid", ["$timeout", 'dmusiclibraryChordGridService', function($timeout, chordGridService) {
        var link = function(scope, element, attrs, ctrls) {
            var $window = $(window);

            // When the progression changes (either chords or their units) or the window
            // is resized (for responsive) update the divisions inside to give the
            // appearance of a grid
            scope.$watch(function() {
                return scope.progression;
            }, function() {
                chordGridService.progression = scope.progression;
                setGridDivisions();
            }, true);

            $window.on("resize", setGridDivisions);

            function setGridDivisions() {
                //set Grid Divisions uses the chord's current height, so make sure it has already been rendered
                $timeout(function() {
                    scope.gridHelper.computeGridVars();
                    scope.gridHelper.setGridDivisions();
                }, 0);
            }

            // Options for the underlying library we use for drag/drop/sorting
            scope.sortableOptions = chordGridService.getSortableOptions(scope,
                function(s) {
                    return s.progression;
                },
                function(chord, chordElement, e) {
                    // Chord move start
                },
                function(chord, chordElement, e) {
                    // Chord clicked
                    // http://stackoverflow.com/questions/13506209/pass-data-using-jquery-trigger-event-to-a-change-event-handler
                    chordElement.trigger('click', [e]);
                });


            // This test element is placed in the DOM so that the user can define
            // .chord-width-test-element responsive CSS styles, and we can query
            // its properties in the JS code.
            $chordWidthTestEl = element.find('.chord-width-test-element');

            // This is a set of helper functions that will be used by chords
            // and chord-handles
            scope.gridHelper = chordGridService.getGridHelper(scope);
        };


        var template =
            // This is where the chords get dropped to create a progression
            "<div ui-sortable='sortableOptions' class='chord-grid-container progression' ng-model='progression'>" +
                "<div ng-repeat = 'chord in progression' dmusiclibrary-chord-grid-chord chord='chord' grid-helper='gridHelper' class='prog-chord'></div>" +
            "</div>" +
            "<div class='chord-width-test-element'></div>";


        return {
            restrict: "AE",
            scope: {
                progression: "=",
                chordGridOptions: "="
            },
            link: link,
            template: template
        };
    }])
    // Responsible for rendering a chord
    .directive("dmusiclibraryChordGridChord", ['dmusiclibraryChordGridService', 'dmusiclibraryMidiService', function(chordGridService, midiService) {
        var template =
            "<div class='chord-grid-chord' ng-context-menu=\"menuOptions\" ng-style='{ background : chord.color}'>" +
                "<div class='chord-name' ng-context-menu=\"menuOptions\">{{ chord.name }}</div>" +
                "<div dmusiclibrary-snap-to-grid config='config' ng-model='chord.units'>" +
                "<div class='chord-delete-button' ng-click='deleteMe()'>&times;</div>" +
                "<div class='chord-callback-button'>" +
                '<i class=\"fa fa-ellipsis-v black-icon-hover-grey dropdown-toggle\" ng-context-menu="menuOptions"></i>' +

                "</div>" +
                "</div>" +
                "</div>";

        var controller = ["$scope", "$element", "$attrs",
            function($scope, $element, $attrs) {
                var ctrl = this,
                    $window = $(window);

                // This config will be needed by the snap-to-grid directive,
                // which will run its link function BEFORE this directive's
                // link function, so put the config here (controller)
                // since controllers run before link functions.
                $scope.config = {
                    gridUnit: $scope.gridHelper.gridUnit,
                    snapThreshold: $scope.gridHelper.snapThreshold,
                    formatter: function(units) {
                        $scope.gridHelper.computeGridVars();

                        var chordNumOfQuarterNotes, newChordWidth;

                        if (units === undefined || units === null) {
                            units = $scope.chord.units = $scope.gridHelper.quarterNotesPerMeasure * $scope.gridHelper.unitsPerQuarterNote;
                        }

                        chordNumOfQuarterNotes = units / $scope.gridHelper.unitsPerQuarterNote;
                        newChordWidth = chordNumOfQuarterNotes * $scope.gridHelper.widthPerQuarterNote;

                        return newChordWidth;
                    },
                    parser: function(newChordWidth) {
                        $scope.gridHelper.computeGridVars();

                        var newUnits = $scope.gridHelper.getUnitsByWidth(newChordWidth);
                        return newUnits;
                    }
                };

                function resize() {
                    $element.width($scope.config.formatter($scope.chord.units));
                }

                $window.on("resize", resize);
            }
        ];

        var link = function(scope, element, attrs, ctrls) {
            chordGridService.registerMe(element, scope.chord);

            scope.deleteMe = function() {
                chordGridService.deleteMe(scope.chord);
            };

            scope.menuOptions = {
                onShow: function() {
                    scope.gridHelper.executeClickCallback(scope.chord);
                },
                items: []
            };

            scope.menuOptions.items.push(['<li>Play <i class="fa fa-volume-up"></i></a></li> ',
                function($itemScope) {
                    midiService.playChord(scope.chord);
                }
            ]);

            /*
             element.click(function(e) {
             // Element clicked
             scope.menuOptions.showMenu();
             });
             */

        };

        return {
            restrict: "AE",
            scope: {
                gridHelper: "=",
                chord: "="
            },
            controller: controller,
            replace: true,
            link: link,
            template: template
        };

    }])

// Allows resizing of parent element and does two-way data binding,
// converting sizes to units and vice versa using passed in 
// formatters and parsers.
    .directive("dmusiclibrarySnapToGrid", ["$rootScope", function($rootScope) {
        // All instances of this directive share these variables
        var $window = $(window),
            $htmlAndBody = $('html, body');

        var link = function(scope, element, attrs, ctrls) {
            var ngModelCtrl = ctrls[0],
                parent = element.parent();

            // (model to view)
            ngModelCtrl.$formatters.push(scope.config.formatter);

            // (view to model)
            ngModelCtrl.$parsers.push(scope.config.parser);

            element.on("mousedown touchstart", function(e) {
                setCursor();

                $window.on("mousemove touchmove", mouseMove);
                $window.on("mouseup touchend", mouseUp);

                // Prevent the drag/drop behavior from ui-sortable
                e.stopPropagation();
            });

            /*$window.on("resize", function() {
             debugger;
             ngModelCtrl.$render();
             });*/

            // Track the mouse move
            function mouseMove(e) {
                var oldWidth = getParentWidth(),
                    currentX,
                    newRelativePosition,
                    newWidth;

                if (isTouchEvent(e)) {
                    currentX = e.originalEvent.changedTouches[0].clientX;
                } else {
                    currentX = e.clientX;
                }

                //newRelativePosition = currentX - parent.position().left;
                newRelativePosition = currentX - parent.offset().left;
                newWidth = getSnappedWidth(newRelativePosition);

                if (newWidth > -1 && newWidth !== oldWidth) {


                    setParentWidth(newWidth);


                    // Update the model
                    $rootScope.$safeApply(function() {
                        ngModelCtrl.$setViewValue(newWidth);
                    });
                }
            }


            function getSnappedWidth(newRelativePosition) {
                var  ratio = newRelativePosition / scope.config.gridUnit,
                    nearestLeft = Math.floor(ratio) * scope.config.gridUnit,
                    nearestRight = Math.ceil(ratio) * scope.config.gridUnit,
                    percentFromLeft = newRelativePosition / nearestLeft,
                    percentFromRight = newRelativePosition / nearestRight;

                if (percentFromLeft <= (1 + scope.config.snapThreshold)) {
                    return nearestLeft;
                } else if (percentFromRight >= (1 - scope.config.snapThreshold)) {
                    return nearestRight;
                } else {
                    return -1;
                }
            }

            // This fires every time the ng-model value change
            ngModelCtrl.$render = function() {
                // The parser will have already converted the actual value to width
                var newWidth = ngModelCtrl.$viewValue;

                // element is the handle itself
                element.height(parent.height());

                setParentWidth(newWidth);
            };

            function isTouchEvent(e) {
                return e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches[0];
            }

            function setParentWidth(width) {
                parent.width(width);
            }

            function mouseUp(e) {
                removeCursor();

                $window.unbind("mousemove touchmove", mouseMove);
                $window.unbind("mouseup touchend", mouseUp);
            }

            function setCursor() {
                $htmlAndBody.addClass('col-resize');
            }

            function removeCursor() {
                $htmlAndBody.removeClass('col-resize');
            }

            function getParentWidth() {
                return parent.width();
            }
        };

        var template = "<div class='snap-to-grid-handle' ng-transclude></div>";

        return {
            restrict: "AE",
            // ngModel is used for two-way data-binding when the width
            // of the parent element is changed (snapped to the grid)
            require: ["ngModel"],
            scope: {
                config: "="
            },
            replace: true,
            transclude: true,
            link: link,
            template: template
        };
    }]);
