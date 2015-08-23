angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryBazzle', ['navigationService', 'communityService', 'dmusiclibraryNavigationService', function(navigationService, communityService, musicNavigationService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            templateUrl: '/sites/musiclibrary/app-templates/bazzle.html',
            scope: {
            },
            controller: ['$rootScope', '$scope', 'marketingService', 'commService', 'metaService', 'OPTIONS', 'dmusiclibraryBazzleService', 'dmusiclibraryInstrumentService', 'dmusiclibraryMidiService', '$location', '$routeParams', function($rootScope, $scope, marketingService, commService, metaService, OPTIONS, bazzleService, instrumentService, midiService, $location, $routeParams) {
                $scope.form = {
                    command: bazzleService.lastCommand ? bazzleService.lastCommand : 'Am7 to tab using frets 3 to 8'
                };

                $scope.execute = function() {
                    bazzleService.executeAndSetScopeResults($scope);
                };
                $scope.OPTIONS = OPTIONS;
                window.prerenderReady = false;

                var runController = function() {

                    $scope.form.command = bazzleService.lastCommand ? bazzleService.lastCommand : 'Am7 to tab using frets 3 to 8';
                    var routeCommand = musicNavigationService.getCommandFromRoute();
                    var routeInstrument = musicNavigationService.getInstrumentFromRoute();

                    $scope.showExamples = false;
                    $scope.results = null;
                    $scope.excludedFormulas = null;

                    // If no instrument was provided, get the one from the instrument service.
                    if(!routeInstrument) {
                        routeInstrument = JSON.stringify(instrumentService.instrument);
                    }

                    $scope.isInstrumentJson = instrumentService.isInstrumentJson(routeInstrument);


                    var commandExplicitlyProvided = true;


                    // Only indicate that we're not done with rendering
                    // if we're actually going to execute a command
                    if(routeCommand) {
                        routeCommand = routeCommand.replace(new RegExp('-', 'g'), ' ');
                        $scope.form.command = routeCommand;

                        window.prerenderReady = false;

                        // Let's update the meta Title and Description with
                        // the command since we're going to execute it.
                        var strings = routeCommand.split(' ');

                        // If an instrument name was provided, put it in the meta info
                        var instrumentName = '';
                        if(!$scope.isInstrumentJson) {
                            instrumentName = routeInstrument;
                        }
                        else {
                            instrumentName = instrumentService.getShortNameOfCurrentInstrument();
                        }

                        if(strings.length > 0) {
                            if(strings[strings.length - 1].toUpperCase() === 'TAB') {
                                strings[strings.length - 1] = 'Chord';
                                strings.push('Chart');
                            }
                        }

                        strings.push('-');
                        strings.push(instrumentName);

                        for(var i = 0; i < strings.length; i++) {
                            var str = strings[i];
                            if(str.length > 0)
                                strings[i] = str.charAt(0).toUpperCase() + str.slice(1);
                        }

                        var formattedCommand = strings.join(' ');
                        metaService.setTitle(formattedCommand + ' | Songwriting Search Engine - Bazzle');
                        metaService.setDescription("Songwriting Theory Search Engine results for: '" + formattedCommand + "'");
                    }
                    else {
                        // Otherwise, we're done rendering already
                        window.prerenderReady = true;
                    }




                    // If an instrument was provided as part of the
                    // /content/subject/instrument route then remove the instrument from the url
                    // or the /content/ route
                    // or if the instrument name was provided
                    if((!$scope.isInstrumentJson && !commandExplicitlyProvided)) {
                        navigationService.clearUrlParams();
                    }
                    // Otherwise, load the instrument from the url
                    // and put the instrument in the url but only if the instrument
                    // is json
                    else if($scope.isInstrumentJson) {

                    }


                    if(!$scope.isInstrumentJson) {
                        // Get the instrument from its name
                        commService.showWarningAlert('Your instrument is being changed to ' + routeInstrument + '.', {
                            onlyIfUnique: true
                        });

                        instrumentService.setInstrumentFromName(routeInstrument, function(result) {
                            // execute the bazzle command
                            $scope.execute();
                        }, function(result) {
                            // Failure loading instrument from name
                        });
                    }


                    if(routeCommand) {
                        $scope.form.command = routeCommand;
                        bazzleService.lastCommand = $scope.form.command;

                        // At the moment, only execute the command if the instrument
                        // is json and thus we already have it
                        // from the url (otherwise, we'll execute it when the instrument loads.
                        if($scope.isInstrumentJson) {
                            $scope.execute();
                        }
                    }
                };

                if(instrumentService.initialized) {
                    runController();
                }
                else {
                    $scope.$on('instrumentServiceInitialized', function(event, data) {
                        runController();
                    });
                }

                $scope.$on('$routeChangeSuccess', function(event, data) {
                    runController();
                });
            }],
            link: function(scope, elem, attrs) {
                scope.goToTools = function() {
                    navigationService.goToTool(communityService.community);
                };
            }
        };
    }])
    .directive('dmusiclibraryResultsPanel', [function() {
        return {
            restrict: 'AE',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<dmusiclibrary-selection-panel></dmusiclibrary-selection-panel>' +
                    '<a id="results"></a>' +
                    '<div ng-repeat="result in results">' +
                        '<dmusiclibrary-result-panel result="result" result-index="$index"></dmusiclibrary-result-panel>' +
                    '</div>' +
                '</div>',
            scope: {
                results: '='
            },
            link: function(scope, elem, attrs) {

            }
        };
    }])
    .directive('dmusiclibraryResultPanel', ['dmusiclibraryNavigationService', function(musicNavigationService) {
        return {
            restrict: 'AE',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<accordion >' +
                        '<accordion-group is-open="true" style="background-color: #f5f5f5">' +
                            '<accordion-heading style="background-color: #e3e3e3;">' +
                                '<div style="color: blue;">' +
                                '<span ng-show="!result.Title.Command">{{result.Title.Text}}</span>' +
                                '<span ng-show="result.Title.Command"><a ng-click="goToBazzle(result.Title.Command)" class="pointer">{{pane.Title.Text}}</a></span>' +
                                '<div ng-show="result.Panes != null && result.Panes.length > 0 && result.AllErrors" class="pull-right error-notification" ua-toggle-class="error-notification-initial,error-notification-highlighted-initial" interval="550"  max-cycles="2">{{result.Panes.length}}</div>' +
                                '<div ng-show="result.Panes != null && result.Panes.length > 0 && !result.AllErrors" class="pull-right notification" ua-toggle-class="notification-initial,notification-highlighted-initial" interval="550"  max-cycles="2">{{result.Panes.length}}</div>' +
                                '</div>' +
                            '</accordion-heading>' +

                            '<dmusiclibrary-doubt-panel result="result"></dmusiclibrary-doubt-panel>' +
                            '<div class="row">' +
                                '<dmusiclibrary-filters-panel result="result" result-index="resultIndex"></dmusiclibrary-filters-panel>' +
                            '</div>' +


                            '<div ng-repeat="row in result.rows" >' + // Adding class="row" to this row will ensure that the panes do not bunch up
                                '<div ng-repeat="smallPanel in row" ng-class="{' + "'col-sm-6'" + ' : (smallPanel.Size === ' + "'Large'" + '), ' + "'col-sm-3'" + ' : (smallPanel.Size === ' + "'Small'" + '), ' + "'col-sm-4'" + ' : (smallPanel.Size === ' + "'Medium'" + ')}">' +
                                    '<dmusiclibrary-command-small-panel result-index="resultIndex" small-panel="smallPanel" index="$index"></dmusiclibrary-command-small-panel>' +
                                '</div>' +
                            '</div>' +

                            '<div class="row" style="clear: both;">' +
                                '<dmusiclibrary-input-assumptions-panel result="result"></dmusiclibrary-input-assumptions-panel>' +
                                '<dmusiclibrary-parameter-assumptions-panel result="result"></dmusiclibrary-parameter-assumptions-panel>' +
                            '</div>' +

                        '</accordion-group>' +
                    '</accordion>' +
                '</div>',
            scope: {
                result: '=',
                resultIndex: '=',
                index: '='
            },
            link: function(scope, elem, attrs) {
                scope.goToBazzle = function(command) {
                    musicNavigationService.goToBazzle(command, null);
                };

            }
        };
    }])
    .directive('dmusiclibraryCommandSmallPanel', ['dmusiclibraryNavigationService', 'dmusiclibraryBazzleService', '$rootScope', function(musicNavigationService, bazzleService, $rootScope) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-show="showContents" style="text-align: center; position: relative;"  ng-class="{' + "'small-panel'" + ' : smallPanel.Success, ' + "'alert alert-danger'" + ' : !smallPanel.Success}" class="dropdown" dropdown>' +

                        '<a href ng-if="smallPanel.Success" class="dropdown-toggle pointer" dropdown-toggle ng-click="settingsClicked()"><i class="fa fa-ellipsis-v small-pane-settings"></i></a>' +

                        '<ul ng-if="smallPanel.Success" ng-show="options.showOptions" class="small-pane-settings-menu dropdown-menu">' +
                            '<li><a href="" ng-click="toggleSelectMultiple()" class="pointer">{{options.toggleSelectMultipleText}}</a></li>' +
                            '<li ng-show="options.isSelecting && textElementCommands" class="divider"></li>' +
                            '<li ng-if="options.isSelecting" ng-repeat="textElementCommand in textElementCommands"><a href="" ng-click="executeTextElementCommand(textElementCommand)" class="pointer">{{textElementCommand.text}}</a></li>' +
                            '<li ng-show="!options.isSelecting && smallPanel.Commands" class="divider"></li>' +
                            '<li ng-if="!options.isSelecting && smallPanel.Commands" ng-repeat="smallPanelCommand in smallPanel.Commands"><a href="" ng-click="executeSmallPanelCommand(smallPanelCommand)" class="pointer">{{smallPanelCommand.Text}}</a></li>' +
                            '<li class="divider"></li>' +
                            '<li ng-if="smallPanel.FilterableProperties" ng-repeat="filterableProperty in smallPanel.FilterableProperties"><a href="" ng-click="filterByFilterableProperty(filterableProperty)" class="pointer">Filter All By \'{{filterableProperty.FilterValue}}\'</a></li>' +
                            '<li ng-if="hasFilters"><a href="" ng-click="clearAllFilters()" class="pointer"><span class="glyphicon glyphicon-remove"></span> Clear All Filters</a></li>' +
                            '<li ng-if="hasFilters || smallPanel.FilterableProperties" class="divider"></li>' +

                            '<li><a href="" class="pointer">Help <span class="menu-explanation">(What\'s going on?)</span></a></li>' +
                        '</ul>' +

                    '<dmusiclibrary-text-element result-index="resultIndex" text-element="smallPanel.Content"></dmusiclibrary-text-element>' +
                '</div>',
            scope: {
                smallPanel: '=',
                index: '=',
                resultIndex: '='
            },
            link: function($scope, elem, attrs) {
                $scope.showContents = true;

                $scope.hasFilters = false;
                var result = bazzleService.results[$scope.resultIndex];
                if(result.Filters && result.Filters.length > 0) {
                    $scope.hasFilters = true;

                    var notifyFilterAppliedFromPanelSettings = function(filterName, filterValue) {
                        var eventData = {
                            filterName: filterName,
                            filterValue: filterValue,
                            resultIndex: $scope.resultIndex
                        };
                        $rootScope.$broadcast('filterAppliedFromPanelSettings', eventData);
                        $rootScope.$emit('filterAppliedFromPanelSettings', eventData);
                        navigationService.goToResults();
                    };

                    $scope.clearAllFilters = function() {
                        bazzleService.clearAllFilters($scope.resultIndex);

                        for(var i = 0; i < result.Filters.length; i++) {
                            var filter = result.Filters[i];
                            notifyFilterAppliedFromPanelSettings(filter.FilterName, null);
                        }
                    };

                    if($scope.smallPanel.FilterableProperties) {
                        $scope.filterByFilterableProperty = function(filterableProperty) {
                            notifyFilterAppliedFromPanelSettings(filterableProperty.FilterName, filterableProperty.FilterValue);
                        };

                    }
                }

                bazzleService.subscribeAndHandleFilters(
                    $scope.smallPanel.FilterableProperties,
                    $scope.resultIndex,
                    function() {
                        $scope.showContents = true;
                    },
                    function() {
                        $scope.showContents = false;
                    });

                $scope.options = {
                    showOptions: false,
                    isSelecting: false,
                    toggleSelectMultipleText: ''
                };
                $scope.goToBazzle = function(command) {
                    musicNavigationService.goToBazzle(command);
                };

                $scope.settingsClicked = function() {
                    $scope.options.showOptions = true;
                };

                $scope.toggleSelectMultiple = function() {
                    bazzleService.toggleSelecting();
                };

                $scope.executeSmallPanelCommand = function(smallPaneCommand) {
                    $scope.goToBazzle(smallPaneCommand.Command);
                };

                $scope.executeTextElementCommand = function(textElementCommand) {
                    return bazzleService.executeTextElementCommand(textElementCommand);
                };

                var setToggleSelectMultipleText = function() {
                    $scope.options.toggleSelectMultipleText = $scope.options.isSelecting ? 'Stop Selecting Multiple' : 'Select Multiple';
                };
                setToggleSelectMultipleText();

                if($scope.smallPanel.Success) {
                    bazzleService.registerTextElementCallback(function() {
                        $scope.options.isSelecting = bazzleService.selectionOptions.isSelecting;
                        setToggleSelectMultipleText();

                        if($scope.options.isSelecting)
                            $scope.textElementCommands = bazzleService.getTextElementCommandsForSelectedTextElement();
                    });
                }



            }
        };
    }])
    .directive('dmusiclibraryTextElementContent', ['RecursionHelper', function(RecursionHelper) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div ng-repeat="textElement in content">' +
                        '<dmusiclibrary-text-element result-index="resultIndex" text-element="textElement"></dmusiclibrary-text-element>' +
                    '</div>' +
                '</div>',
            scope: {
                content: '=',
                resultIndex: '='
            },
            compile: function(element) {
                // Use the compile function from the RecursionHelper,
                // And return the linking function(s) which it returns
                return RecursionHelper.compile(element);
            }
        };
    }])
    .directive('dmusiclibrarySelectionPanel', ['dmusiclibraryBazzleService', 'navigationService', function(bazzleService, navigationService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div id="selection-panel" class="panel panel-primary col-sm-12" ng-show="showPanel">' +
                    '<a id="selection-panel-anchor"></a>' +
                    '<div class="panel-heading">' +
                        '<h3 class="panel-title">Options for Current Selection</h3>' +
                    '</div>' +
                    '<div class="panel-body">' +

                    '<div ng-show="selectedTextElement">' +
                        '<div ng-show="textElementsText != \'\'" style="padding-bottom: 20px;">View <b>{{textElementsText}}</b></div>' +
                            '<button ng-repeat="textElementCommand in textElementCommands" ng-click="executeTextElementCommand(textElementCommand)" class="btn btn-success" style="margin-right: 20px;">{{textElementCommand.text}}</button>' +
                        '</div>' +
                        '<div ng-show="!selectedTextElement">' +
                            '<h3>Nothing has been selected yet.</h3>' +
                            '<h5>Check a few boxes below then come back here for more options.</h5>' +
                        '</div>' +

                        '<div style="margin-top: 20px;">' +
                            //'<button ng-show="selectedTextElement" ng-click="executeTextElementCommand()" class="btn btn-primary">{{selectedTextElement.Text}}</button>' +
                            '<button class="btn btn-danger pull-right" style="margin-left: 20px;" ng-click="clear()"><span class="glyphicon glyphicon-remove"></span> Stop Selecting Multiple</button>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {

            },
            link: function($scope, element, attrs) {

                $scope.showPanel = false;


                $scope.selectedTextElement = null;
                $scope.textElementsText = '';
                bazzleService.registerCallback(function() {

                    $scope.showPanel = bazzleService.selectionOptions.isSelecting;
                    if($scope.showPanel) {
                        $scope.selectedTextElement = bazzleService.getRootSelectedTextElement();
                        $scope.textElementsText = '';
                        if($scope.selectedTextElement) {

                            for(var i = 0; i < bazzleService.selectionOptions.selectedTextElements.length; i++) {
                                var textElement = bazzleService.selectionOptions.selectedTextElements[i];
                                $scope.textElementsText += '"' + bazzleService.getTextFromTextElement(textElement) + '"';
                                if(i + 1 < bazzleService.selectionOptions.selectedTextElements.length)
                                    $scope.textElementsText += ', ';
                            }
                        }

                        $scope.textElementCommands = bazzleService.getTextElementCommandsForSelectedTextElement();
                    }

                });

                $scope.clear = function() {
                    bazzleService.clearSelection();
                };

                $scope.executeTextElementCommand = function(textElementCommand) {
                    return bazzleService.executeTextElementCommand(textElementCommand);
                };

            }
        };
    }])
    .directive('dmusiclibraryTextElementText', ['RecursionHelper', 'dmusiclibraryNavigationService', 'dmusiclibraryBazzleService', function(RecursionHelper, musicNavigationService, bazzleService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<span ng-style="{' + "'font-weight'" + ': textElement.IsBold ? ' + "'bolder'" + ' : ' + "'normal'" + '}">' +
                    '<span ng-if="textElement.ObjectType!==\'Text\'">' +
                    '<dmusiclibrary-chord-chart ng-if="textElement.ObjectType===\'TabChart\'" chord-chart="textElement.Object"></dmusiclibrary-chord-chart>'+
                    '<dmusiclibrary-tab-staff ng-if="textElement.ObjectType===\'TabStaff\'" tab-staff="textElement.Object"></dmusiclibrary-tab-staff>'+
                    '<dmusiclibrary-bazzle-staff-result ng-if="textElement.ObjectType===\'Staff\'" staff="textElement.Object"></dmusiclibrary-bazzle-staff-result>'+
                    '<dmusiclibrary-text-element-html ng-if="textElement.ObjectType===' + "'Html'" + '" html-string="textElement.Object"></dmusiclibrary-text-element-html>'+
                    '</span>' +
                    '<span ng-if="textExists">' +
                    '<input ng-if="options.isSelectable" ng-show="options.isSelecting" ng-model="options.isSelected" type="checkbox" ng-change="checkBoxChecked(options)" />' +
                    '<span ng-if="commandExists">' +
                    '<a ng-show="(options.isSelecting && options.isSelectable) || !options.isSelecting" ng-click="click()" class="pointer" style="color: ' + '{{textElement.Color == null ? ' + "'#428bca'" + ' : ' + "textElement.Color" + '}};">{{textElement.Text}}</a>' +
                    '<span ng-show="(options.isSelecting && !options.isSelectable)" style="opacity:.5;">{{textElement.Text}}</span>' +
                    '</span>' +
                    '<span ng-if="!commandExists">' +
                    // No command present
                    '<a ng-show="options.isSelecting && options.isSelectable" ng-click="click()" class="pointer">{{textElement.Text}}</a>' +
                    '<span ng-show="!options.isSelecting || !options.isSelectable" ng-click="click()" style="color: ' + '{{textElement.Color == null ? ' + "'black'" + ' : ' + "textElement.Color" + '}};">{{textElement.Text}}</span>' +
                    '</span>'+
                    '</span>' +

                    '<span ng-if="textElement.Midi"><dmusiclibrary-midi-sound midi-sound="textElement.Midi"></dmusiclibrary-midi-sound></span>' +
                '</span>',
            scope: {
                textElement: '=',
                resultIndex: '='
            },
            compile: function(tElement, tAttrs, transclude) {
                return RecursionHelper.compile(tElement,
                    // Linking function
                    function($scope, iElement, iAttrs, controller) {

                        $scope.options = {
                            isSelectable: false,
                            isSelected: false,
                            isSelecting: false
                        };
                        var setIsSelectable = function() {
                            $scope.options.isSelectable = bazzleService.isTextElementSelectable($scope.textElement);
                        };
                        setIsSelectable();

                        $scope.commandExists = angular.isDefined($scope.textElement.Command) && $scope.textElement.Command !== null;
                        $scope.textExists = angular.isDefined($scope.textElement.Text) && $scope.textElement.Text !== null;


                        var setSelected = function(selected) {
                            if($scope.options.isSelected !== selected) {
                                $scope.options.isSelected = selected;
                                selectedChanged();
                            }
                        };

                        $scope.bazzleService = bazzleService;
                        $scope.isSelecting = bazzleService.selectionOptions.isSelecting;
                        if($scope.textElement.ElementType !== 'Other') {

                            // If this is an 'Other' ElementType then it will never be selectable.
                            bazzleService.registerTextElementCallback(function() {
                                // hide/show checkbox if necessary
                                $scope.options.isSelecting = bazzleService.selectionOptions.isSelecting;
                                setIsSelectable();

                                if(!$scope.options.isSelecting)
                                    setSelected(false);
                            });
                        }
                        else if($scope.commandExists) {
                            // 'Other' TextElements that have commands
                            // should just watch for whether the fact that we're
                            // selecting has changed (so that they can appear unselectable when necessary).
                            bazzleService.registerTextElementCallback(function() {
                                $scope.options.isSelecting = bazzleService.selectionOptions.isSelecting;
                                if(!$scope.options.isSelecting)
                                    setSelected(false);
                            });
                        }

                        var selectedChanged = function() {
                            if($scope.options.isSelected) {
                                // select the element
                                bazzleService.selectTextElement($scope.textElement);
                            }
                            else {
                                // unselect the element
                                bazzleService.unselectTextElement($scope.textElement);
                            }
                        };

                        $scope.checkBoxChecked = function(isChecked) {
                            selectedChanged();
                        };

                        $scope.click = function() {
                            if($scope.options.isSelecting && $scope.options.isSelectable) {
                                setSelected(!$scope.options.isSelected);
                            }
                            else {
                                if($scope.commandExists) {
                                    musicNavigationService.goToBazzle($scope.textElement.Command, null);
                                }
                                else {
                                    // don't do anything
                                }
                            }
                        };
                    });

            }
        };
    }])
    .directive('dmusiclibraryTextElementHtml', ['$compile', function($compile) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<span>' +
                    '</span>',
            scope: {
                htmlString: '='
            },
            link: function($scope, element, attrs) {
                var el = $compile('<span>' + $scope.htmlString + '</span>')($scope);
                element.append( el );
            }
        };
    }])
    .directive('dmusiclibraryBazzleStaffResult', ['uiService', 'dmusiclibraryBazzleService', 'dmusiclibraryNotationService', function(uiService, bazzleService, notationService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div class="staffContainer" style="margin: auto;">' +
                    '<div class="staff"></div>' +
                    '<canvas class="staffCanvas" style="display:none;"></canvas>' +
                    '<img class="staffImage" alt="Staff">' +
                '</div>',
            scope: {
                staff: '='
            },
            link: function($scope, element, attrs) {
                var staff = $scope.staff;


                var staffContainer = $(element);
                var containerParent = staffContainer.closest('.small-panel');
                var staffSvgCanvasContainer = staffContainer.find('.staff');
                var staffCanvas = staffContainer.find('.staffCanvas');
                var staffImage = staffContainer.find('.staffImage');
                var staffImageElement = staffImage[0];

                // Get the width of the staff
                var renderer = notationService.renderStaff(staff.Staff, staff.Report, staffSvgCanvasContainer);


                var chartWidth = notationService.getStaffWidthFromRenderer(renderer) + 20;

                if(chartWidth > containerParent.width())
                    chartWidth = containerParent.width();

                staffContainer.width(chartWidth);



                canvg(staffCanvas[0], staffSvgCanvasContainer.html());
                var dataUrl = staffCanvas[0].toDataURL();
                staffImageElement.src = dataUrl;



                if(staff.Report.MeasureText.length > 0) {
                    var measureText = staff.Report.MeasureText[0];
                    staffImageElement.alt = measureText.Text + ' Chord Notation';
                }
                staffSvgCanvasContainer.hide();

            }
        };
    }])
    .directive('dmusiclibraryTabStaff', ['uiService', 'dmusiclibraryInstrumentService', 'dmusiclibraryBazzleService', function(uiService, instrumentService, bazzleService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div class="tabStaffContainer" style="margin: auto;">' +
                    '<canvas class="tabStaff" style="display:none;"></canvas>' +
                    '<img class="tabStaffImage" alt="Tab Staff">' +
                '</div>',
            scope: {
                tabStaff: '='
            },
            link: function($scope, element, attrs) {
                var tab = $scope.tabStaff;

                var stringNotes = [];
                for(var i = 0; i < tab.StringNoteNames.length; i++) {
                    stringNotes.push(tab.StringNoteNames[i].Name);
                }
                var stringCount = stringNotes.length;


                var notes = [];
                var anyModifiers = false;
                for(i = 0; i < tab.Chords.length; i++) {
                    var chord = tab.Chords[i];

                    var positions = [];
                    for(j = 0; j < chord.Notes.length; j++) {
                        note = chord.Notes[j];
                        positions.push({str: stringCount - (note.StringIndex), fret: note.FretIndex});
                    }

                    var tabNote = new Vex.Flow.TabNote({
                        positions: positions,
                        duration: chord.Duration.Numeric == 1 ? "w" : chord.Duration.Numeric == 2 ? "h" : "q"});

                    // Now add the modifiers to the tab
                    for(var j = 0; j < chord.Notes.length; j++) {
                        var note = chord.Notes[j];
                        if(note.Vibrato !== 'None') {
                            anyModifiers = true;
                            var vibrato = new Vex.Flow.Vibrato();
                            if(note.Vibrato === 'Harsh') {
                                vibrato = vibrato.setHarsh(true).setVibratoWidth(70);
                            }
                            else {
                                vibrato = vibrato.setVibratoWidth(35);
                            }
                            tabNote = tabNote.
                                addModifier(vibrato, j);
                        }
                        if(note.Bend !== 'None') {
                            anyModifiers = true;
                            var bend = new Vex.Flow.Bend(note.Bend === 'Full' ? "Full" : "Half");
                            tabNote = tabNote.
                                addModifier(bend, j);
                        }
                    }

                    notes.push(tabNote);
                }

                var tabContainer = $(element);
                var containerParent = tabContainer.closest('.small-panel');
                var tabCanvas = tabContainer.find('.tabStaff');
                var tabStaffImage = tabContainer.find('.tabStaffImage');
                var tabStaffImageElement = tabStaffImage[0];

                var spacing_between_lines_px = 13;
                var space_above_staff_ln =  anyModifiers ? 2 : 1; /*this space is measured in additional lines that are not rendered*/
                var chartHeight = (stringNotes.length + space_above_staff_ln) * spacing_between_lines_px;//tab.FretCount * 27;
                var chartWidth = tab.Chords.length * 29;//100;

                var maxWidth = containerParent.width();
                if(chartWidth > maxWidth)
                    chartWidth = maxWidth;


                tabContainer.height(chartHeight);
                tabContainer.width(chartWidth);


                var renderer = new Vex.Flow.Renderer(tabCanvas[0],
                    Vex.Flow.Renderer.Backends.CANVAS);

                var canvasContext = renderer.getContext();

                canvasContext = uiService.createHiDefContext(chartWidth, chartHeight, null, tabCanvas[0], canvasContext, tabStaffImageElement);


                canvasContext.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

                // Create and draw the tablature stave
                var tabstave = new Vex.Flow.TabStave(/*x*/0, /*y*/0, /*width*/chartWidth, {
                    spacing_between_lines_px: 13,
                    num_lines: stringNotes.length,
                    space_above_staff_ln: space_above_staff_ln
                });
                tabstave.addTabGlyph();
                tabstave.setContext(canvasContext).draw();






                Vex.Flow.Formatter.FormatAndDraw(canvasContext, tabstave, notes);



                var canvas = canvasContext.canvas;
                var dataUrl = canvas.toDataURL();

                tabStaffImageElement.src = dataUrl;
                var altString = instrumentService.getShortNameOfCurrentInstrument();
                if(bazzleService.lastCommand) {
                    altString += ' - ' + bazzleService.lastCommand;
                }

                tabStaffImageElement.alt = altString;

            }
        };
    }])
    .directive('dmusiclibraryTextElement', ['RecursionHelper', 'dmusiclibraryBazzleService', function(RecursionHelper, bazzleService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<span ng-show="showContents">' +
                    '<div ng-if="textElement && textElement.TextType === ' + "'Div'" + '" ng-style="{' + "'padding-top'" + ': {{textElement.PaddingTop}}, ' + "'margin-top'" + ': {{textElement.MarginTop}}, ' + "'padding-bottom'" + ': {{textElement.PaddingBottom}}};">' +
                    '<dmusiclibrary-text-element-text result-index="resultIndex" text-element="textElement"></dmusiclibrary-text-element-text>' +
                    '<dmusiclibrary-text-element-content result-index="resultIndex" content="textElement.Content"></dmusiclibrary-text-element-content>' +
                    '</div>' +
                    '<h3 ng-if="textElement && textElement.TextType === ' + "'H3'" + '" ng-style="{' + "'padding-top'" + ': {{textElement.PaddingTop}}, ' + "'margin-top'" + ': {{textElement.MarginTop}}, ' + "'padding-bottom'" + ': {{textElement.PaddingBottom}}};" >' +
                    '<dmusiclibrary-text-element-text result-index="resultIndex" text-element="textElement"></dmusiclibrary-text-element-text>' +
                    '<dmusiclibrary-text-element-content result-index="resultIndex" content="textElement.Content"></dmusiclibrary-text-element-content>' +
                    '</h3>' +
                    '<h6 ng-if="textElement && textElement.TextType === ' + "'H6'" + '" ng-style="{' + "'padding-top'" + ': {{textElement.PaddingTop}}, ' + "'margin-top'" + ': {{textElement.MarginTop}}, ' + "'padding-bottom'" + ': {{textElement.PaddingBottom}}};">' +
                    '<dmusiclibrary-text-element-text result-index="resultIndex" text-element="textElement"></dmusiclibrary-text-element-text>' +
                    '<dmusiclibrary-text-element-content result-index="resultIndex" content="textElement.Content"></dmusiclibrary-text-element-content>' +
                    '</h6>' +

                    '</span>',
            scope: {
                textElement: '=',
                resultIndex: '='
            },
            compile: function(tElement, tAttrs, transclude) {
                // Use the compile function from the RecursionHelper,
                // And return the linking function(s) which it returns
                return RecursionHelper.compile(tElement,
                    // Linking function
                    function($scope, iElement, iAttrs, controller) {
                        $scope.showContents = true;
                        bazzleService.subscribeAndHandleFilters(
                            $scope.textElement.FilterableProperties,
                            $scope.resultIndex,
                            function() {
                                $scope.showContents = true;
                            },
                            function() {
                                $scope.showContents = false;
                            });


                    });
            }
        };
    }])
    .directive('dmusiclibraryBazzleFilter', ['dmusiclibraryBazzleService', '$rootScope', function(bazzleService, $rootScope) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    'Filter By: <label>{{filter.DisplayText}}</label>' +
                    '<select class="form-control" ng-model="filterValue" ng-options="filterValue for filterValue in filter.FilterValues" ng-change="filterValueChanged()">' +
                    '<option value="">No Filter</option>' +
                    '</select>' +
                    '</div>',
            scope: {
                filter: '=',
                resultIndex: '='
            },
            link: function($scope, elem, attrs) {
                $scope.filterValueChanged = function() {
                    bazzleService.applyFilter($scope.filter, $scope.filterValue, $scope.resultIndex);
                };

                $scope.$on('filterAppliedFromPanelSettings', function(event, data) {
                    if(data.resultIndex === $scope.resultIndex) {
                        if(data.filterName == $scope.filter.FilterName) {
                            var filterValue = data.filterValue;
                            $scope.filterValue = filterValue;
                            $scope.filterValueChanged();
                        }
                    }

                });

            }
        };
    }])
    .directive('dmusiclibraryFiltersPanel', function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div ng-show="result && result.Filters">' +
                    '<accordion>' +
                        '<accordion-group heading="Filters" is-open="true">' +
                            '<accordion-heading style="background-color: #e3e3e3;">' +
                                '<div>' +
                                    'Filters' +
                                '</div>' +
                            '</accordion-heading>' +

                            '<div class="row">' +
                                '<div class="col-xs-4" ng-repeat="filter in result.Filters">' +
                                    '<dmusiclibrary-bazzle-filter result-index="resultIndex" filter="filter"></dmusiclibrary-bazzle-filter>' +
                                '</div>' +
                            '</div>' +
                        '</accordion-group>' +
                    '</accordion>' +
                '</div>',
            scope: {
                result: '=',
                resultIndex: '='
            },
            link: function(scope, elem, attrs) {


            }
        };
    })
    .directive('dmusiclibraryInputAssumptionsPanel', function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div  ng-show="result && result.ElementAssumptions">' +
                    '<accordion>' +
                        '<accordion-group heading="Input Assumptions" is-open="false">' +
                            '<accordion-heading style="background-color: #e3e3e3;">' +
                                '<div>' +
                                    'Input Assumptions' +
                                    '<div class="pull-right" ng-show="result.ElementAssumptions && result.ElementAssumptions.length > 0">{{result.ElementAssumptions.length}}</div>' +
                                '</div>' +
                            '</accordion-heading>' +

                            '<div class="row">' +
                                '<ul style="text-align: left;">' +
                                    '<li ng-repeat="assumption in result.ElementAssumptions" tooltip-placement="bottom">{{assumption.Text}}</li>' +
                                '</ul>' +
                            '</div>' +
                        '</accordion-group>' +
                    '</accordion>' +
                '</div>',
            scope: {
                result: '='
            },
            link: function(scope, elem, attrs) {


            }
        };
    })
    .directive('dmusiclibraryParameterAssumptionsPanel', function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:

                '<div  ng-show="result">' +
                    '<accordion>' +
                        '<accordion-group heading="Explanation and Assumptions" is-open="false">' +
                            '<accordion-heading style="background-color: #e3e3e3;">' +
                                '<div>' +
                                    'Explanation and Parameter Assumptions' +
                                    '<div class="pull-right" ng-show="result.ParameterAssumptions && result.ParameterAssumptions.length > 0">{{result.ParameterAssumptions.length}}</div>' +
                                '</div>' +
                            '</accordion-heading>' +

                            '<div style="margin-left: 20px;">' +
                                '<div ng-if="result.ExecutionExplanation" class="row" style="margin-bottom: 10px;">' +
                                    '<div style="text-align: left;">' +
                                        '<span style="font-weight: bolder;">Explanation</span>: {{result.ExecutionExplanation}}' +
                                    '</div>' +
                                '</div>' +
                                '<div ng-if="result.Formula" class="row" style="margin-bottom: 10px;">' +
                                    '<div style="text-align: left;">' +
                                        '<span style="font-weight: bolder;">Formula</span>: {{result.Formula}}' +
                                    '</div>' +
                                '</div>' +
                                '<div class="row" ng-show="result.ParameterAssumptions">' +
                                    '<ul style="text-align: left;">' +
                                        '<li ng-repeat="assumption in result.ParameterAssumptions" tooltip="{{assumption.ToolTip}}" tooltip-placement="bottom">{{assumption.Text}}</li>' +
                                    '</ul>' +
                                '</div>' +
                            '</div>' +
                        '</accordion-group>' +
                    '</accordion>' +
                '</div>',
            scope: {
                result: '='
            },
            link: function(scope, elem, attrs) {


            }
        };
    })
    .directive('dmusiclibraryDoubtPanel', function() {
        return {
            restrict: 'AE',
            replace: 'true',
            transclude: true,
            template:

                '<div  ng-show="result && result.Doubts">' +
                    '<accordion>' +
                        '<accordion-group heading="Doubts" is-open="true">' +
                            '<accordion-heading style="background-color: #e3e3e3;">' +
                                '<div>' +
                                    'Doubts' +
                                    '<div class="pull-right error-notification" ng-show="result.Doubts && result.Doubts.length > 0" ua-toggle-class="error-notification-initial,error-notification-highlighted-initial" interval="550"  max-cycles="2">{{result.Doubts.length}}</div>' +
                                '</div>' +
                            '</accordion-heading>' +

                            '<div class="row">' +
                                '<ul style="text-align: left;">' +
                                    '<li ng-repeat="doubt in result.Doubts" tooltip-placement="bottom">{{doubt}}</li>' +
                                '</ul>' +
                            '</div>' +
                        '</accordion-group>' +
                    '</accordion>' +
                '</div>',
            scope: {
                result: '='
            },
            link: function(scope, elem, attrs) {


            }
        };
    })
    .directive('dmusiclibraryTool', function() {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div class="row">' +
                    '<div class="form-group col-sm-offset-3 col-sm-6">' +
                    '<div style="text-align: left;">{{explanation}}</div>' +
                    '<textarea type="text" class="form-control" ng-model="options.input"></textarea>' +
                    '<dmusiclibrary-edit-instrument-link></dmusiclibrary-edit-instrument-link>' +
                    '<button type="submit" class="btn btn-primary go-button" ng-click="execute()">Go!</button>' +
                    '<div>' +
                    '<img ng-show="showLoading" src="images/ajax-loader.gif" alt="Please Wait...">' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<dmusiclibrary-results-panel results="results"></dmusiclibrary-results-panel>' +
                '</div>',
            scope: {
                options: '=',
                input: '=',
                results: '=',
                command: '=',
                execute: '=',
                instrument: '=',
                showLoading: '='
            },
            link: function(scope, elem, attrs) {
                scope.explanation = attrs.explanation;

            }
        };
    });