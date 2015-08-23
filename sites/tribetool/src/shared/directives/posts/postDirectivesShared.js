angular.module('app.Directives')
    .directive('postContentQuestionContent', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<h3 style="margin-top:0px;">{{question}}</h3>' +
                '</div>',
            scope: {
                question: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('postContentLinkContent', ['formatterService', '$compile', function (formatterService, $compile) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="visible"><a class="visitable" style="font-weight: bold; clear:both;" href="{{link}}" target="_blank">{{link}}</a></div>' +
                '</div>',
            scope: {
                link: '=',
                linkHtml: '=?',
                markdownOptions: '=?'
            },
            link: function (scope, element, attrs) {
                scope.visible = true;
                if(!angular.isDefined(scope.linkHtml)) {
                    scope.linkHtml = formatterService.getMedia(scope.link, scope.markdownOptions);
                }

                if(scope.linkHtml) {
                    var compiledHtml = $compile(scope.linkHtml)(scope);
                    element.append(compiledHtml);
                    scope.visible = false;
                }
            }
        };
    }]);