const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) return;
const content = fs.readFileSync(envPath, 'utf8').replace(/REACT_APP_BUILD_TIME=.*\n?/g, '');
fs.writeFileSync(envPath, content.trim() + '\n');
