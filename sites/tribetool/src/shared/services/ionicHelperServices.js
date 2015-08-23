angular.module('app.Services')
    .factory('ionicHelperService', ['$rootScope', '$ionicScrollDelegate', 'modalService', '$ionicActionSheet', '$cordovaAppAvailability', '$window', '$ionicConfig', '$ionicLoading', 'mediaService', function($rootScope, $ionicScrollDelegate, modalService, $ionicActionSheet, $cordovaAppAvailability, $window, $ionicConfig, $ionicLoading, mediaService) {

        var service = {
            /* Indicates whether the app is in the foreground (true) or the background (false).
             * This value is set in mobileNotificationService */
            isInForeground: true,
            /*
             Gets the current ionic ScrollDelegate for the loaded community page
             * */
            getCurrentScrollInstance: function() {
                var scrollInstance = null;
                if(modalService.isOpen()) {
                    // A modal is open
                    for(var i = $ionicScrollDelegate._instances.length - 1; i >= 0; i--) {
                        scrollInstance = $ionicScrollDelegate._instances[i];
                        var scrollIonViews = scrollInstance.$element.parents('ion-view');
                        if(!scrollIonViews || scrollIonViews.length <= 0) {
                            return scrollInstance;
                        }
                    }
                }

                if(this.page) {
                    scrollInstance = this.getScrollInstance(this.page.name);
                    if(scrollInstance)
                        return scrollInstance;
                }

                return this.getScrollInstance();
            },
            getScrollInstance: function(viewName) {
                // Get the scroll instance
                for(var i = 0; i < $ionicScrollDelegate._instances.length; i++) {
                    var scrollInstance = $ionicScrollDelegate._instances[i];

                    var scrollIonViews = scrollInstance.$element.parents('ion-view');
                    if(!scrollIonViews || scrollIonViews.length <= 0) {
                        continue;
                    }

                    // Don't return a cached view
                    var attrNavView = scrollIonViews[0]['$attr-nav-view'];
                    if(attrNavView === 'cached') {
                        continue;
                    }

                    var scrollIonNavViews = scrollInstance.$element.parents('ion-nav-view');
                    var name = scrollIonNavViews.attr('name');
                    if(!viewName && !name) {
                        return scrollInstance;
                    }
                    else if(!viewName || !name) {
                        // Not equal
                    }
                    else if (name.toLowerCase() === viewName.toLowerCase()) {
                        return scrollInstance;
                    }
                }

                return null;
            },
            /*
             Sets the following properties in the scope:

             ionNavView: jquery element
             viewName: the name on the ionNavView
             scrollInstance: the $ionicScrollDelegate instance
             */
            setNavView: function(scope, element) {
                scope.ionNavView = element.parents('ion-nav-view');
                if(scope.ionNavView && scope.ionNavView.length > 0) {
                    scope.viewName = scope.ionNavView.attr('name');
                    scope.scrollInstance = this.getScrollInstance(scope.viewName);
                }
            },
            deactivateView: function(element) {
                var ionView = element.parents('ion-view');

                var divs = ionView.parents('div.pane');
                if(divs) {
                    divs.attr('nav-view', null);
                    for(var i = 0; i < divs.length; i++) {
                        divs[i]['$attr-nav-view'] = null;
                    }
                }

                ionView[0]['$attr-nav-view'] = null;
                ionView.attr('nav-view', null);
            },
            /*
            options:
             {
                 title: string,
                 delete: {
                     onClick: function(),
                     text: string
                 },
                 buttons: [{
                     onClick: function(),
                     text: string
                 }]
             }
             */
            getActionSheet: function(options, getItem) {
                var actionSheetWrapper = {

                };
                var actionSheet = {
                    buttons: options.buttons,
                    titleText: options.title,
                    cancelText: 'Cancel',
                    cancel: function() {
                        actionSheetWrapper.hide();
                    },
                    buttonClicked: function(index) {
                        for(var i = 0; i < options.buttons.length; i++) {
                            if(i === index) {
                                options.buttons[i].onClick(getItem ? getItem() : undefined);
                                actionSheetWrapper.hide();
                                return true;
                            }
                        }
                        return false;
                    }

                };
                if(options.delete) {
                    actionSheet.destructiveText = options.delete.text;
                    actionSheet.destructiveButtonClicked = function() {
                        options.delete.onClick(getItem ? getItem() : undefined);
                        actionSheetWrapper.hide();
                    };
                }

                actionSheetWrapper.actionSheet = actionSheet;
                actionSheetWrapper.show = function() {
                    actionSheetWrapper.hide = $ionicActionSheet.show(actionSheetWrapper.actionSheet);
                };
                return actionSheetWrapper;
            },
            getDeviceType: function() {
                if(this.isAndroid()) {
                    return 'AndroidPhone';
                }
                else if(this.isIOS()) {
                    if(mediaService.isiPad) {
                        return 'iPad';
                    }
                    else if(mediaService.isiPhone) {
                        return 'iPhone';
                    }
                    else if(mediaService.isiPod) {
                        return 'iPod';
                    }
                    else {
                        return 'iPhone';
                    }
                }
                else {
                    return 'Unknown';
                }
            },
            isIOS: function() {
                return $window.ionic.Platform.isIOS();
            },
            isAndroid: function() {
                return $window.ionic.Platform.isAndroid();
            },
            isWebView: function() {
                return $window.ionic.Platform.isWebView();
            },
            isJsScrolling: function() {
                return $ionicConfig.scrolling.jsScrolling();
            },
            exitApp: function() {
                $window.ionic.Platform.exitApp();
            },
            isTwitterAvailable: function() {
                return this.isPackageAvailable('twitter://', 'com.twitter.android');
            },
            isFacebookAvailable: function() {
                return this.isPackageAvailable('fb://', 'com.facebook.katana');
            },
            isWhatsAppAvailable: function() {
                return this.isPackageAvailable('whatsapp://', 'com.whatsapp');
            },
            /* Returns null if undeterminable--otherwise returns a promise */
            isPackageAvailable: function(iosName, androidName) {
                var packageName = '';
                if(this.isIOS()) {
                    packageName = iosName;
                }
                else if(this.isAndroid) {
                    packageName = androidName;
                }

                if(packageName) {
                    return $cordovaAppAvailability.check(packageName);
                }
                else {
                    return null;
                }
            }
        };

        // We have to listen for the community page to be loaded rather than do
        // a community service injection due to circular dependencies.
        $rootScope.$on('communityPageLoaded', function(e, page) {
            service.page = page;
        });
        return service;
    }]);



