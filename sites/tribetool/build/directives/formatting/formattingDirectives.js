angular.module('app.Directives')
    .directive('contentEditor', ['communityService', 'wikiPageService', 'profileService', 'uiService', 'mediaService', '$timeout', 'formattingDirectiveService', function (communityService, wikiPageService, profileService, uiService, mediaService, $timeout, formattingDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    // We use ng-if="isReady" to make the loading of the input box feel snappier (we'll load on the
                    // next digest).
                    '<div ng-if="isReady">' +
                        //'<div ng-show="$parent.showToolbar && !mediaService.isPhone"><button class="btn btn-primary" type="button" ng-click="imageButtonClicked()"><i class="fa fa-picture-o"></i></button></div>' +
                        '<textarea auto-suggest input-id="$parent.inputId" id="{{inputId}}" ng-required="$parent.isRequired" ng-focus="onFocus()" ng-autofocus="options.autofocus" ng-style="{\'height\': textAreaHeight ? textAreaHeight + \'px\' : \'inherit\'}" class="form-control comment-input" ng-model="$parent.text" ng-paste="onPaste()" placeholder="{{$parent.placeholder}}"></textarea>' +
                        '<text-input-formatting-helper options="options" text="$parent.text"></text-input-formatting-helper>' +
                    '</div>' +
                '</div>',
            scope: {
                textAreaHeight: '=?',
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
                        scope.options.onFocus();
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
            }
        };
    }])
    .directive('textInputFormattingHelper', ['accountService', 'navigationService', function (accountService, navigationService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div class="text-input-formatting-helper">' +
                    '<div style="clear:both;">' +
                        //'<a class="action-link" style="margin-right: 10px;" ng-click="addImage()"><i class="icon ion-image"></i> Add Image</a>' +
                        '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-click="addImage()"><i class="icon ion-camera"></i></button>' +
                        '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-show="!showFormattingHelp" ng-click="setShowFormattingHelp(true)"><i class="icon ion-document-text"></i></button>' +
                        '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-show="showFormattingHelp" ng-click="setShowFormattingHelp(false)"><i class="icon ion-android-close"></i></button>' +

                        '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-show="!showPreview" ng-click="setShowPreview(true)"><i class="icon ion-android-search"></i></button>' +
                        '<button type="button" class="btn medium-toolbar-button toolbar-button-hoverable" ng-show="showPreview" ng-click="setShowPreview(false)"><i class="icon ion-android-close"></i></button>' +
                        //'<a class="action-link formatting-help-link" style="margin-right: 10px;" > Formatting Help</a>' +
                        //'<a class="action-link" style="margin-right: 10px;" ng-show="showFormattingHelp" ng-click="setShowFormattingHelp(false)"><i class="icon ion-android-close"></i> Cancel Formatting Help</a>' +
                        //'<a class="action-link preview-link" style="margin-right: 10px;" ng-show="!showPreview" ng-click="setShowPreview(true)"><i class="icon ion-android-search"></i> Preview</a>' +
                        //'<a class="action-link" style="margin-right: 10px;" ng-show="showPreview" ng-click="setShowPreview(false)"><i class="icon ion-android-close"></i> Cancel Preview</a>' +
                    '</div>' +
                    '<div ng-if="showPreview">' +
                        '<div style="font-weight: bold;">When posted, your text will look like this:</div>' +
                        '<div class="form-control" style="height: auto;" btf-markdown="text" markdown-options="options.markdownOptions"></div>' +
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
                scope.setShowFormattingHelp = function(newValue) {
                    scope.showFormattingHelp = newValue;

                    if(newValue && scope.options && scope.options.onToolbarClicked) {
                        scope.options.onToolbarClicked();
                    }
                };

                scope.setShowPreview = function(newValue) {
                    scope.showPreview = newValue;

                    if(newValue && scope.options && scope.options.onToolbarClicked) {
                        scope.options.onToolbarClicked();
                    }
                };

                scope.$watch('options', function(newValue) {

                    if(newValue) {
                        scope.options = newValue;
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
    }]);