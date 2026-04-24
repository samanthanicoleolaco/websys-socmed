const fs = require('fs');
let content = fs.readFileSync('resources/js/components/Settings.js', 'utf8');
content = content.replace(/className=\"form-row/g, 'className=\"settings-form-row');
content = content.replace(/className=\"form-group/g, 'className=\"settings-form-group');
content = content.replace(/className=\"form-label/g, 'className=\"settings-form-label');
content = content.replace(/className=\"form-input/g, 'className=\"settings-form-input');
content = content.replace(/className=\"form-textarea/g, 'className=\"settings-form-textarea');
fs.writeFileSync('resources/js/components/Settings.js', content);
