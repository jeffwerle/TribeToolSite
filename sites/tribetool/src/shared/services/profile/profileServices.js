angular.module('app.Services')
    .factory('profileService', ['$rootScope', 'commService', 'accountService', 'communityService', 'friendService', 'imageService', 'navigationService', function($rootScope, commService, accountService, communityService, friendService, imageService, navigationService) {
        return {
            /* The current profile that is loaded. This will be null if we're not on the profile page. */
            currentProfile: null,
            /* The AccountCommunity of the currently loaded profile */
            accountCommunity: null,
            /* Updates communityService.accountCommunity with this.accountCommunity, if applicable */
            propagateAccountCommunity: function() {
                if(this.isSelfProfile() && this.accountCommunity) {
                    communityService.accountCommunity = angular.extend(communityService.accountCommunity, this.accountCommunity);
                }
            },
            getProfile: function(username, onSuccess, onFailure) {
                commService.postWithParams('profile', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetProfileOptions: {
                        Username: username
                    },
                    RequestType: 'GetProfile'
                }, onSuccess, onFailure);
            },
            setProfile: function(profile) {
                this.currentProfile = profile;
                if(profile) {
                    this.accountCommunity = this.currentProfile.AccountCommunity;
                }
                else {
                    this.accountCommunity = null;
                }
            },
            initialize: function() {
                var my = this;
                $rootScope.$on('profilePictureChanged', function(event, imageFileEntry) {
                    my.setProfilePicture(imageFileEntry);
                });
            },
            // onSelect(imageFileEntry)
            selectPicture: function(onSelect, allowImageSizeSelection, selectUploadedImage, albumType, fileOptions) {
                var my = this;
                imageService.selectPicture(onSelect,
                        {
                            getAlbumStack: function(onSuccess, onFailure, community) {
                                my.getAlbumStack(onSuccess, onFailure, community);
                            },
                            allowImageSizeSelection: allowImageSizeSelection,
                            selectUploadedImage: selectUploadedImage,
                            albumType: albumType,
                            fileOptions: fileOptions
                        }
                    );
            },
            setProfilePicture: function(imageFileEntry) {
                if(!communityService.accountCommunity) {
                    communityService.accountCommunity = communityService.newAccountCommunity();
                }
                if(!this.accountCommunity || this.accountCommunity.Id === communityService.accountCommunity.Id) {
                    this.accountCommunity = communityService.accountCommunity;
                }
                communityService.accountCommunity.ProfileImage = imageFileEntry;
                this.accountCommunity.ProfileImage = imageFileEntry;
            },
            setProfilePictureOnServer: function(imageFileEntry, onSuccess, onFailure) {

                var my = this;
                commService.postWithParams('profile', {
                    Credentials: accountService.getCredentials(communityService.community),
                    SetProfilePictureOptions: {
                        Image: imageFileEntry
                    },
                    RequestType: 'SetProfilePicture'
                }, function(data) {

                    // We will set the profile picture in $rootScope.$on('profilePictureChanged')
                    // which was set in profileService.initialize()
                    $rootScope.$broadcast('profilePictureChanged', imageFileEntry);

                    if(onSuccess)
                        onSuccess(data);

                }, onFailure);
            },
            getAlbumStack: function(onSuccess, onFailure, community) {
                var my = this;
                commService.postWithParams('profile', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetAlbumStack'
                }, onSuccess, onFailure);
            },
            getProfilePictureUrl: function(accountCommunity) {
                return accountCommunity && accountCommunity.ProfileImage && accountCommunity.ProfileImage.Medium ? accountCommunity.ProfileImage.Medium.Url : 'images/silhouette-medium.png';
            },
            getCommentProfilePictureUrl: function(accountCommunity, account) {
                if(accountCommunity && accountCommunity.ProfileImage && accountCommunity.ProfileImage.Small)
                    return accountCommunity.ProfileImage.Small.Url;
                if(account && account.ProfileImage && account.ProfileImage.Small)
                    return account.ProfileImage.Small.Url;

                return 'images/silhouette-small.png';
            },
            getUserCommunityUrl: function(profile) {
                if(!profile) {
                    profile = this.currentProfile;
                }
                return 'u-' + profile.Username;
            },
            getProfileFullName: function(profile) {
                if(!profile) {
                    profile = this.currentProfile;
                }
                if(!profile) {
                    return null;
                }
                return profile.FirstName + (angular.isDefined(profile.LastName) && profile.LastName !== null ? ' ' + profile.LastName : '');
            },
            /* Returns a bool indicating whether we're currently on the requesting account's profile */
            isSelfProfile: function() {
                if(!accountService.account || !this.currentProfile) {
                    return false;
                }
                return accountService.account.Id === this.currentProfile.Id;
            },
            getProfileUrl: function(profile, community) {
                if(!profile) {
                    profile = this.currentProfile;
                }
                if(!community) {
                    community = communityService.community;
                }
                return navigationService.getProfileUrl(profile, community);
            },
            getFriendshipWithProfile: function() {
                if(!accountService.account) {
                    return null;
                }

                return friendService.getFriendship(accountService.account.Id, this.accountCommunity);
            }
        };
    }]);