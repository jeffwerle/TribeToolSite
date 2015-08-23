angular.module('app.Services')
    .factory('shareService', ['$rootScope', 'commService', 'accountService', 'communityService', 'modalService', 'navigationService', function($rootScope, commService, accountService, communityService, modalService, navigationService) {
        return {
            /* The comment to share */
            comment: null,
            /* The status to share */
            status: null,
            /* The post to share */
            post: null,
            /* The image to share */
            imageFileEntry: null,
            /* The text to share */
            text: null,
            onShare: function() {
                // Share!
                navigationService.goToShare(communityService.community);
                // Close any modals
                modalService.closeAll();

                $rootScope.$broadcast('shareService:shared');
            },
            clearAll: function() {
                this.comment = null;
                this.status = null;
                this.post = null;
                this.text = null;
                this.imageFileEntry = null;
            },
            getImageUrl: function() {
                if(this.imageFileEntry) {
                    return this.imageFileEntry.Full.Url;
                }
                else {
                    return null;
                }
            },
            getDescription: function() {
                if(this.comment) {
                    return this.comment.FormattedText;
                }
                else if(this.imageFileEntry) {
                    return this.imageFileEntry.Title ? this.imageFileEntry.Title : this.imageFileEntry.Alt ? this.imageFileEntry.Alt : this.imageFileEntry.TagText ? this.imageFileEntry.TagText : this.getImageUrl();
                }
                else if(this.status) {
                    // Share the status
                    return this.status.FormattedText;
                }
                else if(this.post) {
                    return this.post.Title;
                }
                else {
                    return this.text;
                }
            },
            getLink: function() {
                if(this.comment) {
                    // Share the comment
                    return commService.getDomain() + this.comment.permalink;
                }
                else if(this.imageFileEntry) {
                    // Share the image
                    return commService.getDomain() + this.imageFileEntry.permalink;
                }
                else if(this.status) {
                    // Share the status
                    return commService.getDomain() + this.status.permalink;
                }
                else if(this.post) {
                    // Share the post
                    return commService.getDomain() + this.post.permalink;
                }
                else {
                    return null;
                }
            },
            getTextToShare: function() {
                if(this.text) {
                    // Share the text
                    return this.text;
                }
                else {
                    var link = this.getLink();
                    var text = this.getDescription();
                    var image = this.getImageUrl();

                    if(!image && !text && !link) {
                        return null;
                    }

                    return image ? '||' + image + '||' : text ? text + (link ? ' ' + link : '') : link;
                }
            }
        };
    }]);