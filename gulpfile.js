/*jslint node: true */
var gulp = require('gulp');
var downloadatomshell = require('gulp-download-atom-shell');

gulp.task('downloadatomshell', function(cb){
  downloadatomshell({
    version: '0.12.5',
    outputDir: 'binaries'
  }, cb);
});

gulp.task('default', ['downloadatomshell']);