const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/components/admin/Navbar.tsx',
  'src/components/admin/CaseTimeline.tsx',
  'src/components/admin/ProofViewer.tsx',
  'src/components/admin/ReporterMetrics.tsx',
  'src/components/admin/VerdictControls.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Table.tsx',
  'src/components/ui/Modal.tsx',
];

console.log('Checking required component files...\n');

let allExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file} - MISSING`);
    allExist = false;
  }
});

if (!allExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
} else {
  console.log('\n✅ All required component files exist!');
  process.exit(0);
}

