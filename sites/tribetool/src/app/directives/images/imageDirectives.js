angular.module('app.Directives')
    .directive('editImage', ['imageDirectiveService',  function(imageDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Saving...</div>' +
                    '<div ng-show="!processing">' +
                        '<div><img ng-src="{{imageFileEntry.Medium.Url | trusted}}"/></div>' +

                        '<div>' +
                            '<label>Alt Text:</label> <input type="text" required class="form-control" ng-model="imageFileEntry.Alt" placeholder="Alt Text">' +
                            '<label>Title:</label> <input type="text" required class="form-control" ng-model="imageFileEntry.Title" placeholder="Title">' +
                            '<label>Tags (#tag):</label> <tag-content-editor is-required="false" text="form.tagText" tags="form.tags" final-tag-text="form.finalTagText" placeholder="\'Put your #tags here...\'"></tag-content-editor>' +
                        '</div>' +

                        '<div class="row" style="clear:both;">' +
                            '<div class="col-xs-12" style="margin-top:10px;">' +
                                '<button class="btn btn-primary" type="button" ng-click="submitEdit()">Save</button>' +
                                '<button class="btn btn-warning" type="button" style="margin-left: 10px;" ng-click="cancel()">Cancel</button>' +
                            '</div>' +
                        '</div>' +
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
            }
        };
    }])
    .directive('uploadImage', ['$upload', 'commService', 'accountService', 'communityService', '$timeout', 'imageDirectiveService', function($upload, commService, accountService, communityService, $timeout, imageDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<file-dropzone file-options="fileDropzoneOptions" on-file-dropped="onFileDropped()">' +

                        '<div ng-show="processing"><loading></loading> Uploading File...</div>' +
                        '<div ng-show="!processing">' +
                            '<h4>Upload File to Album "{{album.Title}}":</h4>' +
                            '<div style="margin-top: 20px; margin-bottom: 20px;">' +
                                '<p ng-show="fileOptions.imageUploadError" style="color: red;">{{fileOptions.imageUploadError}}</p>' +
                                '<p ng-show="fileOptions.imageUploadSuccess" style="color: green;">{{fileOptions.imageUploadSuccess}}</p>' +
                            '</div>' +


                            '<div ng-show="!files" style="width: 250px; height: 80px; border: 1px solid #ccc;  padding: 30px; margin-bottom: 20px; text-align: center;">' +
                                '<div>Drop Your Image Here</div>' +
                            '</div>' +


                            '<input type="file" ng-file-select="setFiles($files)">' +

                            '<div ng-show="!files" style="margin-top:20px;">' +
                                '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                            '</div>' +
                        '</div>' +

                        '<div class="row" ng-show="files">' +
                            '<div class="col-xs-6">' +
                                '<div class="cropArea" style="overflow: hidden; height: 200px;">' +
                                    '<img-crop allow-cropping="allowCropping" image="myImage" result-image="myCroppedImage" result-image-quality="1" area-type="imageData.areaType" original-data="imageData.originalData"></img-crop>' +
                                '</div>' +
                                '<div class="row">' +
                                    '<div class="col-xs-6 centered"><button class="btn btn-primary" type="button" ng-click="rotateRight()"><i class="fa fa-repeat"></i></button></div>' +
                                    '<div class="col-xs-6 centered"><button class="btn btn-primary" type="button" ng-click="rotateLeft()"><i class="fa fa-undo"></i></button></div>' +
                                '</div>' +
                                '<div ng-show="!processing && allowCropping">' +
                                    '<select class="centered form-control" ng-model="imageData.areaType">' +
                                        '<option ng-repeat="areaType in areaTypes">{{areaType}}</option>' +
                                    '</select>' +
                                    '<div class="centered">' +
                                        '<button ng-show="imageData.area" class="btn btn-primary" type="button" ng-click="maximizeCrop()">Maximize Crop</button>' +
                                    '</div>' +
                                '</div>' +

                                '<div ng-show="!processing">' +
                                    '<label>Title:</label> <input type="text" required class="form-control" ng-model="form.title" placeholder="Title">' +
                                    '<label>Alt Text:</label> <input type="text" required class="form-control" ng-model="form.altText" placeholder="Alt Text">' +
                                    '<label>Tags (#tag):</label> <tag-content-editor is-required="false" text="form.tagText" tags="form.tags" final-tag-text="form.finalTagText" placeholder="\'Put your #tags here...\'"></tag-content-editor>' +

                                '</div>' +
                            '</div>' +
                            '<div class="col-xs-6">' +
                                '<div ng-if="allowCropping" id="croppedImageContainer" class="centered">' +
                                    '<img id="croppedImage" ng-src="{{myCroppedImage}}" ng-class="{\'rotate-90\': form.rotation === 90, \'rotate-180\': form.rotation === 180, \'rotate-270\': form.rotation === 270}"/>' +
                                '</div>' +
                                '<div ng-show="!processing" style="margin-top:20px;">' +
                                    '<button class="btn btn-primary" type="button" ng-click="uploadFiles()" style="margin-right: 20px; margin-bottom: 10px;">Upload File</button>' +
                                    '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</file-dropzone>' +
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

                scope.onFileDropped = function() {
                    if(!scope.processing && scope.fileDropzoneOptions.file) {
                        scope.myImage = scope.fileDropzoneOptions.fileAsDataUrl;
                        scope.files = [scope.fileDropzoneOptions.file];
                    }
                };

                scope.fileDropzoneOptions = scope.options.fileOptions || {
                    file: null,
                    fileName: null
                };
                if(scope.fileDropzoneOptions.file) {
                    $timeout(function() {
                        scope.onFileDropped();
                    });

                }


                scope.areaTypes = ['rectangle', 'square'];
                scope.imageData = {
                    areaType: 'rectangle',
                    originalData: {},
                    area: null,
                    cropHost: null,
                    events: null
                };
                scope.form = {
                    title: '',
                    altText: '',
                    tagText: '',
                    finalTagText: '',
                    tags: [],
                    rotation: 0 // 0, 90, 180, 270
                };

                imageDirectiveService.initializeUploadImageScope(scope);

                scope.$watch('imageData.originalData', function(value) {
                    if(value) {
                        if(value.canvas) {
                            $('#croppedImageContainer').height(value.canvas.height).width(value.canvas.width);
                        }
                        if(value.area) {
                            scope.imageData.area = value.area;
                            var size = value.area.getSize();
                            $('#croppedImage').height(size.h).width(size.w);
                        }
                        if(value.cropHost) {
                            scope.imageData.cropHost = value.cropHost;
                        }
                        if(value.events) {
                            scope.imageData.events = value.events;
                        }
                    }
                });
                scope.maximizeCrop = function() {


                    if(scope.imageData.area) {
                        scope.imageData.area.maximizeCrop();
                        scope.imageData.events.trigger('image-updated');
                    }

                    /*
                    // For Debugging: Sets the cropped image to the current full-quality data uri.
                    $timeout(function() {
                        scope.myCroppedImage = scope.imageData.cropHost.getResultImageDataURIFullQuality();
                        scope.imageData.originalData.updateResultImage(scope.myCroppedImage);
                    });
                    */
                };

                scope.cancel = function() {
                    scope.files = null;
                    scope.options.onEndUploading();
                };

                // The Base64 image data
                scope.myImage='';
                scope.myCroppedImage='';

                scope.handleFileSelect = function($files) {
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        scope.$apply(function(scope){
                            scope.myImage = evt.target.result;
                        });
                    };
                    reader.readAsDataURL($files[0]);
                };

                scope.fileOptions = {
                    imageUploadError: null,
                    imageUploadSuccess: null
                };
                scope.files = null;

                scope.setFiles = function($files) {
                    scope.files = $files;
                    scope.handleFileSelect($files);
                };


                scope.processing = false;
                scope.uploadFiles = function() {



                    scope.fileOptions.imageUploadSuccess = null;

                    if(!scope.files) {
                        scope.fileOptions.imageUploadError = 'Please select a file to upload and then click Upload.';
                        return;
                    }

                    scope.fileOptions.imageUploadError = null;


                    scope.processing = true;

                    var upload = function() {
                        var url = commService.getServiceUrl() + '/image';
                        var file = scope.files[0];

                        // If the scope.processing directive is going to hide
                        // the canvas then we MUST set scope.myCroppedImage BEFORE we do scope.processing = true
                        // because the ng-show will hide the image canvas and will mess with the DataURI
                        // that we are returned from the cropHost.
                        // Since we won't have it hide the canvas, we're fine
                        if(scope.allowCropping && scope.imageData.cropHost)
                            scope.myCroppedImage = scope.imageData.cropHost.getResultImageDataURIFullQuality();

                        var imageBase64 = scope.allowCropping ? scope.myCroppedImage : '';

                        var data = imageDirectiveService.getUploadImageServiceParameters(scope, imageBase64);


                        //var imageBase64File = new Blob([imageBase64], {type : 'text/plain'});
                        //file = imageBase64File;


                        scope.upload = $upload.upload({
                            url: url,
                            method: 'POST',
                            // headers: {'header-key': 'header-value'},
                            // withCredentials: true,
                            data: data,
                            file: file
                        }).progress(function(evt) {
                                //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                            }).success(function(data, status, headers, config) {
                                scope.processing = false;
                                // file is uploaded successfully
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
                            }).error(function(data, status, headers, config) {
                                scope.processing = false;
                                // file error
                                scope.fileOptions.imageUploadError = data;
                                commService.showErrorAlert(data);
                            });

                    };

                    // Upload after we've set scope.processing (because it may take a moment
                    // to get the data URI for the image
                    $timeout(function() {
                        upload();
                    });
                };
            }
        };
    }])
    .directive('imageSelection', ['imageDirectiveService', function(imageDirectiveService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isDeleting">' +
                        '<loading></loading> Deleting...' +
                    '</div>' +
                    '<div ng-if="isUploading && !options.onlyAllowSelection">' +
                        '<upload-image options="options" album="album"></upload-image>' +
                    '</div>' +
                    '<div ng-if="isEditing && !options.onlyAllowSelection">' +
                        '<edit-image image-file-entry="imageToEdit" options="options"></edit-image>' +
                    '</div>' +
                    '<div ng-if="!isUploading && !isEditing && !isDeleting">' +
                        '<file-dropzone file-options="options.fileOptions" on-file-dropped="onFileDropped(album)">' +
                            '<div ng-show="!options.onlyAllowSelection"><button class="btn btn-primary" type="button" ng-click="beginUploading()"><i class="fa fa-plus"></i> Upload Image</button></div>' +
                            '<h4>Album: {{album.Title}}</h4>' +
                            '<div ng-repeat="image in images">' +
                                '<div class="col-sm-4 image-well">' +
                                    '<div  class="centered">' +

                                        '<img class="pointer" ng-click="imageClicked(image)" ng-src="{{image.Medium.Url | trusted}}">' +
                                        '<div><label>Title:</label> {{image.Title}}</div>' +
                                        '<div><label>Alt Text:</label> {{image.Alt}}</div>' +
                                        '<div><label>Tags:</label> <div btf-markdown="image.TagText"></div></div>' +

                                        '<div ng-show="!options.onlyAllowSelection" style="margin-top:10px;">' +
                                            '<button ng-show="!consideringDeletion" class="btn btn-primary" ng-click="editImage(image)"><i class="fa fa-pencil"></i></button>' +
                                            '<button ng-show="!consideringDeletion" class="btn btn-danger" ng-click="consideringDeletion = true" style="margin-left: 10px;"><i class="fa fa-times"></i></button>' +

                                            '<div ng-show="consideringDeletion">' +
                                                '<div style="font-weight: bold; color: red; margin-top: 10px;">Are you sure you want to delete this picture?</div>' +
                                                '<div><button class="btn btn-warning" type="button" ng-click="consideringDeletion = false" style="margin-top: 10px;">Cancel</button></div>' +
                                                '<div><button class="btn btn-danger" type="button" ng-click="deleteImage(image)" style="margin-top: 5px;">Delete</button></div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div ng-show="!consideringDeletion">' +
                                            '<div ng-if="options.allowImageSizeSelection">' +
                                                '<button class="btn btn-primary" style="margin-top:10px;" ng-click="selectImage(image, image.Small)">Small</button> <button class="btn btn-primary" style="margin-top:10px;" ng-click="selectImage(image, image.Medium)">Medium</button> <button class="btn btn-primary" style="margin-top:10px;" ng-click="selectImage(image, image.Full)">Large</button>' +
                                            '</div>' +
                                            '<div ng-if="!options.allowImageSizeSelection">' +
                                                '<button class="btn btn-primary" ng-click="selectImage(image)" style="margin-top:10px;">Select Picture</button>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            '<div class="row" style="clear:both;">' +
                                '<div class="col-xs-12"><button class="btn btn-warning pull-right" type="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button></div>' +
                            '</div>' +
                        '</file-dropzone>' +
                    '</div>' +

                '</div>',
            scope: {
                options: '=',
                album: '='
            },
            link: function (scope, element, attrs) {
                imageDirectiveService.initializeImageSelectionScope(scope);
            }
        };
    }])
    .directive('editAlbum', ['imageDirectiveService', function(imageDirectiveService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Saving...</div>' +
                    '<div ng-show="!processing">' +
                        '<form ng-submit="save()">' +
                            '<div>' +
                                '<label>Title:</label> <input type="text" required class="form-control" ng-model="album.Title" placeholder="Title">' +

                            '</div>' +
                            '<div style="margin-top:20px;">' +
                                '<button class="btn btn-primary" type="submit" style="margin-right: 20px;">Save Album</button>' +
                                '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '=',
                album: '='
            },
            link: function (scope, element, attrs) {
                imageDirectiveService.initializeEditAlbumScope(scope);
            }
        };
    }])
    .directive('albumSelection', ['imageDirectiveService', function(imageDirectiveService) {
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
                                        '<button class="btn btn-primary" type="button" ng-click="beginUploading()"><i class="fa fa-plus"></i> Upload Image</button>' +
                                    '</div>' +

                                    '<div ng-if="tagPage" style="font-weight: bold;">{{tagPage.Tag}}</div>' +
                                    '<div style="font-weight: bold;">Search for a Tag picture or browse your pictures below:</div>' +
                                    '<tag-page-search-bar options="tagPageSearchOptions"></tag-page-search-bar>' +

                                    '<div ng-repeat="album in albums">' +
                                        '<file-dropzone file-options="options.fileOptions" on-file-dropped="onFileDropped(album)">' +
                                            '<div class="col-xs-12 album-well">' +

                                                '<div><h4>{{album.Title}}</h4></div>' +
                                                '<div ng-repeat="image in album.Images">' +
                                                    '<div class="pointer" ng-click="selectAlbum(album)" style="float: left;">' +
                                                        '<div><img ng-src="{{image.Small.Url | trusted}}"/></div>' +
                                                    '</div>' +
                                                '</div>' +

                                                '<div style="clear:both;">' +
                                                    '<button style="margin-top:20px;" ng-show="!consideringDeletion" class="btn btn-primary" ng-click="selectAlbum(album)" >Select Album</button>' +
                                                    '<span ng-show="album.AlbumType === \'Content\' && !options.onlyAllowSelection"><a style="margin-top:20px;" class="action-link-grey pull-right" ng-show="!showDeletionButton" ng-click="showDeletionButton = true">Delete</a> <a style="margin-top:20px; margin-right: 20px;" class="action-link pull-right" ng-click="editAlbum(album)">Edit</a></span>' +
                                                    '<button style="margin-top:20px;" ng-show="!consideringDeletion && showDeletionButton" class="btn btn-danger pull-right" ng-click="consideringDeletion = true"><i class="fa fa-times"></i> Delete</button>' +

                                                    '<div ng-show="consideringDeletion">' +
                                                        '<div style="font-weight: bold; color: red; margin-top: 10px;">Are you sure you want to delete this album and all of its pictures?</div>' +
                                                        '<button class="btn btn-warning" type="button" ng-click="consideringDeletion = false; showDeletionButton = false" style="margin-top: 5px; margin-right: 10px;">Cancel</button>' +
                                                        '<button class="btn btn-danger" type="button" ng-click="deleteAlbum(album)" style="margin-top: 5px;">Delete All Pictures</button>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</file-dropzone>' +

                                        '<div class="clearfix"></div>' +
                                    '</div>' +

                                    '<div style="margin-top: 10px;" ng-show="!options.onlyAllowSelection"><button class="btn btn-primary" type="button" ng-click="addNewAlbum()"><i class="fa fa-plus"></i> Add New Album</button></div>' +

                                    '<div class="row" style="clear:both;">' +
                                        '<div class="col-xs-12"><button class="btn btn-warning pull-right" type="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button></div>' +
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
            }
        };
    }])
    .directive('albumStackArea', ['commService', 'imageDirectiveService', function(commService, imageDirectiveService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="col-md-12" style="float: none; margin-bottom:20px; margin-top: 20px;">' +
                    '<div ng-show="loadingAlbums">' +
                        '<loading></loading>Loading Albums...' +
                        '<div class="row" style="clear:both;">' +
                            '<div class="col-xs-12"><button class="btn btn-warning pull-right" type="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button></div>' +
                        '</div>' +
                '</div>' +

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
                '<div class="col-md-12" style="float: none; margin-bottom:20px; margin-top: 20px;">' +
                    '<div ng-if="!community">' +
                        '<h3 class="centered">Please select a community to proceed with Images.</h3>' +
                        '<perfect-scrollbar class="scroller" style="height: 200px;" suppress-scroll-x="true" >' +
                            '<div class="centered" ng-repeat="community in communities">' +
                                '<a style="cursor: pointer;" ng-click="onCommunityChosen(community)"><h3>{{community.Name}}</h3></a>' +
                            '</div>' +
                        '</perfect-scrollbar>' +
                        '<div class="row" style="clear:both;">' +
                            '<div class="col-xs-12"><button class="btn btn-warning pull-right" type="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button></div>' +
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