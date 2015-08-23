angular.module('dmusiclibrary.Services')
    .factory('dmusiclibraryCommService', ['$rootScope', 'commService',  function($rootScope, commService) {
        return {
            getServiceUrl: function() {
                return commService.getDomain() + ":" + commService.getPort() + "/MusicLibraryService";
            },
            postWithParams: function(method, parameters, onSuccess, onFailure) {
                return commService.postWithParams(method, parameters, onSuccess, onFailure, {
                    url: this.getServiceUrl()
                });
            }
        };
    }]);