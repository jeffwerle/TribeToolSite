angular.module('app.Directives')
    .directive('toggleDisplayBlockOnClick', [function() {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var dropdownMenu = $(elem).first('.dropdown-menu');
                elem.on('click', function(event) {
                    event.preventDefault();
                    if(dropdownMenu.css('display') === 'block')
                        dropdownMenu.css('display', 'relative');
                    else
                        dropdownMenu.css('display', 'block');
                });
            }
        };
    }]);