# gha.grafana-deployer
GitHub action for deploying Grafana configurations 

## build fixes
The code uses the `sync-request` library to simplify the request processing by making it synchronous.  It also uses
`ncc` to package the action into a runnable image.  `ncc` has 2 issues with the build which need to be manually fixed
after running `ncc`.
* in `bin/worker1.js` line 4 (note: line number may have changed):
```javascript
// change 
const JSON = require('./json-buffer');
// to
const JSON = require('json-buffer');
```
* in `bin/index.js` line 726 (note: line number may have changed):
```javascript
// change 
return new Buffer(value.substring(8), 'base64');
// to
return Buffer.from(value.substring(8), 'base64');
```
