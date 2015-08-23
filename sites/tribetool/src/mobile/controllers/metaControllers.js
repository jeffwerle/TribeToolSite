angular.module('app.Controllers')
    .controller('metaController', ['$scope', 'metaService', function($scope, metaService) {
        metaService.initialize();

    }]);