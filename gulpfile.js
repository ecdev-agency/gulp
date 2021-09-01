'use strict'

const   gulp            = require('gulp'),
        sass            = require('gulp-sass')(require('sass')),
        dependents      = require('gulp-dependents'),
        minifyCSS       = require('gulp-csso'),
        sourcemaps      = require('gulp-sourcemaps'),
        autoprefixer    = require('gulp-autoprefixer'),
        uglify          = require('gulp-uglify'),
        babel           = require('gulp-babel'),
        rename          = require('gulp-rename'),
        browserSync     = require('browser-sync').create();

/**
 * Directory SCSS / CSS / JS
 * @type {string}
 */
const   scssRoot    = './assets/scss',
        cssRoot     = './assets/css',
        jsRoot      = './assets/js';

/**
 * glob scss and js
 * @type {{sass: string[]}}
 */
const glob = {
    sass: [
        `${scssRoot}/general.scss`,
        `${scssRoot}/base/*.scss`,
        `${scssRoot}/components/*.scss`,
        `${scssRoot}/layout/*.scss`,
        `${scssRoot}/modules/*.scss`,
        `${scssRoot}/pages/*.scss`
    ],
    css: [
        `${scssRoot}/general.scss`,
        `${scssRoot}/pages/*.scss`
    ],
    js: [
        `${jsRoot}/*.js`,
        `${jsRoot}/modules/*.js`,
        `${jsRoot}/pages/*.js`,
        `${jsRoot}/plugins/*.js`,
        `${jsRoot}/plugins/**/*.js`,
        `${jsRoot}/sections/*.js`
    ],
    jsRqt: [
        `${jsRoot}/rqt/*.js`
    ],
}

/**
 * CSS Compile
 * @param cb
 */
function compileCSS (cb) {

    gulp.src(glob.sass, { since: gulp.lastRun(compileCSS) })
        .pipe(dependents())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCSS())
        .pipe(autoprefixer(['last 5 versions', '> 1%', 'IE 10', 'IE 11'], {cascade: true}))
        .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./assets/css/test'))
        .on('end', cb)
}

/**
 * JS Compile
 * @param cb
 */
function compileJS (cb) {

    gulp.src(glob.js, { since: gulp.lastRun(compileJS) })
        .pipe(dependents())
        .pipe(babel(
            {
                "presets": [
                    ["@babel/preset-env", {
                        "targets": {
                            "browsers": ["ie >= 11"]
                        },
                        "useBuiltIns": "entry",
                        "corejs": 3
                    }]
                ]
            }
        ))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(`${jsRoot}/min`))
        .on('end', cb)
}

/**
 * JS RQT Compile
 * @param cb
 */
function compileJSRQT (cb) {

    gulp.src(glob.jsRqt, { since: gulp.lastRun(compileJSRQT) })
        .pipe(dependents())
        .pipe(babel(
            {
                "presets": [
                    ["@babel/preset-env", {
                        "targets": {
                            "browsers": ["ie >= 11"]
                        },
                        "useBuiltIns": "entry",
                        "corejs": 3
                    }]
                ]
            }
        ))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(`${jsRoot}/min/rqt`))
        .on('end', cb)
}

/**
 * Start Watch
 */
function watchCompile () {

    browserSync.init({
        proxy: "http://test-gulp",
        notify: false
    });

    gulp.watch(glob.sass, compileCSS).on('change', browserSync.reload)
    gulp.watch(glob.js, compileJS).on('change', browserSync.reload)
    gulp.watch(glob.jsRqt, compileJSRQT).on('change', browserSync.reload)
}

/**
 * Build Project
 * @param cb
 * @constructor
 */
function BuildProject (cb) {

    gulp.src(glob.css)
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCSS())
        .pipe(autoprefixer(['last 5 versions', '> 1%', 'IE 10', 'IE 11'], {cascade: true}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./assets/css/test'))
        .on('end', cb)
}
/**
 * Compile Start Gulp
 * @type {compileCSS}
 */
//exports.css = compileCSS
//exports.js = compileJS
exports.default = parallel(watchCompile)
exports.build = BuildProject
