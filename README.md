Force.com CI Tools
=========================

Gulp tasks for deploying metadata to and refreshing metadata from Force.com in a git-friendly manner.

How to use
----------

1. Copy the following files into your Force.com project directory:
    * package.json
    * config.json
    * sfpackage.json
    * gulpfile.js

2. Ensure that node/npm is installed: 

   http://blog.npmjs.org/post/85484771375/how-to-install-npm
3. `npm install`
4. `gulp <task_name>`

### Specifying credentials

Credentials can be specified either via environment variables:

`export SF_USERNAME=<username>`
`export SF_PASSWORD=<password>`

Or via the included task which will encrypt and store them in a file in the current directory:

`gulp addCredentials`

The deploy task will default to using credentials from environment variables if they exist, or will prompt for which stored credentials to use otherwise.

### Configuration

There are a few options that are configurable via config.json.

#### rootDir

This is the path to the root directory of the Force.com project (one level above the "src" directory). The contents of the directory should be structured similar to the following: 

```
.
+-- resource-bundles
|   +-- MyApp
|   |   +-- js
|   |   +-- css
+-- src
|   +-- package.xml 
|   +-- classes 
|   |   +-- MyClass.cls 
|   |   +-- MyClass.cls-meta.xml
|   +-- pages
|   |   +-- MyPage.page
|   |   +-- MyPage.page-meta.xml
|   +-- staticresources
|   |   +-- MyApp.resource
|   |   +-- MyApp.resource-meta.xml
```

#### endpoint

This is the Force.com login endpoint. For production/dev this should be https://login.salesforce.com, and for sandbox should be https://test.salesforce.com.

This option is only used when the `SF_USERNAME` & `SF_PASSWORD` environment variables have been set.

#### retrievedPkgPath

This is the directory path that metadata retrieved via `gulp retrieve` task gets saved into. If the directory path does not exist it will be created.

Tasks
-----

### `gulp compressResources`

Updates static resources by compressing each subdirectory in resource-bundles folder.

### `gulp deploy`

Compresses all resource bundles then deploys all project metadata to Force.com.

### `gulp retrieve` (unstable)

Retrieves metadata from Force.com that is specified in sfpackage.json, and saves it into a new subdirectory. The path of the subdirectory is determined by the `retrievedPkgPath` option in config.json.


