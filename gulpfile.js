
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> imports ::
var gulp = require('gulp'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify');
    simpleconcat = require('gulp-concat');
    concat = require('gulp-continuous-concat');


//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> DEFAULT

gulp.task('default',['libs','html','js','css'], function(){

});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> JS

gulp.task('js',function(){

    gulp.src('src/*.js')
        .pipe(gulp.dest('bin'));


    gulp.src('src/services/*.js')
        .pipe(simpleconcat('services.js'))
        .pipe(gulp.dest('./bin/'));

    gulp.src('src/ctrl/*.js')
        .pipe(simpleconcat('ctrls.js'))
        .pipe(gulp.dest('./bin/'));
})

gulp.task('css',function(){
    gulp.src('./src/**/*.css')
        .pipe(gulp.dest('./bin/'))
});

gulp.task('libs',function(){
    gulp.src('./libs/*.js')
        .pipe(gulp.dest('./bin/libs/'))
});
gulp.task('libs-test',function(){
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> HTML

gulp.task('html',function(){
    gulp.src('./src/**/*.html')
        .pipe(gulp.dest('./bin/'));
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> TEMPLATES ::

gulp.task('view',function(){
    gulp.src('./templates/js/*.*')
        .pipe(gulp.dest('./bin/libs/'));

    gulp.src('./templates/fonts/*.*')
        .pipe(gulp.dest('./bin/fonts/'));

    gulp.src('./templates/img/*.*')
        .pipe(gulp.dest('./bin/img/'));

    gulp.src('./templates/css/*.*')
        .pipe(gulp.dest('./bin/css/'));
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> WATCH


gulp.task('watch',['html','libs','js','view'], function () {

    gulp.watch('src/**/*.html',['html']);
    gulp.watch('src/**/*.js',['js']);
   // gulp.watch('src/**/*.css',['css']);
});

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// ----------------------->
var sass = require('gulp-sass');
gulp.task('sass', function () {
    gulp.src('./templates/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./templates/css/'));
});