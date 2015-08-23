angular.module('app.Services')
    .factory('mobileShareService', ['shareService', '$cordovaSocialSharing', 'ionicHelperService', 'communityService', 'commService', 'ionicHelperService', '$ionicLoading', function(shareService, $cordovaSocialSharing, ionicHelperService, communityService, commService, ionicHelperService, $ionicLoading) {
        return {
            share: function() {

                var onSuccess = function(result) {
                    // Success!
                };
                var onError = function(err) {
                    // An error occured. Show a message to the user
                    commService.showErrorAlert('Error');
                    commService.showErrorAlert(err);
                    $ionicLoading.hide();
                };

                var link = shareService.getLink();
                var text = shareService.getDescription();
                var image = shareService.getImageUrl();
                var options = {
                    title: 'Sharing Options',
                    buttons: [{
                        text: communityService.community.Name,
                        onClick: function() {
                            shareService.onShare();
                        }
                    }]
                };

                var share = function() {
                    $ionicLoading.hide();

                    // If we can only share in our current community then don't prompt
                    if(options.buttons.length <= 1) {
                        shareService.onShare();
                    }
                    else {
                        var actionSheet = ionicHelperService.getActionSheet(options);
                        actionSheet.show();
                    }
                };

                var determineEmailAvailability = function() {
                    $cordovaSocialSharing.canShareViaEmail()
                        .then(function() {
                            options.buttons.push({
                                text: 'Email',
                                onClick: function() {
                                    // http://ngcordova.com/docs/plugins/socialSharing/
                                    $cordovaSocialSharing
                                        .shareViaEmail(text + ' ' + link, communityService.community.Name + ' Stuff!')
                                        .then(onSuccess, onError);
                                }
                            });
                            share();
                        }, function() {
                            // Email not available
                            share();
                        });
                };

                var determineWhatsAppAvailability = function() {
                    $cordovaSocialSharing.canShareVia('whatsapp', text, image, link)
                        .then(function() {
                            options.buttons.push({
                                text: 'WhatsApp',
                                onClick: function() {
                                    $cordovaSocialSharing
                                        .shareViaWhatsApp(text, image, link)
                                        .then(onSuccess, onError);
                                }
                            });
                            determineEmailAvailability();
                        }, function() {
                            // Whatsapp not available
                            determineEmailAvailability();
                        });
                };

                var determineTwitterAvailability = function() {
                    $cordovaSocialSharing.canShareVia('twitter', text, image, link)
                        .then(function() {
                            options.buttons.push({
                                text: 'Twitter',
                                onClick: function() {
                                    $cordovaSocialSharing
                                        .shareViaTwitter(text, image, link)
                                        .then(onSuccess, onError);
                                }
                            });
                            determineWhatsAppAvailability();
                        }, function() {
                            // Twitter not available
                            determineWhatsAppAvailability();
                        });
                };

                var determineFacebookAvailablility = function() {
                    $cordovaSocialSharing.canShareVia('facebook', text, image, link)
                        .then(function() {
                            options.buttons.push({
                                text: 'Facebook',
                                onClick: function() {
                                    $cordovaSocialSharing
                                        .shareViaFacebook(text, image, link)
                                        .then(onSuccess, onError);
                                }
                            });
                            determineTwitterAvailability();
                        }, function() {
                            // Facebook not available
                            determineTwitterAvailability();
                        });
                };

                // Only look for other apps if we're not in a browser
                if(ionicHelperService.isWebView()) {
                    determineFacebookAvailablility();
                }
                else {
                    share();
                }



            }
        };
    }]);