const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const publicDir = path.join(__dirname, '..', 'public');
const swaggerUiDir = path.join(publicDir, 'swagger-ui');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(swaggerUiDir)) {
  fs.mkdirSync(swaggerUiDir, { recursive: true });
}

// Copy Swagger UI files
const swaggerUiDistDir = path.join(__dirname, '..', 'node_modules', 'swagger-ui-dist');

const files = ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui-init.js', 'favicon-32x32.png', 'favicon-16x16.png', 'oauth2-redirect.html'];

files.forEach((file) => {
  const sourcePath = path.join(swaggerUiDistDir, file);
  const destPath = path.join(swaggerUiDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to public/swagger-ui/`);
  } else {
    console.warn(`Warning: ${file} not found in swagger-ui-dist`);
  }
});

console.log('Swagger UI files copied successfully!');
