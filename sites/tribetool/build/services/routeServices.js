angular.module('app.Services')
    .factory('route', ['$rootScope', '$injector', '$location', function($rootScope, $injector, $location) {

        var privateService = {

        };
        var service = {
        };
        var update = null;
        if($injector.has('$route')) {
            var $route = $injector.get('$route');
            service.reload = $route.reload;
            service.isUsingState = false;
            service.$route = $route;
            service.getCurrentRoute = function() {
                if($route.current && $route.current.$$route && $route.current.$$route.originalPath)
                    return $route.current.$$route.originalPath;

                return null;
            };

            service.$routeParams = $injector.get('$routeParams');
            service.routeParams = angular.extend({}, service.$routeParams);

            update = function() {
                service.current = $route.current;
            };
            $rootScope.$on('$routeChangeSuccess', function(e, d) {
                update();
                service.routeParams = {};
                angular.extend(service.routeParams, service.$routeParams);
                angular.extend(service.routeParams, $location.$$search);
                $rootScope.$broadcast('routeChangeSuccess', d);
            });
            $rootScope.$on('$routeChangeStart', function(e, d) {
                $rootScope.$broadcast('routeChangeStart', d);
            });
        }
        else {
            var $state = $injector.get('$state');
            service.$stateParams = $injector.get('$stateParams');

            service.reload = function(newParams) {
                // We can't reload an abstract state
                if($state.current && $state.current.abstract) {
                    return false;
                }

                // $state.reload;
                privateService.reloadParams = newParams;


                return $state.reload();
            };
            service.isUsingState = true;
            service.$state = $state;
            service.getCurrentRoute = function() {
                if($state.$current)
                    return $state.$current.url.sourcePath;

                return null;
            };


            service.routeParams = angular.extend({}, service.$stateParams);

            update = function() {
                service.current = $state.current;
                service.$current = $state.$current;
            };
            $rootScope.$on('$stateChangeSuccess', function(e, state) {
                update();
                service.routeParams = {};
                if(privateService.reloadParams)
                    angular.extend(service.routeParams, privateService.reloadParams);

                angular.extend(service.routeParams, service.$stateParams);
                angular.extend(service.routeParams, $location.$$search);
                privateService.reloadParams = null;

                $rootScope.$broadcast('routeChangeSuccess', state);
            });
            $rootScope.$on('$stateChangeStart', function(e, state) {
                $rootScope.$broadcast('routeChangeStart', state);
            });
        }

        return service;
    }]);