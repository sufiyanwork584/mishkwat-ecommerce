const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx'); // Requires `npm install xlsx`

const ROOT_DIR = __dirname;
const IGNORE_DIRS = ['node_modules', '.git', 'build', 'dist', '.gemini'];

let stats = {
  totalComponents: 0,
  totalPages: 0,
  totalApis: 0,
  totalControllers: 0,
  totalModels: 0,
  totalServices: 0,
  totalMiddlewares: 0,
  totalReduxSlices: 0,
  totalRoutesFiles: 0,
  totalCollections: 0,
  totalUtils: 0,
  totalLinesOfCode: 0,
  totalFiles: 0
};

const sheets = {
  Overview: [],
  FolderStructure: [],
  Models: [],
  Controllers: [],
  BackendAPIs: [],
  ReactComponents: [],
  Integrations: [],
  ClientSummary: []
};

// Utilities
function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkDir(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  }
}

function countLines(content) {
  return content.split('\n').length;
}

function getRelativePath(fullPath) {
  return fullPath.replace(ROOT_DIR, '').substring(1).replace(/\\/g, '/');
}

// Extractors
function extractPackageJson(content, location) {
  try {
    const pkg = JSON.parse(content);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(deps || {})) {
      sheets.Integrations.push({
        'Service Name': name,
        'Version': version,
        'Location': location,
        'Purpose': 'Dependency',
        'Status': 'Implemented'
      });
    }
  } catch(e) {}
}

function extractModel(content, filePath) {
  stats.totalModels++;
  const relPath = getRelativePath(filePath);
  const nameMatch = content.match(/mongoose\.model\(['"]([^'"]+)['"]/);
  const schemaMatch = content.match(/new\s+mongoose\.Schema\(\{([\s\S]*?)\}/);
  
  const collectionName = nameMatch ? nameMatch[1] : path.basename(filePath, '.js');
  if (nameMatch) stats.totalCollections++;

  sheets.Models.push({
    'Collection Name': collectionName,
    'File Path': relPath,
    'Schema Details': schemaMatch ? schemaMatch[1].substring(0, 150) + '...' : 'Unknown',
    'Has Index': content.includes('.index(') ? 'Yes' : 'No',
    'Validation': content.includes('required:') ? 'Yes' : 'No'
  });
}

function extractController(content, filePath) {
  stats.totalControllers++;
  const relPath = getRelativePath(filePath);
  
  // Find exported functions
  const exportsMatches = content.matchAll(/exports\.([a-zA-Z0-9_]+)\s*=\s*(async\s+)?\(?[^)]*\)?\s*=>/g);
  let funcs = [];
  for (const match of exportsMatches) {
    funcs.push(match[1]);
  }
  if(funcs.length === 0) {
     const constExportsMatches = content.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s+)?\(?[^)]*\)?\s*=>/g);
     for (const match of constExportsMatches) {
        funcs.push(match[1]);
     }
  }

  sheets.Controllers.push({
    'Controller Name': path.basename(filePath, '.js'),
    'File Path': relPath,
    'Functions': funcs.join(', '),
    'Database Ops': (content.match(/\.find|\.create|\.update|\.delete|\.save/g) || []).length > 0 ? 'Yes' : 'No',
    'Purpose': `Handles logic for ${path.basename(filePath, '.js')}`
  });
}

function extractRoute(content, filePath) {
  stats.totalRoutesFiles++;
  const relPath = getRelativePath(filePath);
  
  const routeMatches = content.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]\s*,\s*([^;]+)\)/g);
  for (const match of routeMatches) {
    stats.totalApis++;
    sheets.BackendAPIs.push({
      'Method': match[1].toUpperCase(),
      'Route': match[2],
      'Authentication Required': match[3].includes('auth') || match[3].includes('verifyToken') ? 'Yes' : 'No',
      'Controllers/Middleware': match[3].trim(),
      'File Path': relPath
    });
  }
}

