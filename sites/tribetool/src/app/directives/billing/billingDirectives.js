angular.module('app.Directives')
    .directive('paymentCard', [function() {
    return {
        link: function(scope, element, attrs) {
            function getCardByBrand(brand) {
                switch (brand) {
                    case 'Visa':
                        return '/images/cards/visa.svg';
                    case 'MasterCard':
                        return '/images/cards/mastercard.svg';
                    case 'Discover':
                        return '/images/cards/discover.svg';
                    case 'America Express':
                        return '/images/cards/amex.svg';
                    default:
                        return '';
                }
            }

            var src = getCardByBrand(attrs.paymentCard);
            element.attr('src', src);

        }
    };
}]);
