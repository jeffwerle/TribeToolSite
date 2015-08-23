angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryBazzleService', ['$rootScope', '$timeout', '$route', 'commService', 'homeService', 'dmusiclibraryInstrumentService', 'navigationService', 'OPTIONS', 'dmusiclibraryVirtualCowriterService', 'dmusiclibraryCommService', 'dmusiclibraryNavigationService', function($rootScope, $timeout, $route, commService, homeService, instrumentService, navigationService, OPTIONS, virtualCowriterService, musicCommService, musicNavigationService) {
        return {
            observerCallbacks: {
                global: [],
                textElements: []
            },
            registerCallback: function(callback) {
                this.observerCallbacks.global.push(callback);
            },
            registerTextElementCallback: function(callback) {
                this.observerCallbacks.textElements.push(callback);
            },
            notifyGlobalObservers: function() {
                for(var i = 0; i < this.observerCallbacks.global.length; i++) {
                    this.observerCallbacks.global[i]();
                }
            },
            notifyTextElementObservers: function() {
                for(var i = 0; i < this.observerCallbacks.textElements.length; i++) {
                    this.observerCallbacks.textElements[i]();
                }
            },
            raiseSelectionChanged: function() {
                this.notifyGlobalObservers();
                this.notifyTextElementObservers();
            },
            selectionOptions: {
                selectedTextElements: [],
                isSelecting: false
            },
            onSelecting: function() {
                // how selection panel
                this.raiseSelectionChanged();
            },
            onNotSelecting: function() {
                // Hide selection panel
                this.raiseSelectionChanged();
            },
            clearSelection: function() {
                this.selectionOptions.isSelecting = false;
                this.selectionOptions.selectedTextElements = [];
                this.onNotSelecting();
            },
            prepareForNewCommandResults: function() {

                this.selectionOptions.isSelecting = false;
                this.selectionOptions.selectedTextElements = [];
                // There are no longer any text element callbacks
                this.observerCallbacks.textElements = [];
                this.raiseSelectionChanged();
            },
            toggleSelecting: function() {
                if(this.selectionOptions.isSelecting) {
                    this.stopSelecting();
                }
                else {
                    this.beginSelecting();
                }
            },
            beginSelecting: function() {
                if(this.observerCallbacks.textElements.length <= 0) {
                    // Something went wrong and there are no callbacks but there are obviously text elements
                    // (or else this wouldn't have been called). Refresh the route
                    $route.reload();
                }

                this.selectionOptions.isSelecting = true;
                this.onSelecting();
            },
            stopSelecting: function() {
                this.clearSelection();
            },
            selectTextElement: function(textElement) {
                this.selectionOptions.isSelecting = true;
                this.selectionOptions.selectedTextElements.push(textElement);

                this.notifyGlobalObservers();
                this.notifyTextElementObservers();
            },
            unselectTextElement: function(textElement, manuallySelected) {
                var indexInArray = -1;
                for(var i = 0; i < this.selectionOptions.selectedTextElements.length; i++) {
                    if(this.selectionOptions.selectedTextElements[i] === textElement) {
                        indexInArray = i;
                        break;
                    }
                }
                if(indexInArray >= 0) {
                    // The element exists in the array so remove it
                    this.selectionOptions.selectedTextElements.splice(indexInArray, 1);
                }

                this.onSelecting();
            },
            executeTextElementCommand: function(textElementCommand) {

                var command = '';
                if(!textElementCommand) {
                    var selectedTextElement = this.getRootSelectedTextElement();
                    command = this.getTextFromTextElement(selectedTextElement);
                }
                else {
                    for(var i = 0; i < this.selectionOptions.selectedTextElements.length; i++) {
                        var textElement = this.selectionOptions.selectedTextElements[i];
                        var text = this.getTextFromTextElement(textElement);
                        command += text + (i + 1 < this.selectionOptions.selectedTextElements.length ? ', ' : '');
                    }
                    if(textElementCommand.type === 'Convert') {
                        if(textElementCommand.target !== 'ChordProgression') {
                            command += ' as ' + textElementCommand.target;
                        }
                    }
                }

                musicNavigationService.goToBazzle(command);
            },
            getTextElementCommandsForSelectedTextElement: function() {
                var selectedTextElement = this.getRootSelectedTextElement();
                if(!selectedTextElement)
                    return [];

                var convertibleToChordProgression = this.isTextElementConvertibleToChordProgression(selectedTextElement);
                var convertibleToChord = this.isTextElementConvertibleToChord(selectedTextElement);
                var convertibleToScale = this.isTextElementConvertibleToScale(selectedTextElement);
                var convertibleToTab = this.isTextElementConvertibleToTab(selectedTextElement);

                var commands = [];
                if(convertibleToChord) {
                    commands.push({
                        text: 'As Chord(s)',
                        type: 'Convert',
                        target: 'Chord'
                    });
                }
                if(convertibleToChordProgression) {
                    commands.push({
                        text: 'As Chord Progression',
                        type: 'Convert',
                        target: 'ChordProgression'
                    });
                }
                if(convertibleToScale) {
                    commands.push({
                        text: 'As Scale(s)',
                        type: 'Convert',
                        target: 'Scale'
                    });
                }
                if(convertibleToTab) {
                    commands.push({
                        text: 'Get Chord Charts',
                        type: 'Convert',
                        target: 'Tab'
                    });
                }

                return commands;
            },
            getTextFromTextElement: function(textElement) {
                if(textElement.ObjectType==='Text' &&
                    angular.isDefined(textElement.Object) &&
                    textElement.Object !== null &&
                    typeof textElement.Object==='string') {
                    return textElement.Object.toString();
                }
                else {
                    return textElement.Text;
                }
            },
            getRootSelectedTextElement: function() {
                return this.selectionOptions.selectedTextElements.length <= 0 ? null : this.selectionOptions.selectedTextElements[0];
            },
            isTextElementConvertibleToChordProgression: function(textElement) {
                return this.isTextElementConvertibleToChord(textElement);
            },
            isTextElementConvertibleToChord: function(textElement) {
                return textElement.ElementType==='ChordAsSeriesOfNotes' ||
                    textElement.ElementType==='ChordName'||
                    textElement.ElementType==='Chord'||
                    textElement.ElementType==='ScaleAsSeriesOfNotes'||
                    textElement.ElementType==='Tab'||
                    textElement.ElementType==='ChordProgression'||
                    textElement.ElementType==='NoteNumberNameProgression' ||
                    textElement.ElementType==='ChordNameElement'||
                    textElement.ElementType==='ChordNameElementProgression';
            },
            isTextElementConvertibleToScale: function(textElement) {
                return textElement.ElementType==='ChordAsSeriesOfNotes' ||
                    textElement.ElementType==='ChordName'||
                    textElement.ElementType==='Chord'||
                    textElement.ElementType==='ChordNameElement'||
                    textElement.ElementType==='Chord'||
                    textElement.ElementType==='ScaleAsSeriesOfNotes'||
                    textElement.ElementType==='Scale'||
                    textElement.ElementType==='ScaleDefinition'||
                    textElement.ElementType==='NoteNumberNameProgression';
            },
            isTextElementConvertibleToTab: function(textElement) {
                return textElement.ElementType==='Tab' ||
                    textElement.ElementType==='TabProgression' ||
                    textElement.ElementType==='ChordAsSeriesOfNotes' ||
                    textElement.ElementType==='ChordName'||
                    textElement.ElementType==='Chord'||
                    textElement.ElementType==='ChordNameElement'||
                    textElement.ElementType==='Chord'||
                    textElement.ElementType==='ScaleAsSeriesOfNotes' ||
                    textElement.ElementType==='ChordNameElementProgression' ||
                    textElement.ElementType==='ChordProgression';
            },
            isTextElementSelectable: function(textElement) {
                if(textElement.ElementType==='Other') {
                    return false;
                }

                var selectedTextElement = this.getRootSelectedTextElement();
                if(!selectedTextElement) {
                    return true;
                }

                var convertibleToChord = this.isTextElementConvertibleToChord(textElement);
                var convertibleToScale = this.isTextElementConvertibleToScale(textElement);

                if(selectedTextElement.ElementType === 'Chord' ||
                    selectedTextElement.ElementType === 'ChordName' ||
                    selectedTextElement.ElementType === 'ChordAsSeriesOfNotes' ||
                    selectedTextElement.ElementType === 'ChordNameElement') {
                    // The element in question must be a Chord or something convertible to a Chord
                    return convertibleToChord;
                }
                if(selectedTextElement.ElementType === 'ChordProgression' ||
                    selectedTextElement.ElementType === 'ChordNameElementProgression') {
                    // The element in question must be a Chord Progression or something convertible to a Chord Progression
                    return convertibleToChord;
                }
                else if(selectedTextElement.ElementType === 'NoteNumberNameProgression') {
                    // The element in question must be convertible to a Chord or a Scale
                    return convertibleToChord || convertibleToScale;
                }
                else if(selectedTextElement.ElementType === 'Scale' ||
                    selectedTextElement.ElementType==='ScaleDefinition'||
                    selectedTextElement.ElementType === 'ScaleAsSeriesOfNotes') {
                    // The element in question must be convertible to a Chord or a Scale
                    return convertibleToScale;
                }
                else if(selectedTextElement.ElementType === 'Tab' ||
                    selectedTextElement.ElementType === 'TabProgression') {
                    // The element in question must be convertible to Tab
                    return this.isTextElementConvertibleToTab(textElement);
                }
                else if(selectedTextElement.ElementType === 'ChordSymbol') {
                    // The element in question must be convertible to a Chord Symbol
                    return textElement.ElementType === 'ChordSymbol';
                }
                else if(selectedTextElement.ElementType === 'Instrument') {
                    // The element in question must be convertible to an Instrument
                    return textElement.ElementType === 'Instrument';
                }

                return false;
            },
            /* The last command that was run */
            lastCommand: null,
            /* The results that are currently rendered. Result-specific callbacks and filters
             * will be stored in this array. */
            results: null,
            clearAllFilters: function(resultIndex) {
                var result = this.results[resultIndex];
                if(result.filters) {
                    for(var j = 0; j < result.filters.length; j++) {
                        var filter = result.filters[j];
                        filter.currentValue = null;
                        this.raiseResultEvent(resultIndex);
                    }
                }
            },
            subscribeAndHandleFilters: function(filterableProperties, resultIndex, onshowContents, onHideContents) {
                if(filterableProperties &&
                    filterableProperties.length > 0) {

                    var my = this;
                    this.subscribeToResultEvents(resultIndex, function() {
                        onshowContents();

                        var showContents = true;
                        // A filter was applied or unapplied
                        var filters = my.getFilters(resultIndex);
                        if(filters) {
                            for(var i = 0; i < filters.length; i++) {
                                var filter = filters[i];
                                if(filter.currentValue === null ||
                                    filter.currentValue === '') {
                                    continue;
                                }

                                // Is this filter applicable for any of the filterable
                                // properties?
                                for(var j = 0; j < filterableProperties.length; j++) {
                                    var filterableProperty = filterableProperties[j];

                                    // Is the filter applicable to the filterable property?
                                    if(filterableProperty.FilterName === filter.FilterName) {
                                        // The filter is applicable to the filterable property. Should
                                        // this text element be shown?
                                        if(filterableProperty.FilterValue !== filter.currentValue) {
                                            // The filter is applicable and is filtering out this content
                                            onHideContents();
                                            showContents = false;
                                        }
                                    }
                                }

                                if(!showContents)
                                    break;
                            }
                        }
                    });
                }
            },
            raiseResultEvent: function(resultIndex) {
                var result = this.results[resultIndex];
                if(result.observerCallbacks) {
                    for(var i = 0; i < result.observerCallbacks.length; i++) {
                        result.observerCallbacks[i]();
                    }
                }
            },
            subscribeToResultEvents: function(resultIndex, callback) {
                var result = this.results[resultIndex];
                if(!result.observerCallbacks) {
                    result.observerCallbacks = [];
                }

                result.observerCallbacks.push(callback);
            },
            getFilters: function(resultIndex) {
                var result = this.results[resultIndex];
                return result.filters;
            },
            applyFilter: function(filter, filterValue, resultIndex) {
                var result = this.results[resultIndex];
                if(!result.filters) {
                    result.filters = [];
                }

                filter.currentValue = filterValue;
                result.filters.push(filter);
                this.raiseResultEvent(resultIndex);

            },
            setScopeResults: function($scope, data, onSuccess) {

                $scope.showLoading = true;
                navigationService.goToTop();

                var my = this;

                my.prepareForNewCommandResults();

                $scope.results = data.Results;
                my.results = $scope.results;
                $scope.excludedFormulas = data.ExcludedFormulas;

                if(onSuccess)
                    onSuccess();

                // Go to the results after the DOM is finished rendering
                $timeout(function() {
                    // Make sure the scope is still valid by having its parent
                    if($scope.$parent) {
                        $scope.showLoading = false;

                        // TODO: Scroll to results
                        //$scope.goToResults();
                        window.prerenderReady = true;
                    }
                }, 0);
            },
            executeAndSetScopeResults: function($scope, onSuccess) {
                var my = this;
                navigationService.goToTop();

                commService.showInfoAlert("When we receive the results, we'll begin printing them! If the spinner stops spinning, we're printing as you read!", {
                    onlyIfUnique: true
                });
                this.execute($scope, function(data) {

                    my.setScopeResults($scope, data, onSuccess);

                }, function(data) {
                    $scope.results = null;
                    // Failure
                    if(data)
                        commService.showErrorAlert(data.ErrorReason);
                });
            },
            execute: function($scope, onSuccess, onFailure) {
                var command = $scope.form.command;
                this.lastCommand = command;
                var my = this;
                var parserOptions = virtualCowriterService.getParserOptions();
                var executeCommand = function() {
                    musicCommService.postWithParams('parser', {
                        RequestType: 'Execute',
                        Command: command,
                        IsDebug: OPTIONS.isDebug,
                        ParserOptions: parserOptions
                    }, function(data) {
                        if(onSuccess) {
                            my.prepareForNewCommandResults();




                            var result = data.Result;
                            var results = result.FormulaResults;
                            for(var j = 0; j < results.length; j++) {
                                var r = results[j];

                                var i = 0;

                                var smallPanes = r.Panes;
                                if(smallPanes.length <= 2) {
                                    // if there are only 2 panes, let them be medium size (if they are smaller)
                                    // if there is only 1 pane, let it take up a large spot
                                    for(var k = 0; k < smallPanes.length; k++) {
                                        if(smallPanes[k].Size === 'Small' || smallPanes[k].Size === 'Medium') {
                                            smallPanes[k].Size = 'Large';
                                        }
                                    }
                                }




                                var columnCount = 4000;
                                r.rows = homeService.columnizeList(r.Panes, columnCount);
                            }




                            onSuccess({
                                Results: results,
                                ExcludedFormulas: OPTIONS.isProduction ? null : result.ExcludedFormulas
                            });
                        }
                    }, function(data) {
                        if(onFailure)
                            onFailure(data);
                    });
                };

                // Only execute the command once the instrument service has been initialized
                if(instrumentService.initialized) {
                    executeCommand();
                }
                else {
                    $rootScope.$on('instrumentServiceInitialized', function(event, data) {
                        executeCommand();
                    });
                }



            }
        };
    }]);