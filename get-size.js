
const fs = require('fs');
const gzipSize = require('gzip-size');

const source = fs.readFileSync('dist/trkl.min.js', 'utf8');
const size = gzipSize.sync(source);

console.log(`gzipped size is ${size} bytes`);