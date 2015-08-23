
module.exports = function(grunt) {


    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-ng-annotate');
    var rewrite = require('connect-modrewrite');

/*
    var cssFiles = [
        'src/app/styles/font-awesome.min.css',

        'vendor/perfect-scrollbar/perfect-scrollbar.css',

        'vendor/angular-loading-bar/loading-bar.css',

        'vendor/angular-bootstrap-lightbox/angular-bootstrap-lightbox.css',

        'src/shared/styles/app.css',
        'src/app/styles/app.css',
        'src/app/styles/chord-grid.css',

        'vendor/ng-img-crop/ng-img-crop.css',

        'vendor/intro/introjs.css'

    ];
*/
/*
    var cssMobileFiles = [
        'src/app/styles/font-awesome.min.css',

        'vendor/perfect-scrollbar/perfect-scrollbar.css',

        'vendor/angular-loading-bar/loading-bar.css',

        'vendor/jr-crop/jr-crop.css',

        'src/shared/styles/app.css',
        'src/mobile/styles/app.css',
    ];
*/
    var config =
    {
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            build: {
                version: '<%= pkg.version %>'
            }
        },
        jshint: {
            options: {
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            },
            files: ['gruntFile.js',
                'src/app/**/*.js',
                'src/shared/**/*.js',
                'src/mobile/**/*.js',
                '!**/sound-fonts/**']
        },
        clean: {
            preBuild: ['build'],
            postBuild: ['build/app.js', 'build/vendor.js'],
            preBuildMobile: ['www'],
            postBuildMobile: ['www/app.js', 'www/vendor.js']
        },
        /**
         * `grunt-contrib-less` handles our LESS compilation and uglification automatically.
         * Only our `stylesheet.less` file is included in compilation; all other files
         * must be imported from this file.
         */
        less: {
            /* src/app/less/stylesheet.less and src/mobile/less/stylesheet.less should each reference
            * src/shared/less/stylesheet.less if they so choose */
            all: {
                files: [
                    { src: ['src/app/less/stylesheet.less'], dest: 'build/styles/app.min.css' }
                ],
                options: {
                    cleancss: true,
                    compress: true
                }
            },
            allMobile: {
                files: [
                    { src: ['src/mobile/less/stylesheet.less'], dest: 'www/styles/app.min.css' }
                ],
                options: {
                    cleancss: true,
                    compress: true
                }
            }
        },
        concat: {
            vendor: {
                src: [
                    /* JQuery. Note that we include jquery before angular. */
                    'vendor/jquery/jquery-1.11.0.js',


                    /* Angular File Upload */
                    /* shim is needed to support upload progress/abort for HTML5 FormData browsers. */
                    /* https://github.com/danialfarid/angular-file-upload */
                    'vendor/angular-file-upload/angular-file-upload-html5-shim.js',

                    /* Angular */
                    'vendor/angular/angular.js',
                    'vendor/angular/angular-route.js',
                    'vendor/angular/angular-resource.js',
                    'vendor/angular/angular-animate.js',
                    'vendor/angular/angular-cookies.js',
                    'vendor/angular/angular-touch.js',
                    'vendor/showdown/ngSanitize.js', // Custom implementation of $sanitize

                    'vendor/angular-recaptcha/angular-recaptcha.js',

                    'vendor/angular-perfect-scrollbar/angular-perfect-scrollbar.js',

                    /* Angular Loading Bar */
                    'vendor/angular-loading-bar/loading-bar.js',

                    /* Angular Bootstrap Lightbox */
                    'vendor/angular-bootstrap-lightbox/angular-bootstrap-lightbox.js',

                    /* Angular Swipe */
                    'vendor/angular-swipe/angular-swipe.js',

                    /* ocLazyLoad */
                    'vendor/ocLazyLoad/ocLazyLoad.min.js',

                    /* Jquery UI */
                    'vendor/jquery/jquery-ui-1.10.4.min.js',
                    'vendor/jquery/jquery.ui.touch-punch.min.js', // allows drag to happen with jQuery UI on touch devices
                    'vendor/jquery/jquery-ui-sortable.js',

                    /* Hammer.js */
                    'vendor/hammer/hammer.js',
                    'vendor/hammer/angular-hammer.js',

                    /* fastclick */
                    'vendor/fastclick/fastclick.js',


                    /* Angular File Upload */
                    'vendor/angular-file-upload/angular-file-upload.js',

                    /* Match Media */
                    'vendor/matchmedia/matchmedia-ng.js',

                    /* perfect-scrollbar */
                    'vendor/perfect-scrollbar/perfect-scrollbar.js',
                    'vendor/perfect-scrollbar/jquery.mousewheel.js',

                    /* Bootstrap JS */
                    'vendor/bootstrap/js/affix.js',
                    'vendor/bootstrap/js/tooltip.js',
                    'vendor/bootstrap/js/popover.js',

                    /* AngularUI Bootstrap Templates */
                    'vendor/angular-ui/ui-bootstrap-tpls-0.12.1.js',

                    /* noty */
                    'vendor/noty/noty.js',

                    'vendor/ng-img-crop/ng-img-crop.js',

                    /* ngInfiniteScroll */
                    'vendor/infinite-scroll/infinite-scroll.js',

                    'vendor/socket.io/socket.io.js',
                    'vendor/angular-socket-io/socket.min.js',




                    'vendor/showdown/showdown.js',
                    'vendor/showdown/extensions/github.js',
                    'vendor/showdown/extensions/prettify.js',
                    'vendor/showdown/extensions/table.js',

                    'vendor/showdown/extensions/wiki.js',
                    'vendor/showdown/extensions/tribetool.js',
                    'vendor/showdown/extensions/community.js',

                    'vendor/showdown/ng-showdown.js',
                    'vendor/angular-markdown-directive/markdown.js',

                    /* Youtube */
                    'vendor/youtube/youtubeNonMobile.js',
                    'vendor/youtube/youtube.js',

                    'vendor/google/google.js',

                    /* mb.YTPlayer */
                    'vendor/mb-ytplayer/mb.YTPlayer.js',

                    /* Autocomplete */
                    'vendor/allmighty-autocomplete/autocomplete-desktop.js',
                    'vendor/allmighty-autocomplete/autocomplete.js',


                    /* JsPlumb */
                    /* Taken out of index.html for debug
                    'vendor/jsplumb/js/dom.jsPlumb-1.7.2.js',
                    'vendor/jsplumb/js/jquery.jsPlumb-1.7.2.js',
                    'vendor/jsplumb/jsPlumbService.js',
                    */

                    /* Intro js*/
                    'vendor/intro/intro.js',
                    'vendor/angular-intro/angular-intro.js',

                    /* Angulike */
                    'vendor/angulike/angulike.js',

                    /* angular-facebook */
                    'vendor/angular-facebook/angular-facebook.js',

                    /* angular-google-plus */
                    'vendor/angular-google-plus/angular-google-plus.js',

                    /* Bootbox */
                    'vendor/bootstrap/js/modal.js',
                    'vendor/bootbox/bootbox.js',


                    'vendor/angular-stripe-checkout/angular-stripe-checkout.js',
                    'vendor/angular-payments/angular-payments.min.js'





                ],
                dest: 'build/vendor.js'
            },
            vendorMobile: {
                src: [
                    'vendor/jquery/jquery-1.11.0.js',

                    // Notice that we use ionic.bundle.min.js because
                    // ionic.bundle.js doesn't play nice when minified
                    'vendor/ionic/js/ionic.bundle.js',


                    /* ngCordova */
                    'vendor/ng-cordova/dist/ng-cordova.js',

                    'vendor/showdown/ngSanitize.js', // Custom implementation of $sanitize (for markdown)

                    /* ocLazyLoad */
                    'vendor/ocLazyLoad/ocLazyLoad.min.js',


                    /* Match Media */
                    'vendor/matchmedia/matchmedia-ng.js',


                    'vendor/socket.io/socket.io.js',
                    'vendor/angular-socket-io/socket.min.js',



                    'vendor/showdown/showdown.js',
                    'vendor/showdown/extensions/github.js',
                    'vendor/showdown/extensions/prettify.js',
                    'vendor/showdown/extensions/table.js',

                    'vendor/showdown/extensions/wiki.js',
                    'vendor/showdown/extensions/tribetool.js',
                    'vendor/showdown/extensions/community.js',

                    'vendor/showdown/ng-showdown.js',
                    'vendor/angular-markdown-directive/markdown.js',



                    /* Youtube */
                    'vendor/youtube/youtubeMobile.js',
                    'vendor/youtube/youtube.js',


                    /* noty */
                    'vendor/noty/noty.js',


                    /* Autocomplete */
                    'vendor/allmighty-autocomplete/autocomplete-mobile.js',
                    'vendor/allmighty-autocomplete/autocomplete.js',


                    /* Auto-Validate */
                    'vendor/jcs-auto-validate/jcs-auto-validate.js',


                    /* jr-crop */
                    'vendor/jr-crop/jr-crop.js',


                ],
                dest: 'www/vendor.js'
            },
            scripts: {
                src: [
                    'src/shared/**/*.js',
                    'src/app/**/*.js',
                    '!**/sound-fonts/**'
                ],
                dest: 'build/app.js'
            },
            scriptsMobile: {
                src: [
                    'src/shared/**/*.js',
                    'src/mobile/**/*.js',
                    '!**/sound-fonts/**'
                ],
                dest: 'www/app.js'
            },
            /*
            styles: {
                src: cssFiles,
                dest: 'build/styles/app.css'
            },
            stylesMobile: {
                src: cssMobileFiles,
                dest: 'www/styles/app.css'
            },
            */
            main: {
                options: {
                    process: true
                },
                src: ['src/app/index-production.html'],
                dest: 'build/index.html'
            },
            mainMobile: {
                options: {
                    process: true
                },
                src: ['src/mobile/index-production.html'],
                dest: 'www/index.html'
            },
            dev: {
                options: {
                    process: true
                },
                src: ['src/app/index.html'],
                dest: 'build/index.html'
            },
            devMobile: {
                options: {
                    process: true
                },
                src: ['src/mobile/index.html'],
                dest: 'www/index.html'
            },
            sitemap: {
                options: {
                    process: true
                },
                src: ['src/app/sitemap.xml'],
                dest: 'build/sitemap.xml'
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true
                //remove: true,
                //add: true
            },
            all: {
                files: {
                    'build/app.js': ['build/app.js'],
                    'build/vendor.js': ['build/vendor.js']
                }
            },
            allMobile: {
                files: {
                    'www/app.js': ['www/app.js'],
                    'www/vendor.js': ['www/vendor.js']
                }
            }
        },
        copy: {
            all: {
                files: [
                    { expand: true, cwd: 'src/shared', src: ['images/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/shared', src: ['audio/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/shared', src: ['fonts/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/shared', src: ['sound-fonts/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/shared', src: ['app-templates/**/*.html'], dest: 'build/' },

                    { expand: true, cwd: 'src/app', src: ['images/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/app', src: ['audio/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/app', src: ['fonts/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/app', src: ['sound-fonts/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/app', src: ['app-templates/**/*.html'], dest: 'build/' }
                ]
            },
            allMobile: {
                files: [
                    { expand: true, cwd: 'src/shared', src: ['images/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/shared', src: ['audio/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/shared', src: ['fonts/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/shared', src: ['sound-fonts/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/shared', src: ['app-templates/**/*.html'], dest: 'www/' },

                    { expand: true, cwd: 'src/mobile', src: ['images/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/mobile', src: ['audio/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/mobile', src: ['fonts/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/mobile', src: ['sound-fonts/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/mobile', src: ['app-templates/**/*.html'], dest: 'www/' }


                ]
            },
            scripts: {
                files: [
                    { expand: true, cwd: 'src/shared', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'build/' },
                    { expand: true, cwd: 'src/app', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'build/' }
                ]
            },
            scriptsMobile: {
                files: [
                    { expand: true, cwd: 'src/shared', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'www/' },
                    { expand: true, cwd: 'src/mobile', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'www/' }
                ]
            },
            vendor: {
                files: [
                    { expand: true,  src: ['vendor/**'], dest: 'build/' }
                ]
            },
            vendorMobile: {
                files: [
                    { expand: true,  src: ['vendor/**'], dest: 'www/' }
                ]
            }
        },
        uglify: {
            all: {
                files: {
                    'build/all.min.js': ['build/vendor.js', 'build/app.js']
                }
            },
            allMobile: {
                files: {
                    'www/all.min.js': ['www/vendor.js', 'www/app.js']
                }
            }

/*
            options: {
                beautify : false,
                mangle   : true,
                compress: true
            }
            */

/*
            options : {
                beautify : true,
                mangle   : false,
                compress: false
            }
*/

            /*,
            options : {
                beautify : true,
                mangle   : false,
                compress: false
            }*/

        },
        /*
        recess: {
            all: {
                options: {
                    compile: true,
                    compress: true
                },
                files: {
                    'build/styles/app.min.css': cssFiles
                }
            },
            allMobile: {
                options: {
                    compile: true,
                    compress: true
                },
                files: {
                    'www/styles/app.min.css': cssMobileFiles
                }
            }
        },
        */
        watch: {
            all: {
                files: ['src/**/*.js', 'src/**/*.less', 'src/**/*.html'],
                tasks: ['devNoVendorCopy']
            },
            allMobile: {
                files: ['src/**/*.js', 'src/**/*.less', 'src/**/*.html'],
                tasks: ['devNoVendorCopyMobile']
            }
        },
        connect: {
            options: {
                middleware: function(connect, options) {
                    var middleware = [];

                    var rules = [
                        '!\\.html|\\.js|\\.css|\\.less|\\.svg|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
                    ];

                    middleware.push(rewrite(rules));

                    var base = options.base;
                    if (!Array.isArray(base)) {
                        base = [base];
                    }
                    base.forEach(function(path) {
                        middleware.push(connect.static(path));
                    });

                    return middleware;
                }
            },
            devServer: {
                options: {
                    port: 42950,
                    hostname: '',
                    base: './build',
                    keepAlive: true
                }
            }
        }
    };


    var addCommunity = function(communityName) {
        config.uglify.all.files['build/sites/' + communityName + '/all.min.js'] = [
            'build/sites/' + communityName + '/vendor.js',
            'build/sites/' + communityName + '/app.js'
        ];

        config.uglify.allMobile.files['www/sites/' + communityName + '/all.min.js'] = [
            'www/sites/' + communityName + '/vendor.js',
            'www/sites/' + communityName + '/app.js'
        ];

/*
        config.recess.all.files['build/sites/' + communityName + '/styles/app.min.css'] = [
            'sites/' + communityName + '/src/shared/styles/app.css',
            'sites/' + communityName + '/src/app/styles/app.css'
        ];
        config.recess.allMobile.files['www/sites/' + communityName + '/styles/app.min.css'] = [
            'sites/' + communityName + '/src/shared/styles/app.css',
            'sites/' + communityName + '/src/mobile/styles/app.css'
        ];
*/
        /* src/app/less/stylesheet.less and src/mobile/less/stylesheet.less should each reference
         * src/shared/less/stylesheet.less if they so choose */
        config.less.all.files.push({ src: ['sites/' + communityName + '/src/app/less/stylesheet.less'], dest: 'build/sites/' + communityName + '/styles/app.min.css' });
        config.less.allMobile.files.push({ src: ['sites/' + communityName + '/src/mobile/less/stylesheet.less'], dest: 'www/sites/' + communityName + '/styles/app.min.css' });


        config.jshint.files = config.jshint.files.concat([
            'sites/' + communityName + '/src/shared/**/*.js',
            'sites/' + communityName + '/src/app/**/*.js',
            'sites/' + communityName + '/src/mobile/**/*.js',
            '!**/sound-fonts/**'
        ]);

        config.copy.all.files = config.copy.all.files.concat([
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['images/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['audio/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['fonts/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['sound-fonts/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['app-templates/**/*.html'], dest: 'build/sites/' + communityName + '/' },

            { expand: true, cwd: 'sites/' + communityName + '/src/app', src: ['images/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/app', src: ['audio/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/app', src: ['fonts/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/app', src: ['sound-fonts/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/app', src: ['app-templates/**/*.html'], dest: 'build/sites/' + communityName + '/' }
        ]);
        config.copy.allMobile.files = config.copy.allMobile.files.concat([
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['images/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['audio/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['fonts/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['sound-fonts/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['app-templates/**/*.html'], dest: 'www/sites/' + communityName + '/' },

            { expand: true, cwd: 'sites/' + communityName + '/src/mobile', src: ['images/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/mobile', src: ['audio/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/mobile', src: ['fonts/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/mobile', src: ['sound-fonts/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/mobile', src: ['app-templates/**/*.html'], dest: 'www/sites/' + communityName + '/' }
        ]);

        config.copy.scripts.files = config.copy.scripts.files.concat([
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'build/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/app', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'build/sites/' + communityName + '/' }
        ]);
        config.copy.scriptsMobile.files = config.copy.scriptsMobile.files.concat([
            { expand: true, cwd: 'sites/' + communityName + '/src/shared', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'www/sites/' + communityName + '/' },
            { expand: true, cwd: 'sites/' + communityName + '/src/mobile', src: ['**/*.js', '!**/sound-fonts/**'], dest: 'www/sites/' + communityName + '/' }
        ]);

        config.copy.vendor.files = config.copy.vendor.files.concat([
            { expand: true, cwd: 'sites/' + communityName + '/vendor', src: ['**/**'], dest: 'build/sites/' + communityName + '/vendor/' }
        ]);
        config.copy.vendorMobile.files = config.copy.vendorMobile.files.concat([
            { expand: true, cwd: 'sites/' + communityName + '/vendor', src: ['**/**'], dest: 'www/sites/' + communityName + '/vendor/' }
        ]);


        config.copy[communityName + 'DebugFile'] = {
            files: [
                { expand: true, cwd: 'sites/' + communityName + '/src', src: ['debugFile.js'], dest: 'build/sites/' + communityName + '/' }
            ]
        };
        config.copy[communityName + 'DebugFileMobile'] = {
            files: [
                { expand: true, cwd: 'sites/' + communityName + '/src', src: ['debugFile.js'], dest: 'www/sites/' + communityName + '/' }
            ]
        };


        config.watch.all.files = config.watch.all.files.concat([
            'sites/' + communityName + '/src/**/*.js',
            'sites/' + communityName + '/src/**/*.less',
            'sites/' + communityName + '/src/**/*.html'
            ]);
        config.watch.allMobile.files = config.watch.allMobile.files.concat([
            'sites/' + communityName + '/src/**/*.js',
            'sites/' + communityName + '/src/**/*.less',
            'sites/' + communityName + '/src/**/*.html'
        ]);

        var vendorFileContents = null;
        var splitContents = null;
        var i = 0;
        var vendorFiles = [];
        if(grunt.file.exists('sites/' + communityName + '/src/app/vendor.txt')) {
            vendorFileContents = grunt.file.read('sites/' + communityName + '/src/app/vendor.txt');
            //grunt.log.ok(vendorFileContents);
            // Remove comments (regex is for comments)
            vendorFileContents = vendorFileContents.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(<![\-\-\s\w\>\/]*\>)/g, '');
            vendorFileContents = vendorFileContents.replace(/'/g, '');
            splitContents = vendorFileContents.split(',');
            for(i = 0; i < splitContents.length; i++) {
                if(splitContents[i])
                    vendorFiles.push(splitContents[i]);
            }
        }
        for(var j = 0; j < vendorFiles.length; j++) {
            //grunt.log.ok(vendorFiles[j]);
        }

        config.concat[communityName + 'Vendor'] =  {
            src: vendorFiles,
            dest: 'build/sites/' + communityName + '/vendor.js'
        };



        var vendorFilesMobile = [];
        if(grunt.file.exists('sites/' + communityName + '/src/mobile/vendor.txt')) {
            vendorFileContents = grunt.file.read('sites/' + communityName + '/src/mobile/vendor.txt');
            //grunt.log.ok(vendorFileContents);
            // Remove comments (regex is for comments)
            vendorFileContents = vendorFileContents.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(<![\-\-\s\w\>\/]*\>)/g, '');
            vendorFileContents = vendorFileContents.replace(/'/g, '');
            splitContents = vendorFileContents.split(',');
            for(i = 0; i < splitContents.length; i++) {
                if(splitContents[i])
                    vendorFilesMobile.push(splitContents[i]);
            }
        }
        config.concat[communityName + 'VendorMobile'] =  {
            src: vendorFilesMobile,
            dest: 'www/sites/' + communityName + '/vendor.js'
        };

        config.concat[communityName + 'Scripts'] = {
            src: [
                'sites/' + communityName + '/src/shared/**/*.js',
                'sites/' + communityName + '/src/app/**/*.js',
                '!**/sound-fonts/**'
            ],
            dest: 'build/sites/' + communityName + '/app.js'
        };
        config.concat[communityName + 'ScriptsMobile'] = {
            src: [
                'sites/' + communityName + '/src/shared/**/*.js',
                'sites/' + communityName + '/src/mobile/**/*.js',
                '!**/sound-fonts/**'
            ],
            dest: 'www/sites/' + communityName + '/app.js'
        };

        config.concat[communityName + 'Styles'] = {
            src: [
                'sites/' + communityName + '/src/shared/styles/app.css',
                'sites/' + communityName + '/src/app/styles/app.css'
            ],
            dest: 'build/sites/' + communityName + '/styles/app.css'
        };
        config.concat[communityName + 'StylesMobile'] = {
            src: [
                'sites/' + communityName + '/src/shared/styles/app.css',
                'sites/' + communityName + '/src/mobile/styles/app.css'
            ],
            dest: 'www/sites/' + communityName + '/styles/app.css'
        };

        config.ngAnnotate.all.files['build/sites/' + communityName + '/app.js'] = ['build/sites/' + communityName + '/app.js'];
        config.ngAnnotate.all.files['build/sites/' + communityName + '/vendor.js'] = ['build/sites/' + communityName + '/vendor.js'];
        config.ngAnnotate.allMobile.files['www/sites/' + communityName + '/app.js'] = ['www/sites/' + communityName + '/app.js'];
        config.ngAnnotate.allMobile.files['www/sites/' + communityName + '/vendor.js'] = ['www/sites/' + communityName + '/vendor.js'];

        // Clean up in post-build
        config.clean.postBuild.push('build/sites/' + communityName + '/app.js');
        config.clean.postBuild.push('build/sites/' + communityName + '/vendor.js');

        config.clean.postBuildMobile.push('www/sites/' + communityName + '/app.js');
        config.clean.postBuildMobile.push('www/sites/' + communityName + '/vendor.js');

    };




    // The "default" community is simply for the default files when a community's app.js file has
    // not been set
    var communities = ['default', 'the-mouse-landing', 'music-theory-notes',

    /*Libraries/Dependencies*/
    'musiclibrary'];

    var communityConcatVendorTasks = [];
    var communityConcatScriptsTasks = [];
    var communityConcatStylesTasks = [];
    var communityCopyDebugFile = [];
    var communityConcatVendorTasksMobile = [];
    var communityConcatScriptsTasksMobile = [];
    var communityConcatStylesTasksMobile = [];
    var communityCopyDebugFileMobile = [];
    for(var i = 0; i < communities.length; i++) {
        var communityName = communities[i];
        communityName = communityName.replace(/-/g, '');
        addCommunity(communityName);
        communityConcatVendorTasks.push('concat:' + communityName + 'Vendor');
        communityConcatScriptsTasks.push('concat:' + communityName + 'Scripts');
        communityConcatStylesTasks.push('concat:' + communityName + 'Styles');
        communityConcatStylesTasks.push('copy:' + communityName + 'DebugFile');
        communityConcatVendorTasksMobile.push('concat:' + communityName + 'VendorMobile');
        communityConcatScriptsTasksMobile.push('concat:' + communityName + 'ScriptsMobile');
        communityConcatStylesTasksMobile.push('concat:' + communityName + 'StylesMobile');
        communityConcatStylesTasksMobile.push('copy:' + communityName + 'DebugFileMobile');
    }






    grunt.initConfig(config);

    grunt.registerTask('startMobileProduction', function() {
    });
    grunt.registerTask('startProduction', function() {
    });
    grunt.registerTask('startNonProduction', function() {
    });


    // Note that we have no need to call communityCopyDebugFile during production because all
    // files will be concatenated into an app.js for the community so we won't need to load
    // its individual files as the debugFile does.
    grunt.registerTask('communityCopyDebugFile', communityCopyDebugFile);
    grunt.registerTask('communityCopyDebugFileMobile', communityCopyDebugFileMobile);

    grunt.registerTask('communityConcatVendor', communityConcatVendorTasks);
    grunt.registerTask('communityConcatScripts', communityConcatScriptsTasks);
    grunt.registerTask('communityConcatStyles', communityConcatStylesTasks);

    grunt.registerTask('communityConcatVendorMobile', communityConcatVendorTasksMobile);
    grunt.registerTask('communityConcatScriptsMobile', communityConcatScriptsTasksMobile);
    grunt.registerTask('communityConcatStylesMobile', communityConcatStylesTasksMobile);


    /* In dev, make sure we keep all of the files separate so we can step into them while debugging */
    grunt.registerTask('devNoVendorCopy', ['copy:all', /*'communityCopyDebugFile',*/ 'copy:scripts', 'concat:dev', 'concat:sitemap', 'less:all', /*'concat:styles', 'communityConcatStyles',*/ 'watch:all']);
    grunt.registerTask('dev', ['startNonProduction', 'clean:preBuild', 'copy:vendor',  'devNoVendorCopy']);

    /* In dev, make sure we keep all of the files separate so we can step into them while debugging */
    //grunt.registerTask('devNoVendorCopyMobile', ['copy:allMobile', /*'communityCopyDebugFileMobile',*/ 'copy:scriptsMobile', 'concat:devMobile', 'less:allMobile', 'concat:stylesMobile', 'communityConcatStylesMobile', 'watch:allMobile']);
    //grunt.registerTask('devMobile', ['clean:preBuildMobile', 'copy:vendorMobile',  'devNoVendorCopyMobile']);
    grunt.registerTask('devNoVendorCopyMobile', ['copy:allMobile', /*'communityCopyDebugFileMobile',*/ 'copy:scriptsMobile', 'concat:devMobile', 'less:allMobile',  'watch:allMobile']);
    grunt.registerTask('devMobile', ['startNonProduction', 'clean:preBuildMobile', 'copy:vendorMobile',  'devNoVendorCopyMobile']);

    //grunt.registerTask('production', ['jshint', 'clean:preBuild', 'copy:all', 'concat:vendor', 'communityConcatVendor', 'concat:scripts', 'communityConcatScripts', 'less:all', 'concat:styles', 'communityConcatStyles', 'concat:main', 'concat:sitemap', 'uglify:all', 'recess:all', 'clean:postBuild']);
    grunt.registerTask('production', ['startProduction', 'jshint', 'clean:preBuild', 'copy:all', 'concat:vendor', 'communityConcatVendor', 'concat:scripts', 'communityConcatScripts', /*'ngAnnotate:all',*/ 'less:all', 'concat:main', 'concat:sitemap', 'uglify:all', 'clean:postBuild']);

    //grunt.registerTask('productionMobile', ['jshint', 'clean:preBuildMobile', 'copy:allMobile', 'concat:vendorMobile', 'communityConcatVendorMobile', 'concat:scriptsMobile', 'communityConcatScriptsMobile', 'less:allMobile', 'concat:stylesMobile', 'communityConcatStylesMobile', 'concat:mainMobile', 'uglify:allMobile', 'recess:allMobile', 'clean:postBuildMobile']);
    grunt.registerTask('productionMobile', ['startMobileProduction', 'jshint', 'clean:preBuildMobile', 'copy:allMobile', 'concat:vendorMobile', 'communityConcatVendorMobile', 'concat:scriptsMobile', 'communityConcatScriptsMobile', /*'ngAnnotate:allMobile',*/ 'less:allMobile', 'concat:mainMobile', 'uglify:allMobile', 'clean:postBuildMobile']);

};