angular.module('app.Services')
    .factory('inputService', ['$rootScope', '$window', function($rootScope, $window) {
        var service = $rootScope.$new(true);

        $window.onmousedown = function (e) {
            if (!e) e = window.event;
            if (e.shiftKey) {/*shift is down*/}
            if (e.altKey) {/*alt is down*/}
            if (e.ctrlKey) {/*ctrl is down*/}
            if (e.metaKey) {/*cmd is down*/}
        };

        return service;
    }]);