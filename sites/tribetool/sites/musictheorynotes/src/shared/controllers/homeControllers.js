angular.module('cmusictheorynotes.Controllers')
    .controller('cmusictheorynotesHomeController', ['$rootScope', '$scope', 'marketingService', 'communityService', 'commService', 'navigationService', 'metaService', 'OPTIONS', 'dmusiclibraryBazzleService', 'dmusiclibraryInstrumentService', 'dmusiclibraryMidiService', '$location', function($rootScope, $scope, marketingService, communityService, commService, navigationService, metaService, OPTIONS, bazzleService, instrumentService, midiService, $location) {

        $scope.initialized = function() {

        };

        $scope.communityViewPath = '/sites/musictheorynotes/app-templates/router.html';

        communityService.communityOptions.style = {
            logoClass: 'music-theory-logo'
        };

        marketingService.popup.text = 'Discover other Music Theorists';



        $scope.initialized = function() {
            midiService.initialize();
            instrumentService.initialize(function() {

                if(!instrumentService.instrument) {
                    instrumentService.setInstrumentToGuitar();
                }

                if(!$location.$$search.instrument) {
                    instrumentService.setInstrumentToGuitar();
                }
                else {
                    var instrument = $location.$$search.instrument;
                    if(instrumentService.isInstrumentJson(instrument) &&
                        instrumentService.isInstrument(instrument)) {
                        instrumentService.setInstrument(angular.fromJson(instrument));
                    }
                    else {
                        instrumentService.setInstrumentToGuitar();
                    }
                }
            });
        };

        communityService.communityRenderOptions = {
            community: {
                sidebar: {
                    objects: [{
                        template: '<cmusictheorynotes-community-sidebar></cmusictheorynotes-community-sidebar>'
                    }]
                }
            }
        };










        $rootScope.$broadcast('communityControllerLoaded', this);


    }]);