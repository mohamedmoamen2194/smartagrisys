const fs = require('fs');
console.log(fs.readFileSync('.env.local', 'utf8'));
