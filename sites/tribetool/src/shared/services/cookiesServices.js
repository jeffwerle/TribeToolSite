angular.module('app.Services')
    .factory('cookiesService', ['$rootScope', '$injector', '$window', 'OPTIONS', '$cordovaSQLite', '$q', '$ionicPlatform', 'ionicHelperService', function($rootScope, $injector, $window, OPTIONS, $cordovaSQLite, $q, $ionicPlatform, ionicHelperService) {
        var hasCookies = $injector.has('$cookies');
        var $cookies = hasCookies ? $injector.get('$cookies') : null;
        var service = {
            databaseInitialized: false,
            db: null,
            putObject: function(cookieName, obj) {
                var stringified = JSON.stringify(obj);

                var self = this;
                if(OPTIONS.isMobile && self.db) {
                    $ionicPlatform.ready(function() {

                        // https://blog.nraboy.com/2014/11/use-sqlite-instead-local-storage-ionic-framework/

                        var query = "UPDATE localstorage SET value = ? WHERE key = ?";
                        $cordovaSQLite.execute(self.db, query, [stringified, cookieName]).then(function(res) {
                            //console.log("INSERT ID -> " + res.insertId);
                            // Updated

                            if(res.rowsAffected <= 0) {
                                query = "INSERT INTO localstorage (key, value) VALUES (?,?)";
                                $cordovaSQLite.execute(self.db, query, [cookieName, stringified]).then(function(res) {
                                    //console.log("INSERT ID -> " + res.insertId);
                                }, function (err) {
                                    console.error('TRIBETOOL: insert error: ' + err);
                                });
                            }

                        }, function (err) {


                        });

/*
                        var query = "INSERT INTO localstorage (key, value) VALUES (?,?)";
                        $cordovaSQLite.execute(self.db, query, [cookieName, stringified]).then(function(res) {
                            //console.log("INSERT ID -> " + res.insertId);
                        }, function (err) {
                            console.error(err);
                        });
                        */
                    });
                    return;
                }

                if($window.localStorage)
                    $window.localStorage[cookieName] = stringified;

                if(hasCookies) {
                    if($cookies.putObject)
                        $cookies.putObject(cookieName, obj);
                    else {
                        $cookies[cookieName] = stringified;
                    }
                }
            },
            getObject: function(cookieName) {
                var deferred = $q.defer();

                var cookieObj = null;

                var self = this;
                if(OPTIONS.isMobile && self.db) {
                    // https://blog.nraboy.com/2014/11/use-sqlite-instead-local-storage-ionic-framework/
                    $ionicPlatform.ready(function() {
                        var query = "SELECT key, value FROM localstorage WHERE key = ?";
                        $cordovaSQLite.execute(self.db, query, [cookieName]).then(function(res) {
                            if(res.rows.length > 0) {
                                var obj = JSON.parse(res.rows.item(0).value);


                                deferred.resolve(obj);
                            } else {
                                deferred.resolve(null);
                            }
                        }, function (err) {
                            deferred.reject(err);
                        });
                    });
                    return deferred.promise;
                }

                if($window.localStorage) {
                    var localStorageString = $window.localStorage[cookieName];
                    if(localStorageString) {
                        var localStorageObj = JSON.parse(localStorageString);
                        if(localStorageObj) {
                            deferred.resolve(localStorageObj);
                            return deferred.promise;
                        }
                    }
                }

                if(hasCookies) {
                    if($cookies.getObject) {
                        cookieObj = $cookies.getObject(cookieName);
                    }
                    else {
                        var cookieObjString = $cookies[cookieName];
                        if(cookieObjString) {
                            cookieObj = JSON.parse(cookieObjString);
                        }
                    }
                }

                deferred.resolve(cookieObj);
                return deferred.promise;
            },

            mapStateCookieName: 'TribeToolCookiesServiceMapState',
            getMapState: function() {
                return this.getObject(this.mapStateCookieName);
            },
            setMapState: function(state) {
                this.putObject(this.mapStateCookieName, state);
            },
            mapTourStateCookieName: 'TribeToolCookiesServiceMapTourState',
            getMapTourState: function() {
                return this.getObject(this.mapTourStateCookieName);
            },
            setMapTourState: function(state) {
                this.putObject(this.mapTourStateCookieName, state);
            },

            playlistStateCookieName: 'TribeToolCookiesServicePlaylistState',
            getPlaylistState: function() {
                return this.getObject(this.playlistStateCookieName);
            },
            setPlaylistState: function(state) {
                this.putObject(this.playlistStateCookieName, state);
            },


            accountStateCookieName: 'TribeToolCookiesServiceAccountState',
            getAccountState: function() {
                return this.getObject(this.accountStateCookieName);
            },
            setAccountState: function(state) {
                this.putObject(this.accountStateCookieName, state);
            },

            lastRememberedPageCookieName: 'TribeToolCookiesServiceLastRememberedPage',
            getLastRememberedPage: function() {
                return this.getObject(this.lastRememberedPageCookieName);
            },
            setLastRememberedPage: function(path) {
                this.putObject(this.lastRememberedPageCookieName, path);
            },

            marketingStateCookieName: 'TribeToolCookiesServiceMState',
            getMarketingState: function() {
                return this.getObject(this.marketingStateCookieName);
            },
            setMarketingState: function(state) {
                this.putObject(this.marketingStateCookieName, state);
            },

            compatibilityAnswersCookieName: 'TribeToolCookiesServiceCompatibilityAnswersState',
            getCompatibilityAnswersState: function() {
                return this.getObject(this.compatibilityAnswersCookieName);
            },
            /*
            state: {
                answers: [] // array of AccountCompatibilityAnswers
                communityId: ObjectId
            }
            * */
            setCompatibilityAnswersState: function(state) {
                this.putObject(this.compatibilityAnswersCookieName, state);
            }
        };

        if($cordovaSQLite.openDB && ionicHelperService.isWebView()) {
            $ionicPlatform.ready(function() {
                // https://blog.nraboy.com/2014/11/use-sqlite-instead-local-storage-ionic-framework/
                service.db = $cordovaSQLite.openDB("tribetool.db");
                if(service.db)
                    $cordovaSQLite.execute(service.db, "CREATE TABLE IF NOT EXISTS localstorage (id integer primary key, key text, value text)");
                service.databaseInitialized = true;
                $rootScope.$broadcast('cookiesService:databaseInitialized');
            });
        }
        else {
            service.databaseInitialized = true;
            $rootScope.$broadcast('cookiesService:databaseInitialized');
        }

        return service;
    }]);