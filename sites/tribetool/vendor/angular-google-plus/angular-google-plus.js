/*! angular-google-plus - v0.1.2 2015-04-27 */
/**
 * googleplus module
 */
angular.module("googleplus", []).provider("GooglePlus", [ function() {
    /**
     * Options object available for module
     * options/services definition.
     * @type {Object}
     */
    var a = {};
    /**
     * clientId
     * @type {Number}
     */
    a.clientId = null;
    this.setClientId = function(b) {
        a.clientId = b;
        return this;
    };
    this.getClientId = function() {
        return a.clientId;
    };
    /**
     * apiKey
     * @type {String}
     */
    a.apiKey = null;
    this.setApiKey = function(b) {
        a.apiKey = b;
        return this;
    };
    this.getApiKey = function() {
        return a.apiKey;
    };
    /**
     * Scopes
     * @default 'https://www.googleapis.com/auth/plus.login'
     * @type {Boolean}
     */
    a.scopes = "https://www.googleapis.com/auth/plus.login";
    this.setScopes = function(b) {
        a.scopes = b;
        return this;
    };
    this.getScopes = function() {
        return a.scopes;
    };
    /**
     * Init Google Plus API
     */
    this.init = function(b) {
        angular.extend(a, b);
    };
    /**
     * Make sign-in server side
     */
    this.enableServerSide = function() {
        a.accessType = "offline";
        a.responseType = "code token id_token gsession";
    };
    /**
     * Make sign-in client side (default)
     */
    this.disableServerSide = function() {
        delete a.accessType;
        delete a.responseType;
    };
    /**
     * This defines the Google Plus Service on run.
     */
    this.$get = [ "$q", "$rootScope", "$timeout", function(b, c, d) {
        /**
       * Define a deferred instance that will implement asynchronous calls
       * @type {Object}
       */
        var e;
        /**
       * NgGooglePlus Class
       * @type {Class}
       */
        var f = function() {};
        f.prototype.getClientId = function() {
            return a.clientId;
        };
        f.prototype.getScopes = function() {
            return a.scopes;
        };
        f.prototype.authorize = function(c) {
            e = b.defer();
            if (a.accessType && a.responseType) {
                c.access_type = a.accessType;
                c.response_type = a.responseType;
            }
            gapi.auth.authorize(c, this.handleAuthResult);
            return e.promise;
        };
        f.prototype.login = function() {
            var c = {
                client_id: a.clientId,
                scope: a.scopes,
                immediate: false
            };
            return this.authorize(c);
        };
        f.prototype.checkAuth = function() {
            var c = {
                client_id: a.clientId,
                scope: a.scopes,
                immediate: true
            };
            return this.authorize(c);
        };
        f.prototype.handleClientLoad = function() {
            gapi.client.setApiKey(a.apiKey);
            gapi.auth.init(function() {});
            d(this.checkAuth, 1);
        };
        f.prototype.handleAuthResult = function(a) {
            if (a && !a.error) {
                e.resolve(a);
                c.$apply();
            } else {
                e.reject("error");
            }
        };
        f.prototype.getUser = function() {
            var a = b.defer();
            gapi.client.load("oauth2", "v2", function() {
                gapi.client.oauth2.userinfo.get().execute(function(b) {
                    a.resolve(b);
                    c.$apply();
                });
            });
            return a.promise;
        };
        f.prototype.getToken = function() {
            return gapi.auth.getToken();
        };
        f.prototype.setToken = function(a) {
            return gapi.auth.setToken(a);
        };
        f.prototype.logout = function() {
            gapi.auth.signOut();
            return e.promise;
        };
        return new f();
    } ];
} ]).run(['$rootScope', function($rootScope) {
    var a = document.createElement("script");
    a.type = "text/javascript";
    a.async = true;
    a.src = "https://apis.google.com/js/client.js";

    a.addEventListener('load', function (e) {
        $rootScope.$broadcast('Google:load');
    });

    var b = document.getElementsByTagName("script")[0];
    b.parentNode.insertBefore(a, b);
} ]);