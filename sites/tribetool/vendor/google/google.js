angular.module('google', [])
    .run(function () {
        var tag = document.createElement('script');
        tag.src = "https://www.google.com/jsapi";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    })
    .service('googleService', ['$window', '$rootScope', 'commService', 'formatterService', function ($window, $rootScope, commService, formatterService) {
        var service = $rootScope.$new(true);
        service.isReady = false;



        var onLoaded = function() {
            service.imageSearcher = service.getImageSearcher();
            service.isReady = true;

            if(service.readyCallbacks) {
                for(var i = 0; i < service.readyCallbacks.length; i++) {
                    service.readyCallbacks[i]();
                }
            }
        };


        var onJsReady = function() {
            $window.google.load('search', '1', {
                base_domain: commService.getDomain(),
                callback: function() {
                    // loaded
                    onLoaded();
                }
            });
        };
        if($window.google.load) {
            onJsReady();
        }
        else {
            $window.google.setOnLoadCallback(onJsReady);
        }

        service.getImageSearcher = function() {
            var imageSearcher = new $window.google.search.ImageSearch();

            // Restrict to extra large images only
            imageSearcher.setRestriction($window.google.search.ImageSearch.RESTRICT_IMAGESIZE,
                $window.google.search.ImageSearch.IMAGESIZE_MEDIUM);

            imageSearcher.setResultSetSize(8);

            return imageSearcher;
        };





        service.readyCallbacks = [];

        service.makeImagesSecure = function(imageSearcher) {
            /*
            if(imageSearcher) {
                for(var i = 0; i < imageSearcher.results.length; i++) {
                    imageSearcher.results[i].tbUrl = formatterService.makeSecureUrl(imageSearcher.results[i].tbUrl);
                    imageSearcher.results[i].url = formatterService.makeSecureUrl(imageSearcher.results[i].url);
                }
            }
            */
        };

        var onSearchComplete = function(onComplete) {
            if(onComplete) {
                service.makeImagesSecure(service.imageSearcher);
                onComplete(service.imageSearcher.results);
            }

            // https://developers.google.com/image-search/v1/devguide#execute
            // result.titleNoFormatting
            // result.tbUrl
        };

        service.search = function(searchTerm, onComplete, onEndSearch) {
            if(!service.isReady)
                return;

            service.imageSearcher.setSearchCompleteCallback(this, onSearchComplete, [onComplete]);


            if(service.searchTerm !== searchTerm || !service.imageSearcher.cursor) {
                service.imageSearcher.execute(searchTerm);
            }
            else {
                // Google only allows 64 images
                // https://developers.google.com/image-search/v1/devguide#execute
                if(service.imageSearcher.cursor.currentPageIndex + 1 >= 8) {
                    if(onEndSearch)
                        onEndSearch();
                }
                else {
                    service.imageSearcher.gotoPage(service.imageSearcher.cursor.currentPageIndex + 1);
                }

            }

            service.searchTerm = searchTerm;
        };

        return service;
    }]);