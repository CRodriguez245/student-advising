const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
let content = '';
if (fs.existsSync(envPath)) {
  content = fs.readFileSync(envPath, 'utf8').replace(/REACT_APP_BUILD_TIME=.*\n?/g, '');
}
content = content.trim() + '\nREACT_APP_BUILD_TIME=' + new Date().toISOString() + '\n';
fs.writeFileSync(envPath, content.trim() + '\n');
