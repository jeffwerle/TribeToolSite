angular.module('app.Services')
    .factory('imageService', ['$rootScope', 'commService', 'accountService', 'communityService', 'modalService', 'navigationService', function($rootScope, commService, accountService, communityService, modalService, navigationService) {
        return {
            getImage: function(imageFileEntry, onSuccess, onFailure, community) {
                var my = this;
                commService.postWithParams('image', {
                    AccountId: accountService.account ? accountService.account.Id : null,
                    SessionId: accountService.getSessionId(),
                    CommunityId: community ? community.Id : communityService.community ? communityService.community.Id : null,
                    RequestType: 'GetImage',
                    ImageFileEntry: {
                        Id: imageFileEntry.Id
                    }
                }, onSuccess, onFailure);
            },
            getImageByUrl: function(url, onSuccess, onFailure, community) {
                var my = this;
                commService.postWithParams('image', {
                    AccountId: accountService.account ? accountService.account.Id : null,
                    SessionId: accountService.getSessionId(),
                    CommunityId: community ? community.Id : communityService.community ? communityService.community.Id : null,
                    RequestType: 'GetImageByUrl',
                    Url: url
                }, onSuccess, onFailure);
            },
            /* Deletes the specified image */
            deleteImage: function(imageFileEntry, onSuccess, onFailure, community) {
                var my = this;
                commService.postWithParams('image', {
                    AccountId: accountService.account.Id,
                    SessionId: accountService.getSessionId(),
                    CommunityId: community ? community.Id : communityService.community ? communityService.community.Id : null,
                    RequestType: 'DeleteFiles',
                    ImageFilesToDelete: [imageFileEntry.Id],
                    AlbumId: imageFileEntry.AlbumId,
                    TagPageId: imageFileEntry.TagPageId
                }, function(data) {

                    if(data.ProfileImage) {
                        $rootScope.$broadcast('profilePictureChanged', data.ProfileImage);
                    }

                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            editImage: function(imageFileEntry, onSuccess, onFailure, community) {
                var my = this;
                commService.postWithParams('image', {
                    AccountId: accountService.account.Id,
                    SessionId: accountService.getSessionId(),
                    CommunityId: community ? community.Id : communityService.community ? communityService.community.Id : null,
                    RequestType: 'EditImage',
                    ImageFileEntry: imageFileEntry
                }, onSuccess, onFailure);
            },
            /*
             onSelect(ImageFileEntry, ImageFileComponentEntry),  (ImageFileComponentEntry will only be populated if the user is selecting an image size)

                options: {
                     community: CommunityEntry // The community in which the images will be uploaded/retrieved
                     onCancelled(),
                     getAlbumStack(onSuccess, onFailure),
                     albumType: string (enum. Values: 'ProfilePicture', 'CoverImage', 'Content', 'Any'),
                     albumId: // if provided, this album will be selected
                     tagPage: TagPageEntry (if provided, we will upload images to this tag page. If not provided, we will upload images to the logged-in account),
                     stepPage: StepPageEntry (if provided, we will upload images to this step page. If not provided, we will upload images to the logged-in account),
                     map: MapEntry (if provided, we will upload images to this map. If not provided, we will upload images to the logged-in account),
                     allowImageSizeSelection: bool (if true, the user can select small, medium or large for the image (the ImageFileComponentEntry will be passed along with the ImageFileEntry). If false, the user can only select the total ImageFileEntry),
                     selectUploadedImage: bool (if true, any uploaded image will be auto-selected),
                     allowCropping: bool
                }
             */
            selectPicture: function(onSelect, options) {
                modalService.open({
                    templateUrl: 'app-templates/images/select-picture.html',
                    controller: 'selectPictureController',
                    windowClass: 'select-picture-modal',
                    backdrop : 'static', // Don't allow click on backdrop to close modal
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    // Modal OK
                    if(onSelect)
                        onSelect(data.imageFileEntry, data.imageFileComponentEntry);
                }, function () {
                    // Modal dismissed
                });

            }


        };
    }]);