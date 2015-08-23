angular.module('app.Services')
    .factory('breadcrumbService', ['$rootScope', 'route', '$ionicPlatform', 'ionicHelperService', function($rootScope, route, $ionicPlatform, ionicHelperService) {
        var service = {
            history: [],
            lastRemovedEntry: null,
            options: {
                allowBackButton: true
            },
            setOptions: function(options) {
                angular.extend(this.options, options);
            },
            goBack: function(options) {
                // Remove the view that we're currently on
                this.removeLastEntry();

                // Now get the view to which to transition to
                var lastEntry = this.history[this.history.length - 1];
                this.lastRemovedEntry = lastEntry;
                if(route.$state)
                    route.$state.transitionTo(lastEntry.state.name, lastEntry.params, options);
            },
            removeLastEntry: function() {
                this.history.splice(this.history.length - 1, 1);
            },
            getHistoryId: function(entry) {
                var id = entry.state.name;
                for(var p in entry.params) {
                    id += p + entry.params[p];
                }
                return id;
            },
            nextViewOptions: null
        };

        // http://ionicframework.com/docs/api/service/$ionicPlatform/
        if($ionicPlatform.registerBackButtonAction) {
            $ionicPlatform.registerBackButtonAction(function() {
                if(this.history.length <= 1) {
                    // Exit the app--there's no more history to traverse (except the current view)
                    ionicHelperService.exitApp();
                }
                else {
                    service.goBack();
                }

            }, /*priority*/ 101);
        }

        $rootScope.$on('$stateChangeSuccess', function(e, state) {
            // Don't log states that don't have views
            if(!state.templateUrl && (!state.views || state.views.length <= 0)) {
                return;
            }

            var entry = {
                state: state,
                params: angular.extend({}, route.$stateParams)
            };
            entry.id = service.getHistoryId(entry);

            var isSameState = false;
            if(service.history.length > 0) {
                var lastEntry = service.history[service.history.length - 1];
                // Don't re-enter a state that we're already on or that we just
                // removed.
                isSameState = entry.id === lastEntry.id;
                if(isSameState || (service.lastRemovedEntry && entry.id === service.lastRemovedEntry.id)) {
                    service.lastRemovedEntry = null;
                    return;
                }

                // If we weren't supposed to register the previous state then remove it
                if(service.nextViewOptions && service.nextViewOptions.disableBack) {
                    service.removeLastEntry();
                }
            }
            service.lastRemovedEntry = null;

            service.nextViewOptions = null;





            service.history.push(entry);
        });

        return service;
    }]);