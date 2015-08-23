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

    angular.module('cthemouselanding', moduleDependencies)
        .config(['$locationProvider', function($locationProvider) {

        }]);

    angular.module('cthemouselanding.Controllers', []);
    angular.module('cthemouselanding.Directives', []);
    angular.module('cthemouselanding.Services', []);


    var communityService = $injector.get('communityService');

    var dependencies = []; // an array of communities
    communityService.loadCommunityScripts({
        community: {
            Url: 'the-mouse-landing'
        },
        files: [
            'sites/themouselanding/controllers/communityControllers.js',
            'sites/themouselanding/controllers/homeControllers.js',
            'sites/themouselanding/controllers/postControllers.js',
            'sites/themouselanding/controllers/landingControllers.js',

            'sites/themouselanding/directives/landingDirectives.js'
        ],
        dependencyCommunities: dependencies
    });


})();