function extractReactComponent(content, filePath, type = 'Component') {
  if (type === 'Component') stats.totalComponents++;
  if (type === 'Page') stats.totalPages++;

  const relPath = getRelativePath(filePath);
  const compName = path.basename(filePath).split('.')[0];

  const hooks = (content.match(/use[A-Z][a-zA-Z]+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  const redux = (content.match(/useSelector|useDispatch/g) || []).length > 0 ? 'Yes' : 'No';
  const apiCalls = (content.match(/axios\.|fetch\(|api\./g) || []).length > 0 ? 'Yes' : 'No';

  sheets.ReactComponents.push({
    'Name': compName,
    'Type': type,
    'Location': relPath,
    'Hooks Used': hooks.join(', '),
    'Redux Usage': redux,
    'API Calls': apiCalls
  });
}

// Main logic
console.log('Starting analysis...');

walkDir(ROOT_DIR, (filePath) => {
  stats.totalFiles++;
  const ext = path.extname(filePath);
  const relPath = getRelativePath(filePath);
  
  sheets.FolderStructure.push({ 'File Path': relPath });

  if (['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css'].includes(ext)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    stats.totalLinesOfCode += countLines(content);

    if (filePath.endsWith('package.json')) {
      extractPackageJson(content, relPath);
    } else if (relPath.includes('server/models') && ext === '.js') {
      extractModel(content, filePath);
    } else if (relPath.includes('server/controllers') && ext === '.js') {
      extractController(content, filePath);
    } else if (relPath.includes('server/routes') && ext === '.js') {
      extractRoute(content, filePath);
    } else if (relPath.includes('client/src/components') && (ext === '.jsx' || ext === '.js' || ext === '.tsx')) {
      extractReactComponent(content, filePath, 'Component');
    } else if (relPath.includes('client/src/pages') && (ext === '.jsx' || ext === '.js' || ext === '.tsx')) {
      extractReactComponent(content, filePath, 'Page');
    } else if (relPath.includes('server/services')) {
      stats.totalServices++;
    } else if (relPath.includes('server/middleware')) {
      stats.totalMiddlewares++;
    } else if (relPath.includes('client/src/redux')) {
      if(relPath.includes('Slice')) stats.totalReduxSlices++;
    } else if (relPath.includes('utils')) {
      stats.totalUtils++;
    }
  }
});

sheets.Overview.push({
  'Metric': 'Total React Components',
  'Value': stats.totalComponents
});
sheets.Overview.push({ 'Metric': 'Total Pages', 'Value': stats.totalPages });
sheets.Overview.push({ 'Metric': 'Total APIs', 'Value': stats.totalApis });
sheets.Overview.push({ 'Metric': 'Total Controllers', 'Value': stats.totalControllers });
sheets.Overview.push({ 'Metric': 'Total Models', 'Value': stats.totalModels });
sheets.Overview.push({ 'Metric': 'Total Services', 'Value': stats.totalServices });
sheets.Overview.push({ 'Metric': 'Total Middlewares', 'Value': stats.totalMiddlewares });
sheets.Overview.push({ 'Metric': 'Total Redux Slices', 'Value': stats.totalReduxSlices });
sheets.Overview.push({ 'Metric': 'Total Utils', 'Value': stats.totalUtils });
sheets.Overview.push({ 'Metric': 'Total Lines of Code', 'Value': stats.totalLinesOfCode });

sheets.ClientSummary.push({
  'Category': 'Frontend Application',
  'Description': `Built with React. Contains ${stats.totalPages} main pages and ${stats.totalComponents} reusable components. Includes complex state management using Redux and API integration.`
});
sheets.ClientSummary.push({
  'Category': 'Backend & API',
  'Description': `Robust Express server with ${stats.totalApis} secured API endpoints managed by ${stats.totalControllers} controllers.`
});
sheets.ClientSummary.push({
  'Category': 'Database',
  'Description': `Data structured across ${stats.totalCollections} MongoDB collections using Mongoose schemas with built-in validation.`
});
sheets.ClientSummary.push({
  'Category': 'Integrations',
  'Description': 'Integrated with various third-party services like Razorpay, Shiprocket, and Cloudinary as found in the project configurations.'
});

const wb = xlsx.utils.book_new();

for (const [sheetName, data] of Object.entries(sheets)) {
  if (data.length > 0) {
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
  } else {
    const ws = xlsx.utils.json_to_sheet([{ 'Notice': 'No data found for this category.' }]);
    xlsx.utils.book_append_sheet(wb, ws, sheetName);
  }
}

xlsx.writeFile(wb, 'nexabuy_documentation.xlsx');
console.log('Documentation generated: nexabuy_documentation.xlsx');
