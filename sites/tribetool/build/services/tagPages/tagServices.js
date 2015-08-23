angular.module('app.Services')
    .factory('tagService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            hasImage: function(tagEntry) {
                return tagEntry && tagEntry.MainImage && tagEntry.MainImage.Small;
            },
            getTagImageUrl: function(tagEntry) {
                return this.hasImage(tagEntry) ? tagEntry.MainImage.Small.Url : 'images/silhouette-small.png';
            },
            getTagsWithImages: function(tags) {
                if(!tags) {
                    return [];
                }

                var tagsWithImages = [];
                for(var i = 0; i < tags.length; i++) {
                    if(this.hasImage(tags[i])) {
                        tagsWithImages.push(tags[i]);
                    }
                }

                return tagsWithImages;
            },
            prioritizeImages: function(tags) {
                var tagsWithImages = [];
                var tagsWithoutImages = [];
                for(var i = 0; i < tags.length; i++) {
                    if(this.hasImage(tags[i])) {
                        tagsWithImages.push(tags[i]);
                    }
                    else {
                        tagsWithoutImages.push(tags[i]);
                    }
                }

                return tagsWithImages.concat(tagsWithoutImages);
            }
        };
    }]);