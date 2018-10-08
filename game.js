require('babel-core/register');
['.css', '.less', '.sass', '.ttf', '.woff', '.woff2'].forEach((ext) => require.extensions[ext] = () => { });
require('babel-polyfill');
// if (process.env.NODE_ENV === 'DEVELOPMENT') {
    require('./src/dev_server.js');
// } else {
//     require('./src/server.js');
// }
//$env:NODE_ENV="DEVELOPMENT"

//в билд включена только дев сборка