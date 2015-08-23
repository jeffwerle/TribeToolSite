// Wheelzoom 1.1.2
// (c) 2012 jacklmoore.com | license: www.opensource.org/licenses/mit-license.php
!function($){
	var transparentPNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
	var defaults = {
		zoom: 0.10
	};
	var wheel;

	if ( document.onmousewheel !== undefined ) { // Webkit/Opera/IE
		wheel = 'onmousewheel';
	}
	else if ( document.onwheel !== undefined) { // FireFox 17+
		wheel = 'onwheel';
	}

	$.fn.wheelzoom = function(options){
		var settings = $.extend({}, defaults, options);

		if (!this[0] || !wheel || !('backgroundSize' in this[0].style)) { // IE8-
			return this;
		}

        /*
         clickOffsetX and clickOffsetY can be null.
         */
        var toMapCoordinates = function(imageWidth, imageHeight, bgWidth, bgHeight, bgPosX, bgPosY,
                                        clickOffsetX, clickOffsetY) {
            if(clickOffsetX == null)
                clickOffsetX = 0;
            if(clickOffsetY == null)
                clickOffsetY = 0;




            var percentXOfImageShown = imageWidth/bgWidth;
            var percentYOfImageShown = imageHeight/bgHeight;
            var xPixelsInViewport = imageWidth*percentXOfImageShown;
            var yPixelsInViewport = imageHeight*percentYOfImageShown;
            var normalizedOffsetX = (clickOffsetX * xPixelsInViewport) / imageWidth;
            var normalizedOffsetY = (clickOffsetY * yPixelsInViewport) / imageHeight;

            var percentToLeftOfViewport = (bgPosX/bgWidth);
            var percentAboveViewport = (bgPosY/bgHeight);
            var xPixelsLeftOfViewport = -(imageWidth*percentToLeftOfViewport);
            var yPixelsAboveViewport = -(imageHeight * percentAboveViewport);


            // We have to calculate where the left viewport would be if the click location were
            // at the center of the viewport and then we will have the bgPosXIfCenteredOnClick

            // so find out how many pixels are to the left of the click
            // then find out how many pixels are in the entire viewport and then divide by 2
            // then subtract how many pixels are to the left of the click and the pixels
            // in half of the viewport and take the absolute value
            // then add that value to the pixels left of viewport
            // that will give us the center as a map coordinate, then we will need to
            // convert that to an image coordinate to get the centered bgPosX and bgPosY (i.e. bgPosXIfCenteredOnClick)

            // still valid but not used: var xPixelsRightOfClick = xPixelsInViewport-normalizedOffsetX;
            var xPixelsLeftOfClick = normalizedOffsetX;
            var yPixelsAboveClick = normalizedOffsetY;
            var xPixelsToAddToCenterViewport = xPixelsLeftOfClick - (xPixelsInViewport/2);
            var yPixelsToAddToCenterViewport = yPixelsAboveClick - (yPixelsInViewport/2);
            var xPixelsLeftOfCenteredViewport = xPixelsLeftOfViewport + xPixelsToAddToCenterViewport;
            var yPixelsAboveCenteredViewport = yPixelsAboveViewport + yPixelsToAddToCenterViewport;
            var percentToLeftOfCenteredViewport = (-xPixelsLeftOfCenteredViewport)/imageWidth;
            var percentAboveCenteredViewport = (-yPixelsAboveCenteredViewport)/imageHeight;
            var bgPosXCentered = percentToLeftOfCenteredViewport * bgWidth;
            var bgPosYCentered = percentAboveCenteredViewport * bgHeight;

            return {
                x: Math.abs(bgPosX) < 1 ? normalizedOffsetX : xPixelsLeftOfViewport + normalizedOffsetX, // The map x coordinate
                y: Math.abs(bgPosY) < 1 ? normalizedOffsetY : yPixelsAboveViewport + normalizedOffsetY, // The map y coordinate
                xPixelsLeftOfViewport: xPixelsLeftOfViewport,
                yPixelsAboveViewport: yPixelsAboveViewport,
                xPixelsLeftOfCenteredViewport: xPixelsLeftOfCenteredViewport,
                yPixelsAboveCenteredViewport: yPixelsAboveCenteredViewport,
                normalizedOffsetX: normalizedOffsetX,
                normalizedOffsetY: normalizedOffsetY,
                bgWidth: bgWidth,
                bgHeight: bgHeight,
                bgPosX: bgPosX, // The bgPosX of the image from the image coordinates
                bgPosY: bgPosY, // The bgPosY of the image from the image coordinates
                bgPosXCentered: bgPosXCentered, // The bgPosX if the image were centered on the click location
                bgPosYCentered: bgPosYCentered // The bgPosY if the image were centered on the click location
            };

        };

        /*
        Returns {bgPosX, bgPosY, bgWidth, bgHeight}.
         clickOffsetX: the x offset of the click for the entire image. That is, if the image is 1000px across then
         the center of the image would be a clickOffsetX of 500. This can be null.
         */
        var toImageCoordinates = function(mapCoordinates, imageWidth, imageHeight, bgWidth, bgHeight,
                                          clickOffsetX, clickOffsetY) {
            if(clickOffsetX == null)
                clickOffsetX = 0;
            if(clickOffsetY == null)
                clickOffsetY = 0;

            var xPixelsInViewport = (mapCoordinates.normalizedOffsetX * imageWidth)/clickOffsetX;
            var yPixelsInViewport = (mapCoordinates.normalizedOffsetY * imageHeight)/clickOffsetY;
            var percentXOfImageShown = xPixelsInViewport/imageWidth;
            var percentYOfImageShown = yPixelsInViewport/imageHeight;
            var bgWidth = imageWidth/percentXOfImageShown;
            var bgHeight = imageHeight/percentYOfImageShown;

            var xPixelsLeftOfViewport = -(mapCoordinates.x - mapCoordinates.normalizedOffsetX);
            var yPixelsAboveViewport = -(mapCoordinates.y - mapCoordinates.normalizedOffsetY);
            var percentToLeftOfViewport = xPixelsLeftOfViewport/imageWidth;
            var percentAboveViewport = yPixelsAboveViewport/imageHeight;
            var bgPosX = percentToLeftOfViewport * bgWidth;
            var bgPosY = percentAboveViewport * bgHeight;

            return {
                bgPosX: Math.abs(xPixelsLeftOfViewport) < 1 ? 0 : bgPosX,
                bgPosY: Math.abs(yPixelsAboveViewport) < 1 ? 0 : bgPosY,
                bgWidth: bgWidth,
                bgHeight: bgHeight
            };
        };

		return this.each(function(){
			var img = this,
				$img = $(img);

            var offsetX = 0;
            var offsetY = 0;
            var currentDelta = 0;
            var zoomFactor = 0;
            var mapOffsetCoordinates = null; // The upper left hand map coordinate (not image coordinate)



			function loaded() {
				var width = $img.width(),
					height = $img.height(),
					bgWidth = width,
					bgHeight = height,
					bgPosX = 0,
					bgPosY = 0,
					offsetBorderX = parseInt($img.css('border-left-width'),10),
					offsetBorderY = parseInt($img.css('border-top-width'),10),
					offsetPaddingX = parseInt($img.css('padding-left'),10),
					offsetPaddingY = parseInt($img.css('padding-top'),10);

                function goToLocation(mapCoordinate) {
                    bgWidth = mapCoordinate.bgWidth;
                    bgHeight = mapCoordinate.bgHeight;
                    bgPosX = mapCoordinate.bgPosXCentered;
                    bgPosY = mapCoordinate.bgPosYCentered;
                    updateBgStyle();
                }

                function glideToLocation(mapCoordinate) {
                    // Find out where we are and we are going to go
                    // Then calculate the steps to get there
                    // and cycle through them until we're done
                }

				function reset() {
					bgWidth = width;
					bgHeight = height;
					bgPosX = bgPosY = 0;
					updateBgStyle();
				}

				function updateBgStyle() {
					if (bgPosX > 0) {
						bgPosX = 0;
					} else if (bgPosX < width - bgWidth) {
						bgPosX = width - bgWidth;
					}

					if (bgPosY > 0) {
						bgPosY = 0;
					} else if (bgPosY < height - bgHeight) {
						bgPosY = height - bgHeight;
					}

					img.style.backgroundSize = bgWidth + 'px ' + bgHeight + 'px';
					img.style.backgroundPosition = (bgPosX+offsetPaddingX) + 'px ' + (bgPosY+offsetPaddingY) + 'px';
				}


				$img.css({
					background: "url("+img.src+") 0 0 no-repeat",
					backgroundSize: width+'px '+height+'px',
					backgroundPosition: offsetPaddingX+'px '+offsetPaddingY+'px'
				}).bind('wheelzoom.reset', reset);

				// Explicitly set the size to the current dimensions,
				// as the src is about to be changed to a 1x1 transparent png.
				img.width = img.width || img.naturalWidth;
				img.height = img.height || img.naturalHeight;
				img.src = transparentPNG;

				img[wheel] = function (e) {
					var deltaY = 0;

					e.preventDefault();

					if (e.deltaY) { // FireFox 17+
						deltaY = e.deltaY;
					} else if (e.wheelDelta) {
						deltaY = -e.wheelDelta;
					}

					// As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
					// We have to calculate the target element's position relative to the document, and subtrack that from the
					// cursor's position relative to the document.
					var offsetParent = $img.offset();
					offsetX = e.pageX - offsetParent.left - offsetBorderX - offsetPaddingX;
					offsetY = e.pageY - offsetParent.top - offsetBorderY - offsetPaddingY;

					// Record the offset between the bg edge and cursor:
					var bgCursorX = offsetX - bgPosX;
					var bgCursorY = offsetY - bgPosY;
					
					// Use the previous offset to get the percent offset between the bg edge and cursor:
					var bgRatioX = bgCursorX/bgWidth;
					var bgRatioY = bgCursorY/bgHeight;

					// Update the bg size:
					if (deltaY < 0) {
						bgWidth += bgWidth*settings.zoom;
						bgHeight += bgHeight*settings.zoom;
					} else {
						bgWidth -= bgWidth*settings.zoom;
						bgHeight -= bgHeight*settings.zoom;
					}

					// Take the percent offset and apply it to the new size:
					bgPosX = offsetX - (bgWidth * bgRatioX);
					bgPosY = offsetY - (bgHeight * bgRatioY);

                    mapOffsetCoordinates = toMapCoordinates(width, height, bgWidth, bgHeight, bgPosX, bgPosY, null, null);

					// Prevent zooming out beyond the starting size
					if (bgWidth <= width || bgHeight <= height) {
                        currentDelta = 0;
                        zoomFactor = 0;
						reset();
					} else {
                        var normalizedDeltaY = deltaY < 0 ? 1 : -1;
                        if(currentDelta + normalizedDeltaY >= 0)
                        {
                            currentDelta += normalizedDeltaY;
                            zoomFactor = currentDelta * settings.zoom;
                        }
                        else
                        {
                            currentDelta = 0;
                            zoomFactor = 0;
                        }




						updateBgStyle();
					}
				};

				// Make the background draggable
                var isMouseDown = false;
                var didDrag = false;
				img.onmousedown = function(e){
                    isMouseDown = true;
					var last = e;

					e.preventDefault();

					function drag(e) {
                        didDrag = true;
						e.preventDefault();
						bgPosX += (e.pageX - last.pageX);
						bgPosY += (e.pageY - last.pageY);
						last = e;
						updateBgStyle();
					}

					$(document)
					.on('mousemove', drag)
					.one('mouseup', function (e) {
                        if(!didDrag) {
                            // User clicked on a location
                            var clickLocation = toMapCoordinates(width, height, bgWidth, bgHeight, bgPosX, bgPosY, e.offsetX, e.offsetY);
                            goToLocation(clickLocation);

                            if(angular.isDefined(settings.onClick)) {
                                settings.onClick(clickLocation);
                            }
                        }

                        didDrag = false;
                        isMouseDown = false;
						$(document).unbind('mousemove', drag);
					});
				};

			}

			if (img.complete) {
				loaded();
			} else {
				$img.one('load', loaded);
			}

		});
	};

	$.fn.wheelzoom.defaults = defaults;

}(window.jQuery);