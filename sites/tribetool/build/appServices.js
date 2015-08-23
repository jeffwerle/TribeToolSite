var servicesModule = angular.module('app.Services', []);

servicesModule.value('OPTIONS', {
    isDebug: false
});


servicesModule.factory('RecursionHelper', ['$compile', function($compile){
    return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
        compile: function(element, link){
            // Normalize the link parameter
            if(angular.isFunction(link)){
                link = { post: link };
            }

            // Break the recursion loop by removing the contents
            var contents = element.contents().remove();
            var compiledContents;
            return {
                pre: (link && link.pre) ? link.pre : null,
                /**
                 * Compiles and re-adds the contents
                 */
                post: function(scope, element){
                    // Compile the contents
                    if(!compiledContents){
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function(clone){
                        element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if(link && link.post){
                        link.post.apply(null, arguments);
                    }
                }
            };
        }
    };
}]);

servicesModule
    .factory('commService', ['$rootScope', '$http', 'modalService', 'OPTIONS', 'mediaService', function($rootScope, $http, modalService, OPTIONS, mediaService) {
        return {
            /* A list of notifications */
            notifications: [],

            getDomain: function() {
                //var domain = OPTIONS.isMobile && OPTIONS.isDebug && !mediaService.isMobile ? "http://localhost" : "https://tribetool.com";
                var domain = OPTIONS.isMobile && !mediaService.isMobile ? "http://localhost" : "https://tribetool.com";
                return domain;
            },
            getPort: function() {
                //return OPTIONS.isMobile && OPTIONS.isDebug && !mediaService.isMobile ? "8100" : "8443";
                return OPTIONS.isMobile && !mediaService.isMobile ? "8100" : "8443";
            },
            getServiceUrl: function() {
                return this.getDomain() + ":" + this.getPort() + "/TribeToolService";
            },
            /*
             options:
             method: the name of the method to be called
             params: json of the parameters to the url. If truthy, this will be appended to the url.
             */
            serviceCall: function (options, onSuccess, onFailure) {
                var url = options.url ? options.url : this.getServiceUrl();
                return this.serviceCallFromServiceUrl(url, options, onSuccess, onFailure);
            },
            /*
             options: {
                 method: the name of the method to be called
                 params: json of the parameters to the url. If truthy, this will be appended to the url.
                 methodType: POST, GET, PUT, or DELETE
             }
             */
            serviceCallFromServiceUrl: function (serviceUrl, options, onSuccess, onFailure) {

                var url = serviceUrl + "/" + options.method;

                var data = options.params ? JSON.stringify(options.params) : null;

                var promise;
                if(!options.methodType)
                    options.methodType = 'POST';

                var config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                promise = $http({
                    url: url,
                    method: options.methodType,
                    data: data,
                    headers: config.headers
                });


                var my = this;
                promise.success(function (data, status, headers, config) {
                    $rootScope.$broadcast('log', data);

                    if(data.Success) {

                        if(onSuccess)
                            onSuccess(data);
                    }
                    else {

                        if(onFailure)
                            onFailure(data);
                    }
                })
                    .error(function(data, status, headers, config) {
                        $rootScope.$broadcast('log', data);
                        console.log('TRIBETOOL: $http.error: data: ' + (data ? JSON.stringify(data) : data));
                        console.log('TRIBETOOL: $http.error: status: ' + status);
                        console.log('TRIBETOOL: $http.error: headers: ' + (headers ? JSON.stringify(headers) : headers));
                        console.log('TRIBETOOL: $http.error: config: ' + (config ? JSON.stringify(config) : config));

                        if(!data || !data.ErrorReason) {
                            data = {
                                ErrorReason: data && data.ResponseStatus && data.ResponseStatus.ErrorCode ? data.ResponseStatus.ErrorCode + " - " + data.ResponseStatus.Message : "Unknown Error. Please try again and if the error persists please report the bug to us!",
                                Success: false
                            };
                        }

                        my.showErrorAlert(data.ErrorReason);

                        if(onFailure)
                            onFailure(data);
                    });


            },
            serviceCallWithParams: function(method, parameters, onSuccess, onFailure) {
                this.serviceCall({ methodType: 'POST',method: method, params: parameters},
                    onSuccess, onFailure);
            },
            postWithParams: function(method, parameters, onSuccess, onFailure, options) {
                if(!options) {
                    options = {};
                }
                var finalOptions = angular.extend({ methodType: 'POST',method: method, params: parameters}, options);
                this.serviceCall(finalOptions,
                    onSuccess, onFailure);
            },
            putWithParams: function(method, parameters, onSuccess, onFailure) {
                this.serviceCall({ methodType: 'PUT',method: method, params: parameters},
                    onSuccess, onFailure);
            },
            deleteWithParams: function(method, parameters, onSuccess, onFailure) {
                this.serviceCall({ methodType: 'DELETE',method: method, params: parameters},
                    onSuccess, onFailure);
            },
            showAlert: function(data) {
                var n = noty({
                    text: data.message,
                    type: data.type,
                    layout: data.layout ? data.layout : 'bottomLeft',
                    theme: 'relax',
                    timeout: 5000,
                    closeWith: ['click'],
                    callback: {
                        onShow: function() {
                            if(data.onShow)
                                data.onShow(data);
                        },
                        onClose: function() {
                            if(data.onClose)
                                data.onClose(data);
                        },
                        onCloseClick: function() {
                            if(data.onCloseClick)
                                data.onCloseClick(data);
                        }

                    }
                });
            },
            showErrorAlert: function(message, options) {
                if(message && message.ErrorReason) {
                    message = message.ErrorReason;
                }
                console.log(message);
                this.showAlert(angular.extend({ message: message, type: 'error' }, options));
            },
            showInfoAlert: function(message, options) {
                if(message && message.ErrorReason) {
                    message = message.ErrorReason;
                }
                this.showAlert(angular.extend({ message: message, type: 'information' }, options));
            },
            showWarningAlert: function(message, options) {
                if(message && message.ErrorReason) {
                    message = message.ErrorReason;
                }
                this.showAlert(angular.extend({ message: message, type: 'warning' }, options));
            },
            showSuccessAlert: function(message, options) {
                this.showAlert(angular.extend({ message: message, type: 'success' }, options));
            },
            logMessage: function(message) {
                $rootScope.$broadcast('log', message);
            },
            isAutoRefreshRunning: function(scope) {
                return !!scope.timeoutIdPromise;
            },
            /*
             onRefresh(): If exists and returns false, the timer will stop auto refreshing.
             */
            autoRefresh: function(scope, timeout, millisecondsInterval, onRefresh) {
                var my = this;
                scope.$on('$destroy', function() {
                    my.stopAutoRefresh(scope, timeout);
                });
                scope.setRefreshTimer = function() {
                    if(scope.timeoutIdPromise)
                        my.stopAutoRefresh(scope, timeout);
                    scope.timeoutIdPromise = timeout(function() {
                        if(onRefresh) {
                            if(onRefresh() !== false) {
                                scope.setRefreshTimer();
                            } else {
                                my.stopAutoRefresh(scope, timeout);
                            }
                        } else {
                            scope.setRefreshTimer();
                        }
                    }, millisecondsInterval);
                };
                scope.setRefreshTimer();
            },
            stopAutoRefresh: function(scope, timeout) {
                timeout.cancel(scope.timeoutIdPromise);
                scope.timeoutIdPromise = null;
            },
            /*
             http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
             example usage:
             // Sort by price high to low
             homes.sort(sort_by('price', true, parseInt));

             // Sort by city, case-insensitive, A-Z (i.e. ascending)
             homes.sort(sort_by('city', false, function(a){return a.toUpperCase()}));
             */
            sortBy: function(field, descending, primer){

                var key = primer ?
                    function(x) {return primer(x[field]);} :
                    function(x) {return x[field];};

                descending = [-1, 1][+!!descending];

                return function (a, b) {
                    return a = key(a), b = key(b), descending * ((a > b) - (b > a));
                };

            },
            setScreen: function(screenOptions) {
                $rootScope.$broadcast('setScreen', screenOptions);
            },
            /* Sets the property with the given "attrName" in the given "scope" to the
            * given "newValue". Takes into account any "." that may appear in the property name. */
            setScopeProperty: function(scope, attrName, newValue) {
                var propertyElements = attrName.split('.');
                var property = scope;
                for(var i = 0; i < propertyElements.length; i++) {
                    var propertyElement = propertyElements[i];
                    if(i + 1 < propertyElements.length)
                        property = property[propertyElement];
                }
                property[propertyElements[propertyElements.length - 1]] = newValue;
            },
            /* Gets the property with the given "attrName" in the given "scope".
            Takes into account any "." that may appear in the property name. */
            getScopeProperty: function(scope, attrName) {
                var propertyElements = attrName.split('.');
                var property = scope;
                for(var i = 0; i < propertyElements.length; i++) {
                    var propertyElement = propertyElements[i];
                    if(i + 1 < propertyElements.length)
                        property = property[propertyElement];
                }
                return property[propertyElements[propertyElements.length - 1]];
            },
            shuffle: function(array) {
                var currentIndex = array.length, temporaryValue, randomIndex ;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }

                return array;
            },
            getFixCors: function(url) {
                /* Alternative: cors-anywhere.herokuapp.com */
                promise = $http({
                    url: 'https://allow-any-origin.appspot.com/' + url,
                    method: 'get'
                });

                return promise;
            }
        };
    }]);