var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');

gulp.task('default', function() {
});

gulp.task('scripts', function() {
    console.log("ok");
    return gulp.src(['pie.js', 'qdraw.js', 'qdraw2.js'])
    .pipe(concat('qdraw-all.js'))
    .pipe(gulp.dest('.'))
});