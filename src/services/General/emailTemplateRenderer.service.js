import fs from 'fs/promises';
import path from 'path';

export const renderEmailTemplate = async (subject, body) => {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'Email', 'Base.html');
  const template = await fs.readFile(templatePath, 'utf8');

  return template
    .replaceAll('{{SUBJECT}}', subject)
    .replaceAll('{{BODY}}', body)
    .replaceAll('{{YEAR}}', new Date().getFullYear().toString());
};
