var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

gulp.task('sass', function() {
  gulp.src('assets/styles/main.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('assets/styles'));
});

gulp.task('watch', function() {
  gulp.watch('assets/styles/main.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);
