angular.module('app.Services')
    .factory('metaService', ['mobileNotificationService',function(/*Injected so that the service is initialized*/mobileNotificationService) {
        return {
            initialize: function() {

            }
        };
    }]);