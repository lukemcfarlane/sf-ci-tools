var gulp = require('gulp');
var crypto = require('crypto');
var through2 = require('through2');
var fs = require('fs-extra');
var config = require('./config.json');
var forEach = require('gulp-foreach');
var insert = require('gulp-insert');
var tap = require('gulp-tap');
var prompt = require('gulp-prompt');
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

gulp.task('addCredentials', function() {
  fs.createFile('.credentials', function(err) {
    if(!!err) throw err;

    var promptRes;
    gulp.src('.credentials').pipe(prompt.prompt([{
        type: 'input',
        name: 'name',
        message: 'Name'
      }, {
        type: 'list',
        name: 'type',
        message: 'Type',
        choices: [ 'Sandbox', 'Production', 'Developer' ]
      }, {
        type: 'input',
        name: 'username',
        message: 'Username'
      }, {
        type: 'password',
        name: 'password',
        message: 'Password'
      }, {
        type: 'password',
        name: 'token',
        message: 'Security Token'
      }, {
        type: 'password',
        name: 'passphrase',
        message: 'Please enter a passphrase'
    }], function(res) {
      promptRes = res;
    }))
    .pipe(insert.transform(function(contents) {
      var credentials = [];
      if(contents !== '') {
        try {
          credentials = JSON.parse(contents);
        } catch(err) {
          throw new Error('Contents of .credentials is not valid JSON');
        }
      }

      credentials.push({
        name: promptRes.name,
        username: promptRes.username,
        password: encrypt(promptRes.password, promptRes.passphrase),
        token: encrypt(promptRes.token, promptRes.passphrase),
        type: promptRes.type
      });

      return JSON.stringify(credentials, null, 2);  // pretty print with indent of 2
    }))
    .pipe(gulp.dest('.'));
  });
});

function encrypt(text, passphrase) {
  var cipher = crypto.createCipher('aes-256-ctr', passphrase);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text, passphrase) {
  var decipher = crypto.createDecipher('aes-256-ctr', passphrase);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}
