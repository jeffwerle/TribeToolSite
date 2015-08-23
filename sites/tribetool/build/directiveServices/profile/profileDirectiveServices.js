angular.module('app.Services')
    .factory('profileDirectiveService', ['profileService', 'communityService', 'metaService', 'commService', function(profileService, communityService, metaService, commService) {
        return {
            initializeProfilePageScope: function(scope) {
                scope.$watch('profileService.currentProfile', function(newValue) {
                    if(!newValue) {
                        return;
                    }

                    profileService.propagateAccountCommunity();

                    // Set the meta data
                    var fullName = profileService.getProfileFullName(profileService.currentProfile);
                    if(metaService.setTitle)
                        metaService.setTitle('Tribe Tool: ' + fullName + ' ' + communityService.community.Name);
                    if(metaService.setDescription)
                        metaService.setDescription('See ' + fullName + '\'s friends and activity in the ' + communityService.getNameWithoutThe() + ' Community.');
                });
            },
            initializeProfilePageProfilePictureScope: function(scope) {
                var profile = profileService.currentProfile;
                scope.showLevel = false;
                scope.fullName = profileService.getProfileFullName(profile);
                scope.username = profile.Username;
                scope.accountCommunity = profileService.accountCommunity;
                scope.profilePictureUrl = profileService.getProfilePictureUrl(scope.accountCommunity);
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.canChangeProfilePicture = scope.isSelfProfile;

                scope.showLightBoxOptions = {
                    imageFileEntry: scope.accountCommunity.ProfileImage
                };

                scope.fileDropzoneOptions = { };
                scope.onFileDropped = function() {
                    if(scope.canChangeProfilePicture)
                        scope.changeProfilePicture(scope.fileDropzoneOptions);
                };

                scope.profilePictureClicked = function() {
                    if(scope.canChangeProfilePicture && !scope.accountCommunity.ProfileImage) {
                        scope.changeProfilePicture();
                    }
                    else {
                        // View the image
                    }
                };

                if(scope.isSelfProfile) {
                    scope.$on('profilePictureChanged', function(event, imageFileEntry) {
                        // Load the profile picture!
                        scope.accountCommunity = profileService.accountCommunity;
                        scope.profilePictureUrl = imageFileEntry.Medium.Url;
                    });
                }

                scope.changeProfilePicture = function(fileOptions) {
                    if(!scope.canChangeProfilePicture) {
                        return;
                    }

                    profileService.selectPicture(function(imageFileEntry) {
                            // picture selected
                            // Set it as the profile picture
                            scope.settingProfilePicture = true;
                            profileService.setProfilePictureOnServer(imageFileEntry, function(data) {
                                // success
                                // We're take care of setting the imageFileEntry in scope.$on('profilePictureChanged')
                                scope.settingProfilePicture = false;
                            }, function(data) {
                                // Failure
                                commService.showErrorAlert(data);
                                scope.settingProfilePicture = false;
                            });
                        }, /*allowImageSizeSelection*/ false,
                        /*selectUploadedImage*/true,
                        /*albumType*/ 'ProfilePicture',
                        /*fileOptions*/fileOptions);
                };
            }
        };
    }]);