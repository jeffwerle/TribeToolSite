(function() {
    var $injector = angular.element('*[ng-app]').injector();
    var OPTIONS = $injector.get('OPTIONS');

    var moduleDependencies = [];
    /*
     if(OPTIONS.isDebug) {
     // In debug, we'll have to load the individual vendor files
     moduleDependencies = [{
     name: "dependencyModule",
     files: ["sites/default/vendor/dependencyModule.js"]
     }]
     }
     else {
     // In production, the vendor modules will be in this same app.js
     // file so we can inject them the standard way
     moduleDependencies = [
     'dependencyModule'
     ];
     }
     */

    angular.module('cmusictheorynotes', moduleDependencies)
        .config(['$locationProvider', function($locationProvider) {

        }]);

    angular.module('cmusictheorynotes.Controllers', []);
    angular.module('cmusictheorynotes.Directives', []);
    angular.module('cmusictheorynotes.Services', []);





    var communityService = $injector.get('communityService');

    var dependencies = [{
        Url: 'musiclibrary'
    }]; // an array of communities

    communityService.loadCommunityScripts({
        community: {
            Url: 'music-theory-notes'
        },
        files: [
            'sites/musictheorynotes/controllers/homeControllers.js',
            'sites/musictheorynotes/controllers/postControllers.js',

            'sites/musictheorynotes/directives/landingDirectives.js',
            'sites/musictheorynotes/directives/communityDirectives.js'
        ],
        dependencyCommunities: dependencies
    });

})();

