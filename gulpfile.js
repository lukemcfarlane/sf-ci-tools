var gulp = require('gulp');
var forEach = require('gulp-foreach');
var zip = require('gulp-zip');
var forceDeploy = require('gulp-jsforce-deploy');
 
gulp.task('deploy', ['compressResources'], function() {
  gulp.src('./src/**', { base: '.' })
    .pipe(zip('package.zip'))
    .pipe(forceDeploy({
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD
      //, loginUrl: 'https://test.salesforce.com' 
      // , pollTimeout: 120*1000 
      // , pollInterval: 10*1000 
      // , version: '33.0' 
    }));
});

gulp.task('compressResources', function() {
  gulp.src('./resource-bundles/*', { base: 'resource-bundles' })
    .pipe(forEach(function(stream, file) {
      console.log(file.relative);
      return stream.pipe(zip(file.relative + '.resource'));
    }))
    .pipe(gulp.dest('./src/staticresources'));
});