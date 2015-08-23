angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryNavigationService', ['navigationService', 'communityService', '$window', '$routeParams', function(navigationService, communityService, $window, $routeParams) {
        return {
            appendCommand: function(url, command, instrument) {
                if(command) {
                    url += '/' + $window.encodeURIComponent(command);
                    if(instrument)
                        url += '/' + $window.encodeURIComponent(instrument);
                }
                return url;
            },
            goToBazzle: function(command, instrument) {
                var url = navigationService.getToolUrl(communityService.community, 'bazzle');
                url = this.appendCommand(url, command, instrument);
                navigationService.goToPath(url);
            },
            goToVirtualCowriter: function(command, instrument) {
                var url = navigationService.getToolUrl(communityService.community, 'vc');
                url = this.appendCommand(url, command, instrument);
                navigationService.goToPath(url);
            },
            getCommandFromRoute: function() {
                return $routeParams.toolRouteData1 ? $window.decodeURIComponent($routeParams.toolRouteData1) : null;
            },
            getInstrumentFromRoute: function() {
                return $routeParams.toolRouteData2 ? $window.decodeURIComponent($routeParams.toolRouteData2) : null;
            }
        };
    }]);