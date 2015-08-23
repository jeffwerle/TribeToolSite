angular.module('app.Directives')
    // See angulike.js for social links
    .directive('socialLinks', ['$compile', 'metaService', '$timeout', function($compile, metaService, $timeout) {
        return {
            restrict: 'E',
            replace: 'true',
            template: '<div></div>',
            link: function(scope, elem, attrs) {

                var applyNgInclude = function() {
                    $timeout(function() {
                        elem.empty();
                        var el = $compile("<div ng-include src=\"\'app-templates/public/social-links.tpl.html\'\"></div>")(scope);
                        elem.append( el );
                    }, 0);
                };

                metaService.registerSocialCallback(function() {
                    applyNgInclude();
                });


            }
        };
    }])
    .directive('metaTitle', ['metaService', function(metaService) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var setTitle = function() {
                    $(elem).html(metaService.metaData.title);
                };

                metaService.registerTitleCallback(function() {
                    setTitle();
                });
            }
        };
    }])
    .directive('metaDescription', ['metaService', function(metaService) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var setDesription = function() {
                    $(elem).attr('content', metaService.metaData.description);
                };

                metaService.registerDescriptionCallback(function() {
                    setDesription();
                });
            }
        };
    }])
    .directive('prerenderStatusCode', ['metaService', function(metaService) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var setContent = function() {
                    if(metaService.prerenderInfo)
                        $(elem).attr('content', metaService.prerenderInfo.status);
                };

                metaService.registerStatusCallback(function() {
                    setContent();
                });
            }
        };
    }])
    .directive('youtubeSubscribe', [function() {
            return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="g-ytsubscribe" data-channel="SongwritingTheory" data-layout="default" data-count="hidden"></div>',
            link: function(scope, element, attributes) {

            }
        };
    }]);

