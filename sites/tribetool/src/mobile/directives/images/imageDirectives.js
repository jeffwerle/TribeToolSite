angular.module('app.Directives')
    .directive('editImage', ['imageDirectiveService', 'navigationService', function(imageDirectiveService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="centered"><img ng-src="{{imageFileEntry.Medium.Url | trusted}}"/></div>' +

                    '<div class="list">' +
                        '<label class="item item-input item-floating-label">' +
                            '<span class="input-label" ng-show="imageFileEntry.Title">Image Title</span>' +
                            '<input type="text" ng-model="imageFileEntry.Title" placeholder="Image Title">' +
                        '</label>' +
                        '<label class="item item-input item-floating-label">' +
                            '<span class="input-label" ng-show="imageFileEntry.Alt">Alternate Image Text:</span>' +
                            '<input type="text" ng-model="imageFileEntry.Alt" placeholder="Alternate Image Text">' +
                        '</label>' +
                        '<label class="item item-input item-floating-label">' +
                            '<span class="input-label" ng-show="form.tags">Image Tags (#tags):</span>' +
                            '<tag-content-editor is-required="false" text="form.tagText" tags="form.tags" final-tag-text="form.finalTagText" placeholder="\'Put your #tags here...\'"></tag-content-editor>' +
                        '</label>' +
                    '</div>' +

                    '<div class="centered" style="clear:both; margin-top:10px;">' +
                        '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="submitEdit()">Save</button>' +
                        '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                    '</div>' +
                '</div>',
            scope: {
                /* {
                 onEndEditing(),
                 }
                 */
                options: '=',
                /* The ImageFileEntry that is being edited*/
                imageFileEntry: '='
            },
            link: function (scope, element, attrs) {
                imageDirectiveService.initializeEditImageScope(scope);
                navigationService.goToTop();
            }
        };
    }])
    .directive('uploadImage', ['commService', 'accountService', 'communityService', '$timeout', '$ionicPlatform', '$cordovaCamera', '$jrCrop', '$cordovaFileTransfer', 'imageDirectiveService', 'ionicLoadingService', '$window', function(commService, accountService, communityService, $timeout, $ionicPlatform, $cordovaCamera, $jrCrop, $cordovaFileTransfer, imageDirectiveService, ionicLoadingService, $window) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +

                    '<div ng-show="!processing"  class="centered">' +
                        '<h4>Upload File to Album "{{album.Title}}"</h4>' +
                        '<div style="margin-top: 20px; margin-bottom: 20px;">' +
                            '<p ng-show="fileOptions.imageUploadError" style="color: red;">{{fileOptions.imageUploadError}}</p>' +
                            '<p ng-show="fileOptions.imageUploadSuccess" style="color: green;">{{fileOptions.imageUploadSuccess}}</p>' +
                        '</div>' +

                        '<div ng-show="!form.imageUri">' +
                            '<div class="row">' +
                                '<div class="col">' +
                                    '<button class="button button-block button-positive" type="button" ng-click="selectImageFromLibrary()"><i class="ion-images"></i> Image From Library</button>' +
                                '</div>' +
                                '<div class="col">' +
                                    '<button class="button button-block button-positive" type="button" ng-click="selectImageFromCamera()"><i class="ion-camera"></i> Take Picture</button>' +
                                '</div>' +
                            '</div>' +

                            '<div style="margin-top:20px;">' +
                                '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div ng-show="form.imageUri">' +
                        '<div class="centered">' +
                            '<img id="uploadedImage" style="height: 200px;" ng-class="{\'rotate-90\': form.rotation === 90, \'rotate-180\': form.rotation === 180, \'rotate-270\': form.rotation === 270}">' +
                            '<div class="row">' +
                                '<div class="col">' +
                                    '<button class="button button-stable" type="button" ng-click="rotateRight()"><i class="fa fa-repeat"></i></button>' +
                                '</div>' +
                                '<div class="col">' +
                                    '<button class="button button-stable" type="button" ng-click="rotateLeft()"><i class="fa fa-undo"></i></button>' +
                                '</div>' +

                            '</div>' +
                        '</div>' +

                        '<div ng-show="!processing">' +

                            '<div ng-show="allowCropping">' +
                                '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="crop()">Crop Image</button>' +
                            '</div>' +

                            '<div class="list">' +
                                '<label class="item item-input item-floating-label">' +
                                    '<span class="input-label" ng-show="form.title">Image Title</span>' +
                                    '<input type="text" ng-model="form.title" placeholder="Image Title">' +
                                '</label>' +
                                '<label class="item item-input item-floating-label">' +
                                    '<span class="input-label" ng-show="form.altText">Alternate Image Text:</span>' +
                                    '<input type="text"ng-model="form.altText" placeholder="Alternate Image Text">' +
                                '</label>' +
                                '<label class="item item-input item-floating-label">' +
                                    '<span class="input-label" ng-show="form.tags">Image Tags (#tags):</span>' +
                                    '<tag-content-editor is-required="false" text="form.tagText" tags="form.tags" final-tag-text="form.finalTagText" placeholder="\'Put your #tags here...\'"></tag-content-editor>' +
                                '</label>' +
                            '</div>' +

                            '<div style="margin-top:20px;">' +
                                '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="uploadImage()">Upload File</button>' +
                                '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                            '</div>' +

                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                /* {
                 onEndUploading(),

                 community: CommunityEntry // The community in which the images will be uploaded/retrieved
                 onSelected(ImageFileEntry, ImageFileComponentEntry), (ImageFileComponentEntry will only be populated if the user is selecting an image size)
                 onCancelled(),
                 getAlbumStack(onSuccess, onFailure),
                 albumType: string (enum. Values: 'ProfilePicture', 'CoverImage', 'Content', 'Any'),
                 albumId: // if provided, this album will be selected
                 tagPage: TagPageEntry (if provided, we will upload images to this tag page. If not provided, we will upload images to the logged-in account),
                 stepPage: StepPageEntry (if provided, we will upload images to this step page. If not provided, we will upload images to the logged-in account),
                 allowImageSizeSelection: bool (if true, the user can select small, medium or large for the image (the ImageFileComponentEntry will be passed along with the ImageFileEntry). If false, the user can only select the total ImageFileEntry),
                 selectUploadedImage: bool (if true, any uploaded image will be auto-selected),
                 allowCropping: bool,

                 fileOptions: {  // Optional
                 file: // File from browser
                 fileAsDataUrl: // base64 data
                 fileName: // the name of the uploaded file
                 validMimeTypes: [], // default ['image/png', 'image/jpeg', 'image/gif']
                 maxFileSize: int // default 3
                 }
                 }
                 */
                options: '=',
                /* The album to which the image will be uploaded */
                album: '='
            },
            link: function (scope, element, attrs) {
                if(scope.options.onlyAllowSelection) {
                    return;
                }
                scope.allowCropping = !angular.isDefined(scope.options.allowCropping) || scope.options.allowCropping;

                scope.form = {
                    imageUri: null,
                    croppedImage: null, // base64,
                    rotation: 0, // 0, 90, 180, 270,
                    progress: 0 // upload progress percentage
                };

                imageDirectiveService.initializeUploadImageScope(scope);

                scope.selectImageUri = function(imageUri) {
                    scope.form.imageUri = imageUri;

                    if(scope.allowCropping) {
                        scope.crop();
                    }
                    else {
                        scope.setImageSrc();
                    }
                };

                scope.getPicture = function(options) {
                    $ionicPlatform.ready(function() {
                        if(!scope.form.shouldClean) {
                            scope.form.shouldClean = options.destinationType === Camera.DestinationType.FILE_URI;
                        }
                        $window.navigator.camera.getPicture(function(imageUri) {
                            scope.selectImageUri(imageUri);
                            scope.$apply();

                        }, function(err) {
                            // User cancelled the selection of the picture most likely
                        }, options);



                    });

                    /*
                    $ionicPlatform.ready(function() {
                        commService.showInfoAlert('Preparing to Take Picture');
                        $cordovaCamera.getPicture(options).then(function(imageUri) {
                            //commService.showInfoAlert(imageUri);
                            scope.selectImageUri(imageUri);
                        }, function(err) {
                            // error
                            commService.showErrorAlert(err);
                        });

                        if(options.destinationType === Camera.DestinationType.FILE_URI) {
                            commService.showInfoAlert('Preparing to Clean');
                            // only for FILE_URI
                            $cordovaCamera.cleanup().then(function() {
                                commService.showInfoAlert('cleaned up');
                            });
                        }
                    });
                    */
                };

                scope.setImageSrc = function() {
                    var image = scope.getImageElement();
                    image[0].src = scope.form.imageUri;
                };

                scope.getImageElement = function() {
                    return $('#uploadedImage');
                };

                scope.crop = function() {

                    $jrCrop.crop({
                        url: scope.form.imageUri,
                        width: 200,
                        height: 200
                    }).then(function(canvas) {
                            // success!
                            scope.form.croppedImage = canvas.toDataURL();

                            var image = scope.getImageElement();
                            image[0].src = scope.form.croppedImage;
                        }, function() {
                            scope.form.croppedImage = null;

                            // User canceled or couldn't load image so just
                            // use the standard image for display
                            scope.setImageSrc();
                        });
                    /*
                    var image = scope.getImageElement()[0];
                    var cropFromDimensions = function() {
                        var height = image.naturalHeight;
                        var width = image.naturalWidth;
                        var side = height < width ? height : width;

                        $jrCrop.crop({
                            url: scope.form.imageUri,
                            width: 200,
                            height: 200
                        }).then(function(canvas) {
                                // success!
                                scope.form.croppedImage = canvas.toDataURL();

                                var image = scope.getImageElement();
                                image[0].src = scope.form.croppedImage;
                            }, function() {
                                scope.form.croppedImage = null;

                                // User canceled or couldn't load image so just
                                // use the standard image for display
                                scope.setImageSrc();
                            });
                    };

                    if(!image.naturalHeight) {
                        image.onload = function(){
                            cropFromDimensions();
                        };
                    }
                    else {
                        cropFromDimensions();
                    }*/

                };

                scope.selectImageFromCamera = function() {
                    var options = {
                        //quality: 100,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        encodingType: 1 // png
                    };
                    scope.getPicture(options);
                };

                scope.selectImageFromLibrary = function() {
                    var options = {
                        //quality: 100,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        encodingType: 1 // png
                    };
                    scope.getPicture(options);
                };


                scope.fileOptions = {
                    imageUploadError: null,
                    imageUploadSuccess: null
                };
                scope.uploadImage = function() {
                    var upload = function() {
                        var uploadServiceUrl = commService.getServiceUrl() + '/image';
                        var apiParams = imageDirectiveService.getUploadImageServiceParameters(scope, scope.form.croppedImage);

                        // http://stackoverflow.com/questions/18653065/servicestack-switch-off-snapshot
                        // We have to ensure that our Service responds in JSON (instead of html) so let's let them
                        // know that we accept json
                        var headers={'Accept':'application/json'};

                        var fileTransferOptions = {
                            params: apiParams,
                            httpMethod: 'POST',
                            headers: headers
                            //mimeType: 'image/png'
                        };

                        $ionicPlatform.ready(function() {
                            scope.form.progress = 0;
                            $cordovaFileTransfer.upload(uploadServiceUrl, scope.form.imageUri, fileTransferOptions,/*trustAllHosts*/true).then(
                                function(response) {
                                    // Success!

                                    ionicLoadingService.hide();
                                    var data = JSON.parse(response.response);

                                    if(!data.Success) {
                                        scope.fileOptions.imageUploadError = data.ErrorReason;
                                        commService.showErrorAlert(scope.fileOptions.imageUploadError);
                                    }
                                    else if(!data.Files) {
                                        scope.fileOptions.imageUploadError = 'The file was uploaded but there was an error retrieving its information.';
                                        commService.showErrorAlert(scope.fileOptions.imageUploadError);
                                        scope.files = null;
                                    }
                                    else {
                                        scope.fileOptions.imageUploadSuccess = 'File Uploaded successfully!';
                                        commService.showSuccessAlert(scope.fileOptions.imageUploadSuccess);
                                        scope.files = null;
                                        if(!scope.images) {
                                            scope.images = [];
                                        }
                                        scope.images.push(data.Files[0]);

                                        scope.options.onEndUploading(data.Files[0]);

                                    }

                                }, function(data) {
                                    // Error
                                    ionicLoadingService.hide();

                                    scope.processing = false;
                                    // file error
                                    scope.fileOptions.imageUploadError = data;
                                    commService.showErrorAlert(data.code);
                                    commService.showErrorAlert(data.source);
                                    commService.showErrorAlert(data.target);

                                }, function (progressEvent) {
                                    // constant progress updates

                                    if (progressEvent.lengthComputable) {
                                        scope.form.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                                    }

                                });
                        });
                    };

                    scope.processing = true;
                    ionicLoadingService.show({
                        template: '<loading></loading> <span ng-show="form.progress">{{form.progress}}% Complete</span><span ng-show="!form.progress">Uploading Image</span>...',
                        scope: scope
                    });
                    $timeout(function() {
                        upload();
                    });
                };

                scope.cancel = function() {
                    scope.form.imageUri = null;
                    scope.options.onEndUploading();
                };

                scope.$on('$destroy', function() {
                    if(scope.form.shouldClean) {
                        $window.navigator.camera.cleanup(function () {
                            // Clean
                        }, function (err) {
                            // Error
                        });
                    }
                });

            }
        };
    }])
    .directive('imageSelection', ['imageDirectiveService', '$ionicPopup', 'navigationService', function(imageDirectiveService, $ionicPopup, navigationService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isUploading && !options.onlyAllowSelection">' +
                        '<upload-image options="options" album="album"></upload-image>' +
                    '</div>' +
                    '<div ng-if="isEditing && !options.onlyAllowSelection">' +
                        '<edit-image image-file-entry="imageToEdit" options="options"></edit-image>' +
                    '</div>' +
                    '<div ng-if="!isUploading && !isEditing && !isDeleting">' +
                        '<div ng-show="!options.onlyAllowSelection">' +
                            '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="beginUploading()"><i class="fa fa-plus"></i> Upload Image</button>' +
                        '</div>' +
                        '<div class="centered"><h2>Album: {{album.Title}}</h2></div>' +
                        '<div ng-repeat="image in images">' +
                            '<div class="card list image-selection-container">' +

                                '<div class="item item-avatar">' +
                                    '<more-options ng-if="moreOptions" options="moreOptions" item="image"></more-options>' +
                                    '<div><label>Image Title:</label> {{image.Title ? image.Title : \'Untitled\'}}</div>' +
                                '</div>'+


                                '<div class="item item-body centered">' +

                                    '<img class="pointer" ng-click="imageClicked(image)" ng-src="{{image.Medium.Url | trusted}}">' +

                                    '<div ng-show="image.Alt"><label>Alt Text:</label> {{image.Alt}}</div>' +
                                    '<div ng-show="image.TagText"><label>Image Tags:</label> <div btf-markdown="image.TagText"></div></div>' +

                                    '<div ng-if="options.allowImageSizeSelection">' +
                                        '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="selectImage(image, image.Full)">Select Picture</button>' +
                                    '</div>' +
                                    '<div ng-if="!options.allowImageSizeSelection">' +
                                        '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="selectImage(image)">Select Picture</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div>' +
                            '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                        '</div>' +
                    '</div>' +

                '</div>',
            scope: {
                options: '=',
                album: '='
            },
            link: function (scope, element, attrs) {

                imageDirectiveService.initializeImageSelectionScope(scope);

                scope.moreOptions = {
                    title: 'Image Options',
                    buttons: [{
                        text: 'Edit Image',
                        onClick: function(imageFileEntry) {
                            scope.editImage(imageFileEntry);
                        }
                    }]
                };
                scope.moreOptions.delete = {
                    text: 'Delete Image',
                    onClick: function(imageFileEntry) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Delete Picture Forever?',
                            template: 'Are you sure you want to delete this Picture forever?',
                            okText: 'Delete',
                            okType: 'button-assertive'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                // Delete image
                                scope.deleteImage(imageFileEntry);
                            } else {
                                // Cancelled
                            }
                        });
                    }
                };

                navigationService.goToTop();
            }
        };
    }])
    .directive('editAlbum', ['imageDirectiveService', 'navigationService', function(imageDirectiveService, navigationService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<form ng-submit="save()" novalidate="novalidate">' +

                        '<div class="list">' +
                            '<label class="item item-input item-floating-label">' +
                                '<span class="input-label">Album Title</span>' +
                                '<input type="text" required ng-model="album.Title" placeholder="Album Title">' +
                            '</label>' +
                        '</div>' +
                        '<div style="margin-top:20px;">' +
                            '<button class="button button-block button-positive col-80 col-offset-10" type="submit">Save Album</button>' +
                            '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                        '</div>' +
                    '</form>' +
                '</div>',
            scope: {
                options: '=',
                album: '='
            },
            link: function (scope, element, attrs) {
                imageDirectiveService.initializeEditAlbumScope(scope);

                navigationService.goToTop();
            }
        };
    }])
    .directive('albumSelection', ['imageDirectiveService', '$ionicPopup',  function(imageDirectiveService, $ionicPopup) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isUploading">' +
                        '<upload-image options="options" album="selectedAlbum"></upload-image>' +
                    '</div>' +
                    '<div ng-if="!isUploading">' +

                        '<div ng-if="selectedAlbum">' +
                            '<image-selection album="selectedAlbum" options="options"></image-selection>' +
                        '</div>' +
                        '<div ng-if="!selectedAlbum">' +
                            '<div ng-show="loading"><loading></loading> Loading...</div>' +
                            '<div ng-show="isDeleting"><loading></loading> Deleting...</div>' +
                            '<div ng-show="!isDeleting">' +
                                '<div ng-if="isEditing || isCreating">' +
                                    '<edit-album album="albumToEdit" options="options"></edit-album>' +
                                '</div>' +
                                '<div ng-if="!isEditing && !isCreating">' +
                                    '<div ng-show="!options.onlyAllowSelection">' +
                                        '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="beginUploading()"><i class="fa fa-plus"></i> Upload Image</button>' +
                                    '</div>' +
                                    '<div ng-if="tagPage" style="font-weight: bold;"><h2>{{tagPage.Tag}} Albums</h2></div>' +
                                    '<div class="centered bold" ng-show="!tagPage">Search for a Tag picture or browse your Albums below:</div>' +
                                    '<tag-page-search-bar options="tagPageSearchOptions"></tag-page-search-bar>' +

                                    '<div ng-repeat="album in albums">' +
                                        '<div class="list card album-container">' +

                                            '<div class="item item-avatar">' +
                                                '<more-options ng-if="moreOptions" options="moreOptions" item="album"></more-options>' +
                                                '<div><h2>{{album.Title}}</h2></div>' +
                                            '</div>'+

                                            '<div class="item item-body">' +
                                                '<div ng-repeat="image in album.Images">' +
                                                    '<div class="pointer" ng-click="selectAlbum(album)" style="float: left;">' +
                                                        '<div><img ng-src="{{image.Small.Url | trusted}}"/></div>' +
                                                    '</div>' +
                                                '</div>' +
                                                '<div ng-show="album.Images.length <= 0" class="centered"><h3>This album has no pictures yet.</h3></div>' +

                                                '<div style="clear: both; padding-top: 10px;">' +
                                                    '<button class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="selectAlbum(album)">Select Album</button>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +

                                    '<button style="margin-top: 10px;" ng-show="!options.onlyAllowSelection" class="button button-block button-positive col-80 col-offset-10" type="button" ng-click="addNewAlbum()"><i class="fa fa-plus"></i> Add New Album</button></button>' +

                                    '<div>' +
                                        '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                                    '</div>' +

                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '=',
                albums: '='
            },
            link: function (scope, element, attrs) {
                imageDirectiveService.initializeAlbumSelectionScope(scope);

                scope.moreOptions = {
                    title: 'Album Options',
                    buttons: [{
                        text: 'Edit Album',
                        onClick: function(album) {
                            scope.editAlbum(album);
                        }
                    }]
                };
                scope.moreOptions.delete = {
                    text: 'Delete Album',
                    onClick: function(album) {
                        var confirmPopup = $ionicPopup.confirm({
                            title: 'Delete Album and Pictures Forever?',
                            template: 'Are you sure you want to delete this Album and all of its Pictures forever?',
                            okText: 'Delete',
                            okType: 'button-assertive'
                        });
                        confirmPopup.then(function(res) {
                            if(res) {
                                // Delete album
                                scope.deleteAlbum(album);
                            } else {
                                // Cancelled
                            }
                        });
                    }
                };


            }
        };
    }])
    .directive('albumStackArea', ['commService', 'imageDirectiveService', function(commService, imageDirectiveService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div ng-if="!loadingAlbums">' +

                        '<div ng-if="selectedAlbum">' +
                            '<image-selection album="selectedAlbum" options="options"></image-selection>' +
                        '</div>' +
                        '<div ng-if="!selectedAlbum">' +
                            '<album-selection albums="albums" options="options"></album-selection>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                /* {
                 community: CommunityEntry // The community in which the images will be uploaded/retrieved
                 onSelected(ImageFileEntry, ImageFileComponentEntry),  (ImageFileComponentEntry will only be populated if the user is selecting an image size)
                 onCancelled(),
                 getAlbumStack(onSuccess, onFailure),
                 albumType: string (enum. Values: 'ProfilePicture', 'CoverImage', 'Content', 'Any'),
                 albumId: // if provided, this album will be selected
                 tagPage: TagPageEntry (if provided, we will upload images to this tag page. If not provided, we will upload images to the logged-in account),
                 stepPage: StepPageEntry (if provided, we will upload images to this step page. If not provided, we will upload images to the logged-in account),
                 allowImageSizeSelection: bool (if true, the user can select small, medium or large for the image (the ImageFileComponentEntry will be passed along with the ImageFileEntry). If false, the user can only select the total ImageFileEntry),
                 selectUploadedImage: bool (if true, any uploaded image will be auto-selected),
                 onlyAllowSelection: bool (if true, no edits or deletions can be made).
                 }
                 */
                options: '='
            },
            link: function(scope, elem, attrs) {

                imageDirectiveService.intializeAlbumStackAreaScope(scope);


            }
        };
    }])
    .directive('selectImageArea', ['commService', 'communityService', 'imageDirectiveService', function(commService, communityService, imageDirectiveService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div ng-if="!community">' +
                        '<h3 class="centered">Please select a community to proceed with selecting an album.</h3>' +
                        '<div class="centered" ng-repeat="community in communities">' +
                            '<a style="cursor: pointer;" ng-click="onCommunityChosen(community)"><h3>{{community.Name}}</h3></a>' +
                        '</div>' +
                        '<div>' +
                            '<button class="button button-block button-stable col-80 col-offset-10" type="button" ng-click="cancel()">Cancel</button>' +
                        '</div>' +
                    '</div>' +
                    '<div ng-if="community">' +
                        '<album-stack-area options="options"></album-stack-area>' +
                    '</div>' +
                '</div>',
            scope: {
                /* {
                 community: CommunityEntry // The community in which the images will be uploaded/retrieved
                 onSelected(ImageFileEntry, ImageFileComponentEntry),  (ImageFileComponentEntry will only be populated if the user is selecting an image size)
                 onCancelled(),
                 getAlbumStack(onSuccess, onFailure),
                 albumType: string (enum. Values: 'ProfilePicture', 'CoverImage', 'Content', 'Any'),
                 albumId: // if provided, this album will be selected
                 tagPage: TagPageEntry (if provided, we will upload images to this tag page. If not provided, we will upload images to the logged-in account),
                 stepPage: StepPageEntry (if provided, we will upload images to this step page. If not provided, we will upload images to the logged-in account),
                 allowImageSizeSelection: bool (if true, the user can select small, medium or large for the image (the ImageFileComponentEntry will be passed along with the ImageFileEntry). If false, the user can only select the total ImageFileEntry),
                 selectUploadedImage: bool (if true, any uploaded image will be auto-selected),
                 allowCropping: bool
                 }
                 */
                options: '='
            },
            link: function(scope, elem, attrs) {
                imageDirectiveService.initializeSelectImageAreaScope(scope);

            }
        };
    }])
    .directive('album', ['Lightbox', function(Lightbox) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div>' +
                    '<div><h4>{{album.Title}}</h4></div>' +
                    '<div ng-repeat="image in album.Images">' +
                    '<div style="float: left;">' +
                    '<div><img class="pointer" ng-click="albumClicked(image)" ng-src="{{image.Small.Url | trusted}}"/></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
            scope: {
                album: '=',
                /*
                 {
                 tagPage,
                 stepPage,
                 specialization
                 }
                 */
                options: '=?'
            },
            link: function(scope, elem, attrs) {

                scope.albumClicked = function(selectedImage) {
                    var images = [];
                    var startingIndex = selectedImage ? scope.album.Images.indexOf(selectedImage) : 0;
                    for(var i = 0; i < scope.album.Images.length; i++) {
                        var image = scope.album.Images[i];

                        images.push({
                            imageFileEntry: image,
                            tagPage: scope.options ? scope.options.tagPage : null,
                            stepPage: scope.options ? scope.options.stepPage : null,
                            specialization: scope.options ? scope.options.specialization : null
                        });
                    }

                    Lightbox.openModal(images, startingIndex);
                };
            }
        };
    }])
    .directive('albumStack', ['$upload', 'commService', 'accountService', 'communityService', function($upload, commService, accountService, communityService) {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div ng-repeat="album in albums">' +
                    '<div class="col-xs-12 album-well">' +
                        '<album album="album" options="options"></album>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                albumStack: '=',
                /*
                 {
                 tagPage,
                 stepPage,
                 specialization
                 }
                 */
                options: '=?'
            },
            link: function(scope, elem, attrs) {


                scope.albums = [];
                if(scope.albumStack.ProfilePictures && scope.albumStack.ProfilePictures.Images &&
                    scope.albumStack.ProfilePictures.Images.length > 0) {
                    scope.albums.push(scope.albumStack.ProfilePictures);
                }
                if(scope.albumStack.CoverImages && scope.albumStack.CoverImages.Images &&
                    scope.albumStack.CoverImages.Images.length > 0) {
                    scope.albums.push(scope.albumStack.CoverImages);
                }

                if(scope.albumStack.ContentAlbums) {
                    for(var i = 0; i < scope.albumStack.ContentAlbums.length; i++) {
                        var album = scope.albumStack.ContentAlbums[i];
                        if(album.Images && album.Images.length > 0) {
                            scope.albums.push(album);
                        }
                    }
                }


            }
        };
    }]);