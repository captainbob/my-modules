
'use strict'

const gulp = require('gulp')
const watch = require('gulp-watch')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const webpack = require('gulp-webpack')
const minifycss = require('gulp-minify-css')
const less = require('gulp-less')
const nodePath = require("path");
const glob2base = require('glob2base');
const glob = require('glob');
const moment = require('moment');

const scripts = './src/**/*.js'
const libPath = './lib'
const csss = './src/**/*.css'
const lesss = './src/**/*.less'
const images = './src/**/images/*'

gulp.task('default', ['build'])

gulp.task('css', function () {
    buildCss()
})

gulp.task('less', function () {
    buildLess()
})

gulp.task('images', function () {
    buildImage()
})

gulp.task('build', ['css', 'less', 'images'], function () {
    buildScripts()
})

const devLibPath = './dev/node_modules/djmodules/lib'

gulp.task('css-dev', function () {
    buildCss({ dist: devLibPath })
})

gulp.task('less-dev', function () {
    buildLess({ dist: devLibPath })
})

gulp.task('images-dev', function () {
    buildImage({ dist: devLibPath })
})

gulp.task('dev', ['css-dev', 'less-dev', 'images-dev'], function () {
    buildScripts({ dist: devLibPath })
})


gulp.task('watch', ['dev'], function () {
    watch(scripts, { debounceDelay: 200 }, function (event) {
        let path = getPath(event.path);
        buildScripts({
            path: path,
            dist: devLibPath,
            base: "src"
        })
    })

    watch(csss, { debounceDelay: 200 }, function (event) {
        let path = getPath(event.path);
        buildCss({
            path: path,
            dist: devLibPath,
            base: "src"
        })
    })

    watch(lesss, { debounceDelay: 200 }, function (event) {
        let path = getPath(event.path);
        buildLess({
            path: path,
            dist: devLibPath,
            base: "src"
        })
    })
})

// scripts的编译
function buildScripts({ path, dist, base } = {}) {
    path = path || scripts;
    dist = dist || libPath;
    base = base || glob2base(new glob.Glob(path));

    gulp.src(path, {
        base: base
    }).pipe(babel({
        presets: ['es2015', 'stage-0', 'react'],
        plugins: [
            ['import', [{ "libraryName": "antd", "style": "css" }]]
        ],
    })).pipe(gulp.dest(dist)).on('end', function () {
        console.log(`[${moment().format("HH:mm:ss")}] ${path} 完成编译`);
    });
}

// css的编译
function buildCss({ path, dist, base } = {}) {
    path = path || csss;
    dist = dist || libPath;
    base = base || glob2base(new glob.Glob(path));


    gulp.src(path, {
        base: base
    }).pipe(gulp.dest(dist)).on('end', function () {
        console.log(`[${moment().format("HH:mm:ss")}] ${path} 完成编译`);
    });
}
// less的编译
function buildLess({ path, dist, base } = {}) {
    path = path || lesss;
    dist = dist || libPath;
    base = base || glob2base(new glob.Glob(path));

    gulp.src(path, {
        base: base
    }).pipe(gulp.dest(dist)).on('end', function () {
        console.log(`[${moment().format("HH:mm:ss")}] ${path} 完成编译`);
    });
}
// image的编译
function buildImage({ path, dist, base } = {}) {
    path = path || images;
    dist = dist || libPath;
    base = base || glob2base(new glob.Glob(path));

    gulp.src(path, {
        base: base
    }).pipe(gulp.dest(dist)).on('end', function () {
        console.log(`[${moment().format("HH:mm:ss")}] ${path} 完成编译`);
    });
}
// 获取去掉系统路径
function getPath(path) {
    let cwd = process.cwd()
    return path.replace(cwd, ".")
}