angular.module('dmusiclibrary.Directives')
    .directive('dmusiclibraryMidiSound',  ['dmusiclibraryMidiService', function(midiService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<span>' +
                    '<img ng-src="{{form.icon}}" ng-if="midiSound" style="height: 16px;" ng-click="playSound(midiSound)" alt="Play">' +
                '</span>',
            scope: {
                midiSound: '='
            },
            controller: ['$scope', function($scope) {
                $scope.form = {
                    icon: '/sites/musiclibrary/images/midi/play.png'
                };
            }],
            link: function(scope, elem, attrs) {

                scope.playSound = function(sound) {
                    scope.form.icon = '/sites/musiclibrary/images/midi/pause.png';
                    midiService.playSound(sound, { }, function() {
                        scope.form.icon = '/sites/musiclibrary/images/midi/play.png';
                    });
                };
            }
        };
    }])
    .directive('dmusiclibraryMidiSoundBlackIcon',  ['dmusiclibraryMidiService', function(midiService) {
        return {
            restrict: 'E',
            replace: 'true',
            transclude: true,
            template:
                '<div>' +
                    '<div ng-show="!playOptions.playing">' +
                        '<i class="fa fa-play-circle fa-4x black-icon-hover-grey" ng-click="play()"></i>' +
                    '</div>' +
                    '<div ng-show="playOptions.playing">' +
                        '<i class="fa fa-stop fa-4x black-icon-hover-grey" ng-click="stop()"></i>' +
                    '</div>' +
                '</div>',
            scope: {
                getMidiSound: '='
            },
            link: function(scope, elem, attrs) {
                scope.playOptions = {
                    playing: false
                };

                scope.play = function() {
                    scope.playOptions.playing = true;
                    midiService.playSound(scope.getMidiSound(), scope.playOptions, function() {
                        // Sound complete
                        scope.playOptions.playing = false;
                    });
                };

                scope.stop = function() {
                    scope.playOptions.playing = false;
                    midiService.stop();
                };
            }
        };
    }]);