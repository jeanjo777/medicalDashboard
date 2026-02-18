/**
 * Script to automatically replace console.log statements with custom logger
 *
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  dryRun: false, // Set to true to preview changes without modifying files
  addImport: true, // Add logger import if not present
  backupFiles: false, // Create .backup files before modification
};

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  logsReplaced: 0,
  importsAdded: 0,
};

/**
 * Get all files recursively from directory
 */
function getAllFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (CONFIG.extensions.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check if file already imports logger
 */
function hasLoggerImport(content) {
  return /import\s+.*logger.*from\s+['"].*logger['"]/.test(content) ||
         /import\s+logger\s+from/.test(content);
}

/**
 * Get the appropriate logger import path
 */
function getLoggerImportPath(filePath) {
  const relativePath = path.relative(path.dirname(filePath), path.join(CONFIG.srcDir, 'utils', 'logger.ts'));
  // Convert Windows paths to Unix-style for imports
  const importPath = relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
  return importPath.startsWith('.') ? importPath : `./${importPath}`;
}

/**
 * Add logger import to file
 */
function addLoggerImport(content, filePath) {
  const importPath = getLoggerImportPath(filePath);
  const importStatement = `import logger from '${importPath}';\n`;

  // Find the position after the last import
  const importRegex = /import\s+.*from\s+['"].*['"];?\n/g;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;

    return content.slice(0, insertPosition) + importStatement + content.slice(insertPosition);
  } else {
    // No imports found, add at the beginning (after potential comments)
    const firstLineRegex = /^(\/\/.*\n|\/\*[\s\S]*?\*\/\n)*/;
    const match = content.match(firstLineRegex);
    const insertPosition = match ? match[0].length : 0;

    return content.slice(0, insertPosition) + importStatement + '\n' + content.slice(insertPosition);
  }
}

/**
 * Replace console statements with logger
 */
function replaceConsoleLogs(content) {
  let modified = content;
  let replacementCount = 0;

  // Patterns to replace
  const patterns = [
    {
      // console.log(...) -> logger.info(...)
      regex: /console\.log\(/g,
      replacement: 'logger.info(',
      level: 'info'
    },
    {
      // console.error(...) -> logger.error(...)
      regex: /console\.error\(/g,
      replacement: 'logger.error(',
      level: 'error'
    },
    {
      // console.warn(...) -> logger.warn(...)
      regex: /console\.warn\(/g,
      replacement: 'logger.warn(',
      level: 'warn'
    },
    {
      // console.debug(...) -> logger.debug(...)
      regex: /console\.debug\(/g,
      replacement: 'logger.debug(',
      level: 'debug'
    },
    {
      // console.info(...) -> logger.info(...)
      regex: /console\.info\(/g,
      replacement: 'logger.info(',
      level: 'info'
    },
  ];

  patterns.forEach(({ regex, replacement }) => {
    const matches = modified.match(regex);
    if (matches) {
      replacementCount += matches.length;
      modified = modified.replace(regex, replacement);
    }
  });

  return { modified, replacementCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesScanned++;

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace console statements
  const { modified, replacementCount } = replaceConsoleLogs(content);
  content = modified;

  if (replacementCount > 0) {
    stats.logsReplaced += replacementCount;

    // Add logger import if needed
    if (CONFIG.addImport && !hasLoggerImport(content)) {
      content = addLoggerImport(content, filePath);
      stats.importsAdded++;
    }

    // Only count as modified if content actually changed
    if (content !== originalContent) {
      stats.filesModified++;

      if (!CONFIG.dryRun) {
        // Create backup if enabled
        if (CONFIG.backupFiles) {
          fs.writeFileSync(filePath + '.backup', originalContent, 'utf8');
        }

        // Write modified content
        fs.writeFileSync(filePath, content, 'utf8');
      }

      console.log(`✓ Modified: ${path.relative(CONFIG.srcDir, filePath)} (${replacementCount} replacements)`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Console Log Replacement Script\n');
  console.log(`Source directory: ${CONFIG.srcDir}`);
  console.log(`Dry run: ${CONFIG.dryRun ? 'YES (no files will be modified)' : 'NO'}\n`);

  // Get all files
  const files = getAllFiles(CONFIG.srcDir);
  console.log(`Found ${files.length} files to scan\n`);

  // Process each file
  files.forEach(processFile);

  // Print statistics
  console.log('\n📊 Statistics:');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Console statements replaced: ${stats.logsReplaced}`);
  console.log(`Logger imports added: ${stats.importsAdded}`);

  if (CONFIG.dryRun) {
    console.log('\n⚠️  This was a dry run. No files were actually modified.');
    console.log('Set CONFIG.dryRun = false to apply changes.');
  } else {
    console.log('\n✅ All files have been processed successfully!');

    if (CONFIG.backupFiles) {
      console.log(`📦 Backup files created with .backup extension`);
    }
  }
}

// Run the script
try {
  main();
} catch (error) {
  console.error('❌ Error running script:', error);
  process.exit(1);
}
