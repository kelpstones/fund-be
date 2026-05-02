const fs = require('fs');
const path = require('path');

exports.loadTemplate = (templateName, variables) => {
  const filePath = path.join(__dirname, '../templates', `${templateName}.html`);
  let html = fs.readFileSync(filePath, 'utf-8');

  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });

  return html;
};


