angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryStaff', ['uiService', 'dmusiclibraryInstrumentService',  'dmusiclibraryNotationService', function(uiService, instrumentService, notationService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div class="staffContainer" style="margin: auto;">' +
                    '<div class="staff" style="width: 100%; height: 200px;"></div>' +
                    '<canvas class="staffCanvas" style="display:none;"></canvas>' +
                    '<img class="staffImage" alt="Staff">' +
                '</div>',
            scope: {
                staff: '=',
                report: '=',
                onImageRendered: '=',
                containerParentClass: '='
            },
            link: function($scope, element, attrs) {
                var staff = $scope.staff;
                var modifications = $scope.report;

                var staffContainer = $(element);
                var staffSvgCanvasContainer = staffContainer.find('.staff');
                var staffCanvas = staffContainer.find('.staffCanvas');
                var staffImage = staffContainer.find('.staffImage');
                var staffImageElement = staffImage[0];

                var renderer = notationService.renderStaff(staff, modifications, staffSvgCanvasContainer);

                var containerParent = $scope.containerParentClass ? staffContainer.closest('.' + $scope.containerParentClass) : null;

                // Constrain the width if applicable
                if(containerParent !== null) {

                    var chartWidth = notationService.getStaffWidthFromRenderer(renderer) + 20;

                    if(chartWidth > containerParent.width())
                        chartWidth = containerParent.width();

                    staffContainer.width(chartWidth);
                }

                canvg(staffCanvas[0], staffSvgCanvasContainer.html());
                var dataUrl = staffCanvas[0].toDataURL();
                staffImageElement.src = dataUrl;

                if($scope.onImageRendered) {
                    $scope.onImageRendered(dataUrl);
                }

                staffSvgCanvasContainer.hide();

                if($scope.report.MeasureText.length > 0) {
                    var measureText = $scope.report.MeasureText[0];
                    staffImageElement.alt = measureText.Text + ' ' + $scope.report.ReportName + ' Notation';
                }

            }
        };
    }]);