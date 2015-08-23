angular.module('app.Services')
    .factory('formattingDirectiveService', ['wikiPageService', 'profileService', function(wikiPageService, profileService) {
        return {
            imageButtonClicked: function(scope) {

                var onSelect = function(imageFileEntry, imageFileComponentEntry) {
                    var url = imageFileComponentEntry ? imageFileComponentEntry.Url : imageFileEntry.Full.Url;
                    if(!scope.text) {
                        scope.text = '';
                    }

                    if(!angular.isDefined(imageFileEntry.Alt) && !angular.isDefined(imageFileEntry.Title)) {
                        scope.text += '||' + url + '||';
                    }
                    else {
                        scope.text += '![' + (angular.isDefined(imageFileEntry.Alt) ? imageFileEntry.Alt : '') + '](' + url + (angular.isDefined(imageFileEntry.Title) ? ' "' + imageFileEntry.Title + '"' : '') +')';
                    }

                    if(scope.options && scope.options.showPreview) {
                        scope.options.showPreview();
                    }

                };

                if(scope.tagPage || scope.stepPage) {
                    // Uploading image to tag page/step page
                    wikiPageService.selectPicture(onSelect, scope.tagPage, scope.stepPage, /*allowImageSizeSelection*/ true,
                        /*selectUploadedImage*/true,
                        /*albumType*/'Any');
                }
                else {
                    // Uploading image to account
                    profileService.selectPicture(onSelect, /*allowImageSizeSelection*/ true,
                        /*selectUploadedImage*/true,
                        /*albumType*/'Any');
                }

                if(scope.options && scope.options.onToolbarClicked) {
                    scope.options.onToolbarClicked();
                }
            }
        };
    }]);