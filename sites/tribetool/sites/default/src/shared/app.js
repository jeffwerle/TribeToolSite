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

    angular.module('cdefault', moduleDependencies)
        .config(['$locationProvider', function($locationProvider) {

        }]);

    angular.module('cdefault.Controllers', []);
    angular.module('cdefault.Directives', []);
    angular.module('cdefault.Services', []);




    var communityService = $injector.get('communityService');

    var dependencies = []; // an array of communities
    communityService.loadCommunityScripts({
        community: {
            Url: 'default'
        },
        files: [
            'sites/default/controllers/homeControllers.js',
            'sites/default/controllers/postControllers.js',

            'sites/default/directives/landingDirectives.js'
        ],
        dependencyCommunities: dependencies,
        useDefaultFiles: true
    });

})();
