var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

gulp.task('sass', function() {
  gulp.src('assets/css/styles.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('assets/css'));
});

gulp.task('watch', function() {
  gulp.watch('assets/css/styles.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);
