var gulp = require('gulp');
var config = require('./config.json');
var forEach = require('gulp-foreach');
var zip = require('gulp-zip');
var forceDeploy = require('gulp-jsforce-deploy');

var rootDir = !!config.rootDir ? config.rootDir : '.';
var endpoint = !!config.endpoint ? config.endpoint : 'https://test.salesforce.com';
 
gulp.task('deploy', ['compressResources'], function() {
  gulp.src(rootDir + '/src/**', { base: rootDir })
    .pipe(zip('package.zip'))
    .pipe(forceDeploy({
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD,
      loginUrl: endpoint
      // , pollTimeout: 120*1000 
      // , pollInterval: 10*1000 
      // , version: '33.0' 
    }));
});

gulp.task('compressResources', function() {
  gulp.src(rootDir + '/resource-bundles/*', { base: rootDir + '/resource-bundles' })
    .pipe(forEach(function(stream, file) {
      console.log('Compressing resource bundle: ' + file.relative);
      return stream.pipe(zip(file.relative + '.resource'));
    }))
    .pipe(gulp.dest(rootDir + '/src/staticresources'));
});
