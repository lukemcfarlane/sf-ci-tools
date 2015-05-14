Force.com CI Tools
=========================

Gulp tasks for deploying metadata to and refreshing metadata from Force.com in a git-friendly manner.


How to use
----------

1. Copy gulpfile.js & package.json into your Force.com project directory
2. `npm install`
3. `export SF_USERNAME=<username>`
4. `export SF_PASSWORD=<password>`
5. `gulp <task_name>`


Tasks
-----

### `gulp compressResources`

Updates static resources by compressing each subdirectory in resource-bundles folder.

### `gulp deploy`

Compresses all resource bundles then deploys all project metadata to Force.com.

