angular.module('app.Directives')
    .directive('contentEditor', ['communityService', 'wikiPageService', 'profileService', 'uiService', 'mediaService', '$timeout', 'formattingDirectiveService', 'accountService', 'navigationService', function (communityService, wikiPageService, profileService, uiService, mediaService, $timeout, formattingDirectiveService, accountService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    // We use ng-if="isReady" to make the loading of the input box feel snappier (we'll load on the
                    // next digest).
                    '<div ng-if="isReady">' +

                        '<div class="list card content-editor-input-container">' +

                            '<div class="row">' +
                                '<div class="col-15">' +
                                    '<comment-picture votable="post"></comment-picture>' +
                                '</div>' +
                                '<div class="col">' +
                                    '<textarea auto-suggest class="content-editor-input item item-input" input-id="$parent.inputId" id="{{inputId}}" ng-required="$parent.isRequired" ng-focus="onFocus()" ng-blur="onFocusLost()" ng-autofocus="options.autofocus" ng-model="$parent.text" ng-paste="onPaste()" placeholder="{{$parent.placeholder}}" ng-style="{\'height\': form.height}"></textarea>' +
                                '</div>' +
                            '</div>' +



                            '<div class="item tabs tabs-secondary tabs-icon-left" style="overflow:visible;">' +
                                '<a class="tab-item pointer" ng-click="addImage()">' +
                                    '<span><i class="icon ion-camera"></i> Add Image</span>' +
                                '</a>' +
                                '<a class="tab-item pointer" ng-click="toggleFormattingHelp()">' +
                                    '<span ng-show="!showFormattingHelp"><i class="icon ion-document-text"></i> Formatting Help</span>' +
                                    '<span ng-show="showFormattingHelp"><i class="icon ion-android-close"></i> Cancel Formatting Help</span>' +
                                '</a>' +
                                '<a class="tab-item pointer" ng-click="togglePreview()">' +
                                    '<span ng-show="!showPreview"><i class="icon ion-android-search"></i> Preview</span>' +
                                    '<span ng-show="showPreview"><i class="icon ion-android-close"></i> Cancel Preview</span>' +
                                '</a>' +
                            '</div>' +

                            '<div class="item item-body" ng-if="showPreview">' +
                                '<div class="bold centered">When posted, your text will look like this:</div>' +
                                '<div style="height: auto;" btf-markdown="text" markdown-options="options.markdownOptions"></div>' +
                            '</div>' +
                            '<div class="item item-body" ng-if="showFormattingHelp">' +
                                '<formatting-help></formatting-help>' +
                            '</div>' +


                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                placeholder: '=?',
                inputId: '=?',
                text: '=',
                tagPage: '=?', // Used to upload images to the tag page, if applicable
                stepPage: '=?', // Used to upload images to the step page, if applicable
                showToolbar: '=',
                isRequired: '=?', // indicates whether content is required in the text area
                /*
                 autofocus: bool // this can be set to focus the input box,
                 onFocus(), // optional--called when the text area is focused
                 onToolbarClicked(), // optional--called when any link in the toolbar is clicked
                 hide() // This method will be set in options by this directive so that it can be called outside of this directive. It will hide the formatting,
                 markdownOptions: { } // These options will be sent to the btfMarkdown directive as the markdownOptions attribute,

                 onInitialized() // If provided, this will be called when this input box is initialized.

                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;

                scope.form = {
                    height: 50
                };

                if(!scope.placeholder) {
                    scope.placeholder = 'Tell us something fascinating...';
                }

                var textArea = element.find('textarea');

                if(!scope.inputId) {
                    scope.inputId = uiService.getGuid();
                    textArea.attr('id', scope.inputId);
                }

                if(!scope.options) {
                    scope.options = { };
                }
                scope.$watch('options', function(newValue) {
                    if(newValue) {
                        scope.options = newValue;
                        scope.options.addImage = scope.imageButtonClicked;


                        scope.options.hide = function() {
                            scope.setShowFormattingHelp(false);
                            scope.setShowPreview(false);
                        };
                        scope.options.showPreview = function() {
                            scope.setShowPreview(true);
                        };
                        scope.options.hidePreview = function() {
                            scope.setShowPreview(false);
                        };
                    }
                });

                if(!angular.isDefined(scope.isRequired)) {
                    scope.isRequired = true;
                }
                if(!angular.isDefined(scope.text)) {
                    scope.text = '';
                }

                scope.onFocus = function() {
                    if(scope.options && scope.options.onFocus) {
                        $timeout(function() {
                            scope.options.onFocus();
                        });

                    }
                    scope.form.height = 70;
                };
                scope.onFocusLost = function() {
                    scope.form.height = 50;
                    if(scope.options && scope.options.onFocusLost) {
                        scope.options.onFocusLost();
                    }

                };

                scope.onPaste = function() {
                    if(scope.options && scope.options.showPreview) {
                        scope.options.showPreview();
                    }
                };


                scope.imageButtonClicked = function() {
                    formattingDirectiveService.imageButtonClicked(scope);
                };

                $timeout(function() {
                    scope.isReady = true;

                    if(scope.options.onInitialized) {
                        $timeout(function() {
                            scope.options.onInitialized();
                        });
                    }
                });



                scope.toggleFormattingHelp = function() {
                    scope.setShowFormattingHelp(!scope.showFormattingHelp);
                };
                scope.setShowFormattingHelp = function(value) {
                    scope.showFormattingHelp = value;
                    if(scope.showFormattingHelp && scope.options && scope.options.onToolbarClicked) {
                        scope.options.onToolbarClicked();
                    }
                };

                scope.togglePreview = function() {
                    scope.setShowPreview(!scope.showPreview);
                };
                scope.setShowPreview = function(value) {
                    scope.showPreview = value;
                    if(scope.showPreview && scope.options && scope.options.onToolbarClicked) {
                        scope.options.onToolbarClicked();
                    }
                };

                scope.addImage = function() {
                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService);
                        return;
                    }

                    if(scope.options && scope.options.addImage) {
                        scope.options.addImage();
                    }

                    if(scope.options && scope.options.onToolbarClicked) {
                        scope.options.onToolbarClicked();
                    }
                };

            }
        };
    }])

    .directive('textInputFormattingHelper', ['accountService', 'navigationService', function (accountService, navigationService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="clear:both;"><a class="action-link" style="margin-right: 10px;" ng-click="addImage()">Add Image</a> <a class="action-link formatting-help-link" style="margin-right: 10px;" ng-show="!showFormattingHelp" ng-click="setShowFormattingHelp(true)">Formatting Help</a> <a class="action-link" style="margin-right: 10px;" ng-show="showFormattingHelp" ng-click="setShowFormattingHelp(false)">Cancel Formatting Help</a> <a class="action-link preview-link" style="margin-right: 10px;" ng-show="!showPreview" ng-click="setShowPreview(true)">Preview</a> <a class="action-link" style="margin-right: 10px;" ng-show="showPreview" ng-click="setShowPreview(false)">Cancel Preview</a></div>' +
                    '<div ng-if="showPreview">' +
                    '<div style="font-weight: bold;">When posted, your text will look like this:</div>' +
                    '<div style="height: auto;" btf-markdown="text" markdown-options="options.markdownOptions"></div>' +
                    '<div style="clear:both;"></div>' +
                    '</div>' +
                    '<div ng-if="showFormattingHelp">' +
                    '<formatting-help></formatting-help>' +
                    '</div>' +
                    '</div>',
            scope: {
                text: '=',
                /*
                 {
                 onToolbarClicked(), // optional--called when any link in the toolbar is clicked,

                 hidePreview() // This method will be set in options by this directive so that it can be called outside of this directive,
                 showPreview() // This method will be set in options by this directive so that it can be called outside of this directive,
                 hide() // hides the preview and formatting help. This method will be set in options by this directive so that it can be called outside of this directive,
                 markdownOptions: { } // These options will be sent to the btfMarkdown directive as the markdownOptions attribute,
                 }
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
            }
        };
    }]);