var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

gulp.task('sass', function() {
  gulp.src('css/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('css'));
});

gulp.task('watch', function() {
  gulp.watch('css/styles.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);
