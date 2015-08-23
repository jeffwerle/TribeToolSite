angular.module('app.Directives')

    .directive('fileDropzone', ['$timeout', function($timeout) {
        return {
            replace: true,
            restrict: 'E',
            transclude: true,
            template:
                '<div>' +
                    '<div ng-transclude></div>' +
                '</div>',
            scope: {
                /*
                 {
                    file: // File from browser
                    fileAsDataUrl: // base64 data
                    fileName: // the name of the uploaded file
                    validMimeTypes: [], // default ['image/png', 'image/jpeg', 'image/gif']
                    maxFileSize: int // default 3
                 }
                */
                fileOptions: '=',
                onFileDropped: '&',
                disabled: '=?' // bool
            },
            link: function(scope, element, attrs) {
                scope.initialized = false;
                var initialize = function() {
                    if(scope.initialized)
                        return;

                    var checkSize, isTypeValid, processDragOverOrEnter;
                    processDragOverOrEnter = function(event) {
                        if (event !== null) {
                            event.preventDefault();
                        }

                        if(!event.dataTransfer)
                            event.dataTransfer = event.originalEvent.dataTransfer;

                        event.dataTransfer.effectAllowed = 'copy';
                        return false;
                    };
                    if(!scope.fileOptions) {
                        scope.fileOptions = { };
                    }
                    if(!scope.fileOptions.validMimeTypes) {
                        scope.fileOptions.validMimeTypes = ['image/png', 'image/jpeg', 'image/gif'];
                    }
                    if(!scope.fileOptions.maxFileSize) {
                        scope.fileOptions.maxFileSize = 5;
                    }

                    checkSize = function(size) {
                        var _ref;
                        if (((_ref = scope.fileOptions.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < scope.fileOptions.maxFileSize) {
                            return true;
                        } else {
                            alert("File must be smaller than " + scope.fileOptions.maxFileSize + " MB");
                            return false;
                        }
                    };
                    isTypeValid = function(type) {
                        if ((scope.fileOptions.validMimeTypes === (void 0) || scope.fileOptions.validMimeTypes === '') || scope.fileOptions.validMimeTypes.indexOf(type) > -1) {
                            return true;
                        } else {
                            alert("Invalid file type.  File must be one of following types " + scope.fileOptions.validMimeTypes);
                            return false;
                        }
                    };
                    element.bind('dragover', processDragOverOrEnter);
                    element.bind('dragenter', processDragOverOrEnter);
                    element.bind('drop', function(event) {
                        var name, reader, size, type;
                        if (event !== null) {
                            event.preventDefault();
                        }
                        if(!event.dataTransfer)
                            event.dataTransfer = event.originalEvent.dataTransfer;

                        reader = new FileReader();
                        reader.onload = function(evt) {
                            if (checkSize(size) && isTypeValid(type)) {
                                return scope.$apply(function() {
                                    scope.fileOptions.fileAsDataUrl = evt.target.result;

                                    $timeout(function() {
                                        if(scope.onFileDropped)
                                            scope.onFileDropped();
                                    });


                                    if (angular.isString(scope.fileOptions.fileName)) {
                                        scope.fileOptions.fileName = name;
                                        return;
                                    }
                                });
                            }
                        };
                        scope.fileOptions.file = event.dataTransfer.files[0];
                        name = scope.fileOptions.file.name;
                        type = scope.fileOptions.file.type;
                        size = scope.fileOptions.file.size;
                        reader.readAsDataURL(scope.fileOptions.file);
                        return false;
                    });
                    scope.initialized = true;
                };

                scope.$watch('disabled', function(newValue) {
                    if(!attrs.disabled || newValue === false) {
                        initialize();
                    }
                });
            }
        };
    }])
    .directive('modalCloseButton', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<button ng-click="onCancel()" style="position: absolute; top: 10px; right: 10px; z-index:2;" class="pointer">' +
                    '<i class="fa fa-times grey-icon"></i>' +
                '</button>',
            scope: {
                onCancel: '&'
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('closeModalOnClick', ['modalService', function (modalService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function() {
                    modalService.closeAll();
                });
            }
        };
    }])
    .directive('showLightBox', ['Lightbox', function (Lightbox) {
        return {
            restrict: 'A',
            scope: {
                /*
                    {
                         imageFileEntry: '=?',
                         tagPage: '=?',
                         stepPage: '=?',
                         specialization: '=?' // SpecializationEntry, for StepPage (used so that we can get the proper url to comments on an image)
                    }
                 */
                showLightBox: '='

            },
            link: function (scope, element, attrs) {
                element.addClass('pointer');

                element.click(function() {
                    var src = attrs.src;

                    var options = scope.showLightBox;

                    var images = [];
                    if(options && options.imageFileEntry) {
                        images.push({
                            imageFileEntry: options.imageFileEntry,
                            url: src,
                            tagPage: options.tagPage,
                            stepPage: options.stepPage,
                            specialization: options.specialization
                        });
                    }
                    else {
                        images.push({
                            url: src
                        });
                    }

                    Lightbox.openModal(images, /*index*/0);
                });

            }
        };
    }])
    /*
     A menu item is an array consisting of [text, function(), data]
    * */
    .directive('ngContextMenu', ['uiService', '$compile', function (uiService, $compile) {
        var renderContextMenu = function ($scope, element, event, data, options) {
            $(event.currentTarget).addClass('context');
            var $contextMenu = $('<div class="context-menu">');
            $contextMenu.addClass('dropdown clearfix');
            var $ul = $('<ul>');
            $ul.addClass('dropdown-menu');
            $ul.attr({ 'role': 'menu' });

            if(!event.data)
                event.data = data;

            var pageX = angular.isDefined(event.pageX) ? event.pageX : data.pageX;
            var pageY = angular.isDefined(event.pageY) ? event.pageY : data.pageY;
            $ul.css({
                display: 'block',
                position: 'absolute',
                left: pageX + 'px',
                top: pageY + 'px'
            });
            angular.forEach(options.items, function (item, i) {
                var $li = $('<li>');
                if (item === null) {
                    $li.addClass('divider');
                } else {
                    $a = $('<a>');
                    $a.attr({ tabindex: '-1', href: '#' });
                    var compiledElement = $compile('<span>' + item[0] + '</span>')($scope);
                    $a.append(compiledElement);
                    $li.append($a);
                    $li.on('click', function (event) {
                        $scope.$apply(function() {
                            item[1]($scope, item[2]);
                        });
                        event.preventDefault();
                    });
                }
                $ul.append($li);
            });
            $contextMenu.append($ul);
            $contextMenu.css({
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 9999
            });
            var body = $(document).find('body');
            body.append($contextMenu);

            $ul.css('left', (parseInt($ul.css('left')) - $ul.width()) + 'px');

            var menuId = uiService.getGuid();
            $contextMenu[0].id = menuId;
            var removeMenuOnOutsideClick = function(e, eventTypeToSkip) {
                // If we clicked on the element on which this context menu was created
                // then don't remove the menu (this may happen the first time we open
                // the context menu).
                var target = e.toElement ? e.toElement : e.target;
                if(target && (target === element[0] ||
                    element.find(target).length > 0))
                    return;

                var elementsToRemove = body.find('#' + menuId);
                if(elementsToRemove.length > 0) {
                    elementsToRemove.remove();
                }

                // Either we just removed the menu or the menu was never up--in either case
                // our event handling is done here.
                $('body').off(eventTypeToSkip + '.' + menuId);
            };
            body.on('click.' + menuId, function(e) {
                removeMenuOnOutsideClick(e, 'click');
            });
            body.on('contextmenu.' + menuId, function(e) {
                removeMenuOnOutsideClick(e, 'contextmenu');
            });

            $contextMenu.on("click", function (event) {
                $(event.currentTarget).removeClass('context');
                $contextMenu.remove();
            }).on('contextmenu', function (event) {
                    $(event.currentTarget).removeClass('context');
                    event.preventDefault();
                    $contextMenu.remove();
                });
        };
        return function ($scope, element, attrs) {
            var showContextMenu = function (event, data) {
                $scope.$apply(function () {
                    event.preventDefault();
                    var options = $scope.$eval(attrs.ngContextMenu);

                    options.showMenu = function(e, d) {
                        renderContextMenu($scope, element, e, d, options);
                    };
                    if(options.onShow)
                        options.onShow();

                    options.showMenu(event, data);
                });
            };
            // http://stackoverflow.com/questions/9584892/can-you-set-event-data-with-jquery-trigger
            // http://stackoverflow.com/questions/13506209/pass-data-using-jquery-trigger-event-to-a-change-event-handler
            element.on('click', showContextMenu);
            element.on('contextmenu', showContextMenu);
        };
    }])
    /* Executes the given function upon reaching the last element in an ng-repeat */
    .directive('onRepeatFinished', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.onRepeatFinished);
            if (scope.$last){
                fn(scope, { e: {index: scope.$index}});
            }
        };
    }])
    .directive('onRepeatItemClick', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.onRepeatItemClick);
            element.bind('click', function(event) {
                var func = function() {
                    fn(scope, { e: {$event:event, index: scope.$index}});
                };
                if(scope.$$phase)
                    func();
                else
                    scope.$apply(func);
            });
        };
    }])
    .directive('loadingManager', ['$timeout', function($timeout) {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div ng-show="processing">' +
                    '<loading></loading> {{loading.message}}' +
                '</div>',
            // Notice that we do not isolate the scope
            link: function (scope, element, attrs) {

                if(!scope.loading) {
                    scope.loading = { };
                }

                scope.loading.quick = function(func, message) {
                    scope.processing = true;
                    if(message)
                        scope.loading.message = message;
                    else {
                        scope.loading.message = 'Please Wait...';
                    }

                    $timeout(function() {
                        func();
                        scope.processing = false;
                    });
                };
            }
        };
    }]);

