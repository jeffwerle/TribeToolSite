angular.module('jsPlumb', ['ng'])
    .service('jsPlumbService', ['$window', '$rootScope', function ($window, $rootScope) {
        var service = $rootScope.$new(true);

        var instance = $window.jsPlumb.getInstance({
            DragOptions : { cursor: "pointer", zIndex:2000 },
            HoverClass:"connector-hover",
        });

        service.instance = instance;

        return service;
    }]);