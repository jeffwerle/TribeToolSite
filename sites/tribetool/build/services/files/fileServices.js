angular.module('app.Services')
    .factory('fileService', ['$rootScope', 'commService', 'accountService', 'communityService', 'modalService', function($rootScope, commService, accountService, communityService, modalService) {
        return {
            /* Deletes the specified file */
            deleteFile: function(fileEntry, onSuccess, onFailure) {
                var my = this;
                commService.deleteWithParams('file', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'DeleteFiles',
                    FilesToDelete: [fileEntry.Id],
                    StepPageId: fileEntry.StepPageId
                }, onSuccess, onFailure);
            },
            editFile: function(fileEntry, onSuccess, onFailure) {
                var my = this;
                commService.deleteWithParams('file', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'EditFile',
                    FileEntry: fileEntry,
                    StepPageId: fileEntry.StepPageId
                }, onSuccess, onFailure);
            },
            // onSelect(fileEntry)
            // stepPage: StepPageEntry (only applicable if uploading files to a StepPage)
            selectFile: function(onSelect, options) {
                modalService.open({
                    templateUrl: 'app-templates/files/select-file.html',
                    controller: 'selectFileController',
                    windowClass: 'select-file-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    // Modal OK
                    if(onSelect)
                        onSelect(data.fileEntry);
                }, function () {
                    // Modal dismissed
                });

            }
        };
    }]);