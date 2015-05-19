Force.com CI Tools
=========================

Gulp tasks for deploying metadata to and refreshing metadata from Force.com in a git-friendly manner.


How to use
----------

1. Copy gulpfile.js & package.json into your Force.com project directory
2. `npm install`
3. `gulp <task_name>`

### Specifying credentials

Credentials can be specified either via environment variables:

`export SF_USERNAME=<username>`
`export SF_PASSWORD=<password>`

Or via the included task which will encrypt and store them in a file in the current directory:

`gulp addCredentials`

The deploy task will default to using credentials from environment variables if they exist, or will prompt for which stored credentials to use otherwise.


Tasks
-----

### `gulp compressResources`

Updates static resources by compressing each subdirectory in resource-bundles folder.

### `gulp deploy`

Compresses all resource bundles then deploys all project metadata to Force.com.

