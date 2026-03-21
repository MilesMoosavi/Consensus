#!/usr/bin/env node

/**
 * Cleanup script to identify and optionally remove legacy files
 * Run with: node scripts/cleanup.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

// Files that appear to be legacy/example code that can be safely removed
const LEGACY_FILES = [
  'latex_example_aligned.txt',
  'latex_example_derivative_ex.txt', 
  'latex_example_E_mc2.txt',
  'latex_example_integral.txt',
  'latex_example_matrix.txt',
  'latex_example_pythagorean.txt',
  'latex_example_x1.txt',
  'latex_example_y2.txt',
  'latex_example_z3.txt',
  'list-models.js',
  'playground.html',
  'consensus.js', // Old root consensus.js (replaced by backend/consensus.js)
  'storybook.log'
];

// Directories that might be legacy
const LEGACY_DIRS = [
  'api', // Old API structure (replaced by backend/routes)
  'repo-imgs' // Unless these are actually used
];

function checkFile(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function analyzeProject() {
  console.log('🔍 Analyzing project for legacy files...\n');
  
  const foundLegacyFiles = [];
  const foundLegacyDirs = [];
  
  // Check for legacy files
  LEGACY_FILES.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    if (checkFile(fullPath)) {
      foundLegacyFiles.push(file);
    }
  });
  
  // Check for legacy directories
  LEGACY_DIRS.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (checkFile(fullPath) && fs.statSync(fullPath).isDirectory()) {
      foundLegacyDirs.push(dir);
    }
  });
  
  // Report findings
  if (foundLegacyFiles.length > 0) {
    console.log('📄 Legacy files found:');
    foundLegacyFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
    console.log();
  }
  
  if (foundLegacyDirs.length > 0) {
    console.log('📁 Legacy directories found:');
    foundLegacyDirs.forEach(dir => {
      console.log(`  - ${dir}/`);
    });
    console.log();
  }
  
  if (foundLegacyFiles.length === 0 && foundLegacyDirs.length === 0) {
    console.log('✅ No legacy files detected!');
    return;
  }
  
  console.log('💡 Recommendations:');
  console.log('  - Review these files to confirm they are not needed');
  console.log('  - Use git to track changes before deletion');
  console.log('  - Run `node scripts/cleanup.js --remove` to delete them');
  console.log();
  
  return { foundLegacyFiles, foundLegacyDirs };
}

function removeFiles(files, dirs) {
  console.log('🗑️  Removing legacy files...\n');
  
  let removed = 0;
  
  // Remove files
  files.forEach(file => {
    const fullPath = path.join(projectRoot, file);
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Removed: ${file}`);
      removed++;
    } catch (error) {
      console.log(`❌ Failed to remove: ${file} (${error.message})`);
    }
  });
  
  // Remove directories
  dirs.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}/`);
      removed++;
    } catch (error) {
      console.log(`❌ Failed to remove directory: ${dir}/ (${error.message})`);
    }
  });
  
  console.log(`\n🎉 Cleanup complete! Removed ${removed} items.`);
}

// Main execution
const shouldRemove = process.argv.includes('--remove');
const result = analyzeProject();

if (shouldRemove && result) {
  const { foundLegacyFiles, foundLegacyDirs } = result;
  removeFiles(foundLegacyFiles, foundLegacyDirs);
}
