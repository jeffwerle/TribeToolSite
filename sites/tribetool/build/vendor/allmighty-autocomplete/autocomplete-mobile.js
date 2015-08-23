var app = angular.module('autocomplete', []);

/* A search bar with auto complete */
app.directive('autocompleteInput', function() {
    var index = -1;

    return {
        restrict: 'E',
        replace: true,
        scope: {
            inputId: '=',
            clickActivation: '=?',
            searchParam: '=ngModel',
            suggestions: '=terms',
            data: '=data',
            onType: '=onType',
            onSelect: '=onSelect',
            autocompleteRequired: '=',
            showSearch: '=?'
        },
        link: function(scope, element, attrs){

            if(!angular.isDefined(scope.showSearch)) {
                scope.showSearch = true;
            }

            var attr = '';

            if(!scope.inputId) {
                scope.inputId = 'autocompleteId';
            }

            // Default attrs
            scope.attrs = {
                "placeholder": "Search...",
                "class": "",
                "id": "",
                "inputclass": "",
                "inputid": "autocompleteId"
            };

            for (var a in attrs) {
                attr = a.replace('attr', '').toLowerCase();
                // add attribute overriding defaults
                // and preventing duplication
                if (a.indexOf('attr') === 0) {
                    scope.attrs[attr] = attrs[a];
                }
            }

            scope.select = function(suggestion){
                scope.onSelect(suggestion);
            };

        },

        template: '\
        <form class="input-group autocomplete" style="margin-bottom: 0px;" id="{{ attrs.id }}" ng-submit="select(searchParam)">\
            <div class="list list-inset">\
                <label class="item item-input">\
                    <i class="icon ion-search placeholder-icon" ng-style="{\'color\': isFocused ? \'green\' : \'inherit\'}"></i>\
                      <input\
                        type="text"\
                        name="search_bar"\
                        ng-model="searchParam"\
                        placeholder="{{ attrs.placeholder }}"\
                        id="{{inputId}}"\
                        class="form-control autocomplete-input {{ attrs.inputclass }}"\
                        ng-required="autocompleteRequired" \
                        ng-focus="isFocused=true;onFocused()"\
                        ng-blur="isFocused=false"/>\
                </label>\
                <autocomplete input-id="inputId" completing="completing" ng-model="searchParam" terms="suggestions" data="data" on-type="onType" on-select="onSelect" autocomplete-required="autocompleteRequired" click-activation="clickActivation"></autocomplete>\
            </div>\
        </form>'
    };
});

/*
<div ng-show="showSearch" class="input-group-btn">\
    <button type="submit" class="btn form-control autocomplete-input autocomplete-search-button {{ attrs.inputclass }}" ng-class="{\'btn-success\': isFocused}"><span class="glyphicon glyphicon-search"></span></button>\
</div>\
    */