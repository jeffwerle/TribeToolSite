angular.module('app.Directives')
    .directive('editFile', ['commService', 'fileService', function(commService, fileService) {
        return {
            replace: false,
            restrict: 'E',
            scope: {
                /* {
                 onEndEditing(),
                 }
                 */
                options: '=',
                /* The FileEntry that is being edited*/
                fileEntry: '='
            },
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Saving...</div>' +
                    '<div ng-show="!processing">' +
                        '<div>' +
                            '<label>Title:</label> <input type="text" required class="form-control" ng-model="title" placeholder="Title">' +
                            '<label>Description:</label> <input type="text" required class="form-control" ng-model="description" placeholder="Description">' +

                        '</div>' +

                        '<div class="row" style="clear:both;">' +
                            '<div class="col-xs-12" style="margin-top:10px;">' +
                                '<button class="btn btn-primary" type="button" ng-click="submitEdit()">Save</button>' +
                                '<button class="btn btn-warning" type="button" style="margin-left: 10px;" ng-click="cancel()">Cancel</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.cancel = function() {
                    scope.resetToOriginal();
                    scope.options.onEndEditing();
                };

                scope.oDescription = scope.description = scope.fileEntry.Description;
                scope.oTitle = scope.title = scope.fileEntry.Title;

                scope.resetToOriginal = function() {
                    scope.fileEntry.Description = scope.oDescription;
                    scope.fileEntry.Title = scope.oTitle;
                };
                scope.submitEdit = function() {
                    if(scope.description === scope.oDescription &&
                        scope.title === scope.oTitle) {
                        // Nothing changed, no need to submit.
                        scope.options.onEndEditing();
                        return;
                    }

                    scope.fileEntry.Description = scope.description;
                    scope.fileEntry.Title = scope.title;
                    scope.processing = true;
                    fileService.editFile(scope.fileEntry, function(data) {
                        // success
                        commService.showSuccessAlert('File edited successfully!');
                        scope.processing = false;
                        scope.options.onEndEditing();
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        scope.resetToOriginal();
                        commService.showErrorAlert(data);
                    });
                };
            }
        };
    }])
    .directive('uploadFile', ['$upload', 'commService', 'accountService', 'communityService', function($upload, commService, accountService, communityService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Uploading File...</div>' +
                    '<div ng-show="!processing">' +
                        '<h4>Upload File:</h4>' +
                        '<div style="margin-top: 20px; margin-bottom: 20px;">' +
                            '<p ng-show="fileOptions.fileUploadError" style="color: red;">{{fileOptions.fileUploadError}}</p>' +
                            '<p ng-show="fileOptions.fileUploadSuccess" style="color: green;">{{fileOptions.fileUploadSuccess}}</p>' +
                        '</div>' +
                        '<input type="file" ng-file-select="setFiles($files)">' +

                        '<div ng-show="!files" style="margin-top:20px;">' +
                            '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                        '</div>' +
                    '</div>' +

                    '<div class="row" ng-show="files && !processing">' +
                        '<div class="col-xs-6">' +
                            '<div style="margin-top:20px;">' +
                                '<label>Title:</label> <input type="text" required class="form-control" ng-model="title" placeholder="Title">' +
                                '<label>Description:</label> <input type="text" required class="form-control" ng-model="description" placeholder="Description">' +

                            '</div>' +
                            '<div style="margin-top:20px;">' +
                                '<button class="btn btn-primary" type="button" ng-click="uploadFiles()" style="margin-right: 20px;">Upload File</button>' +
                                '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '='
            },
            link: function (scope, element, attrs) {

                scope.cancel = function() {
                    scope.files = null;
                    scope.options.onEndUploading();
                };

                scope.handleFileSelect = function($files) {
                    var $file = $files[0];
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        scope.$apply(function(scope){
                            scope.myFile = evt.target.result;
                        });
                    };
                    reader.readAsDataURL($file);
                };

                scope.fileOptions = {
                    fileUploadError: null,
                    fileUploadSuccess: null
                };
                scope.files = null;

                scope.setFiles = function($files) {
                    scope.files = $files;
                    scope.handleFileSelect($files);
                };


                scope.processing = false;
                scope.uploadFiles = function() {

                    scope.fileOptions.fileUploadSuccess = null;

                    var $files = scope.files;
                    if(!$files) {
                        scope.fileOptions.fileUploadError = 'Please select a file to upload and then click Upload.';
                        return;
                    }

                    scope.fileOptions.fileUploadError = null;

                    scope.processing = true;
                    //$files: an array of files selected, each file has name, size, and type.
                    var url = commService.getServiceUrl() + '/file';
                    var file = $files[0];

                    var data = {
                        AccountId: accountService.account.Id,
                        SessionId: accountService.getSessionId(),
                        CommunityId: communityService.community ? communityService.community.Id : '',
                        RequestType: 'UploadFiles'
                    };
                    if(scope.title) {
                        data.Title = scope.title;
                    }
                    if(scope.description) {
                        data.Description = scope.description;
                    }
                    if(scope.options) {
                        if(scope.options.stepPage) {
                            data.StepPageId = scope.options.stepPage.Id;
                        }
                    }
                    scope.upload = $upload.upload({
                        url: url,
                        method: 'POST',
                        // headers: {'header-key': 'header-value'},
                        // withCredentials: true,
                        data: data,
                        file: file
                        /* set the file formData name ('Content-Desposition'). Default is 'file' */
                    }).progress(function(evt) {
                            //console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                        }).success(function(data, status, headers, config) {
                            scope.processing = false;
                            // file is uploaded successfully
                            if(!data.Success) {
                                scope.fileOptions.fileUploadError = data.ErrorReason;
                                commService.showErrorAlert(scope.fileOptions.fileUploadError);
                            }
                            else if(!data.Files) {
                                scope.fileOptions.fileUploadError = 'The file was uploaded but there was an error retrieving its information.';
                                commService.showErrorAlert(scope.fileOptions.fileUploadError);
                                scope.files = null;
                            }
                            else {
                                scope.fileOptions.fileUploadSuccess = 'File Uploaded successfully!';
                                commService.showSuccessAlert(scope.fileOptions.fileUploadSuccess);
                                scope.files = null;
                                if(!scope.fileEntries) {
                                    scope.fileEntries = [];
                                }
                                scope.fileEntries.push(data.Files[0]);

                                scope.options.onEndUploading(data.Files[0]);

                            }
                        }).error(function(data, status, headers, config) {
                            scope.processing = false;
                            // file error
                            scope.fileOptions.fileUploadError = data;
                            commService.showErrorAlert(data);
                        });
                };
            }
        };
    }])
    .directive('fileSelection', ['$upload', 'commService', 'accountService', 'communityService', 'fileService', function($upload, commService, accountService, communityService, fileService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isDeleting">' +
                        '<loading></loading> Deleting...' +
                    '</div>' +
                    '<div ng-if="isUploading">' +
                        '<upload-file options="options"></upload-file>' +
                    '</div>' +
                    '<div ng-if="isEditing">' +
                        '<edit-file file-entry="fileToEdit" options="options"></edit-file>' +
                    '</div>' +
                    '<div ng-if="!isUploading && !isEditing && !isDeleting">' +
                        '<div><button class="btn btn-primary" type="button" ng-click="beginUploading()"><i class="fa fa-plus"></i> Upload File</button></div>' +

                        '<div ng-repeat="file in files">' +
                            '<div class="col-sm-4 dark-well">' +
                                '<div  class="centered">' +

                                    '<div><label>Url:</label> <a ng-href="{{file.Url}}" target="_blank">{{file.Url}}</a></div>' +
                                    '<div><label>Title:</label> {{file.Title}}</div>' +
                                    '<div><label>Description:</label> {{file.Description}}</div>' +
                                    '<div><label>File Type:</label> {{file.FileType}}</div>' +

                                    '<div style="margin-top:10px;">' +
                                        '<button ng-show="!consideringDeletion" class="btn btn-primary" ng-click="editFile(file)"><i class="fa fa-pencil"></i></button>' +
                                        '<button ng-show="!consideringDeletion" class="btn btn-danger" ng-click="consideringDeletion = true" style="margin-left: 10px;"><i class="fa fa-times"></i></button>' +

                                        '<div ng-show="consideringDeletion">' +
                                            '<div style="font-weight: bold; color: red; margin-top: 10px;">Are you sure you want to delete this file?</div>' +
                                            '<div><button class="btn btn-warning" type="button" ng-click="consideringDeletion = false" style="margin-top: 10px;">Cancel</button></div>' +
                                            '<div><button class="btn btn-danger" type="button" ng-click="deleteFile(file)" style="margin-top: 5px;">Delete</button></div>' +
                                        '</div>' +
                                    '</div>' +

                    /*
                                    '<div ng-show="!consideringDeletion">' +
                                        '<button class="btn btn-primary" ng-click="selectFile(file)" style="margin-top:10px;">Select File</button>' +
                                    '</div>' +
                                    */
                                '</div>' +
                            '</div>' +


                        '</div>' +

                        '<div class="row" style="clear:both;">' +
                            '<div class="col-xs-12"><button class="btn btn-warning pull-right" type="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button></div>' +
                        '</div>' +

                    '</div>',
            scope: {
                options: '=',
                album: '=',
                files: '='
            },
            link: function (scope, element, attrs) {

                scope.isEditing = false;
                scope.isUploading = false;

                scope.options.onEndEditing = function() {
                    scope.isEditing = false;
                    scope.fileToEdit = null;
                };

                scope.editFile = function(fileEntry) {
                    scope.fileToEdit = fileEntry;
                    scope.isEditing = true;
                };

                scope.options.onEndUploading = function(fileEntry) {
                    scope.isUploading = false;
                    if(fileEntry) {
                        // The file was uploaded
                        scope.files.splice(0, 0, fileEntry);
                    }
                    else {
                        // Upload cancelled before uploading
                    }
                };

                scope.beginUploading = function() {
                    scope.isUploading = true;
                };

                scope.deleteFile = function(fileEntry) {
                    scope.isDeleting = true;
                    fileService.deleteFile(fileEntry, function(data) {
                        // Remove the file from the files array
                        var indexOfFile = scope.files.indexOf(fileEntry);
                        if(indexOfFile >= 0) {
                            scope.files.splice(indexOfFile, 1);
                        }

                        scope.isDeleting = false;
                        commService.showSuccessAlert('File deleted successfully!');
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.isDeleting = false;
                    });
                };

                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };

                scope.selectFile = function(fileEntry) {
                    if(scope.options && scope.options.onSelected) {
                        scope.options.onSelected(fileEntry);
                    }
                };
            }
        };
    }])
    .directive('selectFileArea', ['$upload', 'commService', 'accountService', 'communityService', function($upload, commService, accountService, communityService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template:
                '<div class="col-md-12" style="float: none; margin-bottom:20px; margin-top: 20px;">' +
                    '<div ng-show="loadingFiles">' +
                        '<loading></loading>Loading Files...' +
                        '<div class="row" style="clear:both;">' +
                            '<div class="col-xs-12"><button class="btn btn-warning pull-right" type="button" style="margin-top:20px;" ng-click="cancel()">Cancel</button></div>' +
                        '</div>' +
                    '</div>' +

                    '<div ng-if="!loadingFiles">' +
                        '<file-selection files="files" options="options"></file-selection>' +
                    '</div>' +

                '</div>',
            scope: {
                /* {
                 onSelected(FileEntry),
                 onCancelled(),
                 getFiles(onSuccess, onFailure),
                 stepPage: StepPageEntry,
                 }
                 */
                options: '='
            },
            link: function(scope, elem, attrs) {


                scope.loadingFiles = true;
                scope.options.getFiles(function(data) {
                    scope.files = data.Files;
                    if(!scope.files) {
                        scope.files = [];
                    }
                     scope.loadingFiles = false;

                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    scope.loadingFiles = false;
                });

                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };


            }
        };
    }])
    .directive('fileView', ['toolbarService', function (toolbarService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<h4 style="margin-top: 0px; margin-bottom: 0px; font-weight: bold;">{{file.Title}}</h4>' +
                    '<p>{{file.Description}}</p>' +
                    '<p><label>File Type: </label> {{file.FileType}}</p>' +
                    '<a class="action-link" ng-href="{{file.Url}}" target="_blank">Download</a>' +
                '</div>',
            scope: {
                file: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('filesViewArea', ['communityService', function (communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="well">' +
                        '<div ng-repeat="file in files" id="{{file.fileElementId}}">' +
                            '<div class="col-sm-4 white-well" style="margin-bottom: 0px;">' +
                                '<file-view class="centered" id="{{playlist.playlistElementId}}" file="file"></file-view>' +
                            '</div>' +
                        '</div>' +
                        '<div class="clearfix"></div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                files: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    }]);