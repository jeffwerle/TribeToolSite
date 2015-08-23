angular.module('app.Directives')

    .directive('fitImageWidthToParent', ['mediaService', '$timeout', 'uiService', function(mediaService, $timeout, uiService) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var setMaxWidth = function() {
                    var maxHeight = el.css('max-height');
                    if(maxHeight) {
                        // trim "px"
                        maxHeight = parseInt(maxHeight, 10);

                        // nW/nH = w/h
                        // w = (nW/nH)*h

                        // Set the max width
                        var maxWidth = (el[0].naturalWidth/el[0].naturalHeight)*maxHeight;
                        el.css('max-width', maxWidth + 'px');
                    }
                };


                var el = element;

                var calculateDimensions = function() {
                    setMaxWidth();

                    // Wait until we have rendered the directive before we calculate the dimensions or else
                    // we won't have element.parent()'s width which we'll need
                    $timeout(function() {

                        var width = el.width();
                        if(!width) {
                            return;
                        }



                        var parentWidth = uiService.getParentWidth(el);
                        if(parentWidth && width > parentWidth) {
                            width = parentWidth;
                        }
                        if(width > mediaService.viewport.width) {
                            width = mediaService.viewport.width;
                        }
                        el.width(width);

                    });
                };

                if(el.naturalHeight || el.naturalWidth) {
                    calculateDimensions();
                }
                else {
                    el.load(calculateDimensions);
                }


            }
        };
    }])
    .directive('interactiveImage', ['$compile', '$timeout', function($compile, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var $element = $(element);
                $element.css('display', 'block');

                if(!attrs.hidePin) {

                    var calculateLinks = function() {
                        var createLinks = function() {
                            $timeout(function() {
                                var src = attrs.src || attrs.lightboxSrc;
                                var html = '<div><pin-link-inline formatted-text="\'' + src + '\'" type="\'Image\'"></pin-link-inline><share-link formatted-text="\'||' + src + '||\'"></share-link></div>';
                                var compiledHtml = $compile(html)(scope);

                                // The pin links should adopt the img's 'margin-bottom' attribute
                                // and remove it from the img
                                compiledHtml.css('margin-bottom', $element.css('margin-bottom'));
                                $element.css('margin-bottom', 0);

                                $element.after( compiledHtml );
                            });
                        };

                        if(!attrs.src && !attrs.lightboxSrc) {
                            attrs.$observe('src', function(src){
                                if(src)
                                    createLinks();
                            });
                            attrs.$observe('lightboxSrc', function(src){
                                if(src)
                                    createLinks();
                            });
                        }
                        else {
                            createLinks();
                        }
                    };

                    if(element.naturalHeight || element.naturalWidth) {
                        calculateLinks();
                    }
                    else {
                        element.load(calculateLinks);
                    }

                }
            }
        };
    }]);