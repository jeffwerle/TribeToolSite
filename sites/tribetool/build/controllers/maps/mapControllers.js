angular.module('app.Controllers')
    .controller('editMapLocationController', ['$scope', 'commService', '$modalInstance', 'notificationService', 'items', 'playlistService', 'mapService', 'tagPageService', function($scope, commService, $modalInstance, notificationService, items, playlistService, mapService, tagPageService) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.tagSearchOptions = {
            onSelect: function(entity) {
                // Don't redirect to the tag page
                return false;
            }
        };

        $scope.options = items[0];
        $scope.map = $scope.options.map;
        $scope.mapLocation = $scope.options.mapLocation;
        $scope.coordinate = $scope.options.clickLocation;
        $scope.isEditing = $scope.mapLocation && $scope.mapLocation.Id;

        $scope.form = {
            MapId: $scope.map.Id,
            Coordinate: $scope.coordinate,
            Name: null,
            Tag: null,
            autofocus: true
        };
        if($scope.isEditing) {
            $scope.coordinate = $scope.mapLocation.Coordinate;
            // We're being asked to edit or remove a map location
            $scope.form = $scope.mapLocation;

            // Get the playlists from the associated tag
            tagPageService.getTagPage($scope.mapLocation.Tag, {
                GetFinalRedirect: true
            }, function(data) {
                // Success
                $scope.tagPage = data.TagPage;
            }, function(data) {
                // Failure
                commService.showErrorAlert('Tag Playlists could not be loaded.');
            });
        }
        else {
            // We're being asked to add a map location at the specified click location
        }


        $scope.editPlaylists = function() {
            playlistService.editPlaylists({
                playlists: $scope.mapLocation.Playlists || [],
                mapLocation: $scope.mapLocation,
                onCancelled: function() {
                    // Exited
                }
            });
        };

        $scope.submitDelete = function() {
            $scope.errorMessage = '';
            if($scope.mapLocation) {
                $scope.processing = 'Deleting...';
                mapService.removeMapLocation($scope.mapLocation, function(data) {
                    // Success
                    commService.showSuccessAlert('Map Location deleted successfully!');
                    $scope.processing = null;

                    var indexOfMapLocation = $scope.map.MapLocations.indexOf($scope.mapLocation);
                    $scope.map.MapLocations.splice(indexOfMapLocation, 1);
                    $scope.cancel();
                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    $scope.processing = null;
                });
            }
        };

        $scope.errorMessage = '';
        $scope.submit = function() {
            if(!$scope.form.Tag) {
                $scope.errorMessage = 'A valid Tag must be selected.';
                commService.showErrorAlert('A valid Tag must be selected.');
                return;
            }

            $scope.errorMessage = '';

            if($scope.isEditing) {
                // Submit the edit
                $scope.processing = 'Saving...';
                if($scope.form.Tag === $scope.mapLocation.Tag &&
                    $scope.form.Name === $scope.mapLocation.Name) {
                    commService.showSuccessAlert('Map Location saved successfully!');
                    $scope.cancel();
                    return;
                }

                mapService.editMapLocation({
                    Id: $scope.mapLocation.Id,
                    MapId: $scope.mapLocation.MapId,
                    Tag: $scope.form.Tag,
                    Name: $scope.form.Name
                }, function(data) {
                    // Success
                    commService.showSuccessAlert('Map Location saved successfully!');
                    $scope.processing = null;
                    angular.extend($scope.mapLocation, $scope.form);
                    $scope.cancel();
                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    $scope.processing = null;
                });
            }
            else {
                // Create the new map location
                $scope.processing = 'Creating...';
                mapService.createMapLocation($scope.form, function(data) {
                    // Success
                    $scope.mapLocation = data.MapLocation;
                    commService.showSuccessAlert('Map Location created successfully!');
                    $scope.processing = null;
                    $scope.map.MapLocations.push($scope.mapLocation);
                    $scope.cancel();
                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    $scope.processing = null;
                });
            }
        };
    }]);

