var gulp = require('gulp');
var crypto = require('crypto');
var through = require('through2');
var fs = require('fs-extra');
var File2 = require('vinyl');
var forEach = require('gulp-foreach');
var insert = require('gulp-insert');
var tap = require('gulp-tap');
var prompt = require('gulp-prompt');
var zip = require('gulp-zip');
var unzip = require('gulp-unzip');
var forceDeploy = require('gulp-jsforce-deploy');
var jsforce = require('jsforce');
var _ = require('lodash');

var config = require('./config.json');
var sfpackage = require('./sfpackage.json');

var rootDir = !!config.rootDir ? config.rootDir : '.';
var username, password, endpoint;
 
gulp.task('deploy', [ 'getCredentials', 'compressResources'], function() {
  gulp.src(rootDir + '/src/**', { base: rootDir })
    .pipe(prompt.confirm('Deploying with username \'' + username + '\', ' + 
      'do you wish to continue?'))
    .pipe(zip('package.zip'))
    .pipe(forceDeploy({
      username: username,
      password: password,
      loginUrl: endpoint
    }));
});

gulp.task('retrieve', [ 'getCredentials' ], function(callback) {
  var retrievedPkgPath = !!config.retrievedPkgPath ? config.retrievedPkgPath : 'temppackage';
  fs.remove('./' + retrievedPkgPath, function(err) {
    if(!!err) return console.log(err);
    var conn = new jsforce.Connection({ loginUrl: endpoint });
    var options = {
      username: username,
      password: password
    };
    (
      options.username && options.password ?
      conn.login(options.username, options.password).then(function() { return conn.identity(); }) :
      conn.identity()
    )
      .then(function(identity) {
        console.log('Logged in as: ' + identity.username);
        console.log('Retrieving from server...');
        conn.metadata.retrieve({
          singlePackage: true,
          unpackaged: sfpackage
        })
          .stream()
          .pipe(through.obj(function(chunk, enc, cb) {
            var vinylFile = new File2({
              cwd: rootDir,
              base: rootDir,
              path: rootDir + '/package.zip',
              contents: chunk
            });
            this.push(vinylFile);
            cb();
          }))
          .pipe(unzip())
          .pipe(gulp.dest('./' + retrievedPkgPath))
          .on('end', function() {
            console.log('Metadata retrieval completed successfully.');
          })
          .on('error', function(err) {
            console.log('Failed to retrieve metadata: ' + err);
          });
      }, function(err) {
        console.log('Login failed.\n' + err);
      });
  });
});

gulp.task('getCredentials', function(callback) {
  if(process.env.SF_USERNAME && process.env.SF_PASSWORD) {
    endpoint = !!config.endpoint ? config.endpoint : 'https://test.salesforce.com';
    username = process.env.SF_USERNAME;
    password = process.env.SF_PASSWORD;
    callback();
  } else {
    var credentials = [];
    gulp.src('.credentials').pipe(tap(function(file, t) {
      credentials = JSON.parse(file.contents.toString());
    }))
    .pipe(prompt.prompt([{
        type: 'list',
        name: 'target',
        message: 'Please select target organization',
        choices: function() {
          return credentials.map(function(cred) {
            return {
              name: cred.name,
              value: cred.username
            };
          });
        }
      }, {
        type: 'password',
        name: 'passphrase',
        message: 'Please enter passphrase'
    }], function(res) {
      var selected = _.findWhere(credentials, {
        username: res.target
      });
      username = selected.username;
      password = decrypt(selected.password, res.passphrase) +
        decrypt(selected.token, res.passphrase);
      endpoint = ({
        sandbox: 'https://test.salesforce.com',
        production: 'https://login.salesforce.com',
        dev: 'https://login.salesforce.com'
      })[selected.type];
      callback();
    }));
  }
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
