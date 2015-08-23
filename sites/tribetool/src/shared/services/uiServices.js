angular.module('app.Services')
    .factory('uiService', ['$rootScope', function($rootScope) {
        return {
            getGuid: function() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });
            },
            getRandomColor: function() {
                var letters = '0123456789ABCDEF'.split('');
                var color = '#';
                for (var i = 0; i < 6; i++ ) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            },
            getColorList: function() {
                return ['blue', 'green', 'red', 'purple', 'orange', 'pink'];
            },
            /*
            ratio: if null, will be set to the screen's pixel ratio.
             canvasElement: the canvas element
            img: if provided, the dimensions will be set to the same as the canvas element.
             */
            createHiDefContext: function(width, height, ratio, canvasElement, context, img) {
                if(!canvasElement.getContext)
                    return context;

                if (!ratio) {
                    if(!context)
                        context = canvasElement.getContext('2d');

                    var dpr = window.devicePixelRatio || 1,
                        bsr = context.webkitBackingStorePixelRatio ||
                            context.mozBackingStorePixelRatio ||
                            context.msBackingStorePixelRatio ||
                            context.oBackingStorePixelRatio ||
                            context.backingStorePixelRatio || 1;

                    ratio = dpr / bsr;
                }

                canvasElement.width = width * ratio;
                canvasElement.height = height * ratio;
                canvasElement.style.width = width + "px";
                canvasElement.style.height = height + "px";

                if(img) {
                    img.width = canvasElement.width;
                    img.height = canvasElement.height;
                    img.style.width = canvasElement.style.width;
                    img.style.height = canvasElement.style.height;
                }

                var newContext = canvasElement.getContext("2d");
                newContext.setTransform(ratio, 0, 0, ratio, 0, 0);
                return newContext;
            },
            getParentWidth: function(element) {
                var $element = $(element);
                var parent = $element.parent();
                var parentWidth = parent.width();
                if(!parentWidth && $element[0].offsetParent) {
                    parent = $($element[0].offsetParent);
                    parentWidth = parent.width();
                }
                return parentWidth;
            }
        };
    }]);