angular.module('app.Services')
    .factory('homeService', ['$rootScope', '$http', 'commService', function($rootScope, $http, commService) {
        return {
            columnizeList: function(list, columnCount) {
                var rows = [];
                var columnIndex = 0;
                var row = [];
                for(var i = 0; i < list.length; i++) {
                    if(columnIndex >= columnCount)
                    {
                        rows.push(row);
                        row = [];
                        columnIndex = 0;
                    }
                    row.push(list[i]);

                    columnIndex++;
                }
                if(row.length > 0)
                    rows.push(row);

                return rows;
            }
        };
    }]);