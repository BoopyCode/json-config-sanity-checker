#!/usr/bin/env node

// JSON Config Sanity Checker - Because your configs are probably insane
// Detects obvious nonsense before it ruins your day

const fs = require('fs');
const path = require('path');

// The wisdom of ages, condensed into obvious truths
const RULES = {
    'package.json': {
        'scripts.start': (val) => val.includes('node') ? "OK" : "Why would you start without node?",
        'dependencies': (val) => Object.keys(val || {}).length > 50 ? "Dependency addiction detected" : "OK",
        'version': (val) => val === '0.0.0' ? "Forever in development limbo" : "OK"
    },
    'tsconfig.json': {
        'compilerOptions.target': (val) => ['es3', 'es5'].includes(val) ? "Living in the past" : "OK",
        'compilerOptions.strict': (val) => !val ? "Living dangerously" : "OK"
    },
    '.eslintrc.json': {
        'rules': (val) => !val || Object.keys(val).length === 0 ? "Rules are for fools" : "OK"
    }
};

function checkFile(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const filename = path.basename(filePath);
        const rules = RULES[filename] || {};
        
        console.log(`\n🔍 Checking ${filename}:`);
        
        Object.entries(rules).forEach(([path, check]) => {
            const parts = path.split('.');
            let value = content;
            
            // Navigate the JSON object like a tourist without a map
            for (const part of parts) {
                value = value?.[part];
                if (value === undefined) break;
            }
            
            const result = check(value);
            if (result !== "OK") {
                console.log(`  ⚠️  ${path}: ${result}`);
            } else {
                console.log(`  ✓ ${path}: ${result}`);
            }
        });
        
        // Universal sanity check: is it actually valid JSON?
        console.log(`  ✓ Valid JSON (at least it's not XML)`);
        
    } catch (error) {
        console.log(`\n💥 ${filePath}: ${error.message}`);
        console.log(`  (This is why we can't have nice things)`);
    }
}

// Main execution - because every script needs a hero
function main() {
    console.log('🧠 JSON Config Sanity Checker');
    console.log('Finding problems before they find you\n');
    
    const files = process.argv.slice(2);
    
    if (files.length === 0) {
        // Check common config files if none specified
        const commonFiles = ['package.json', 'tsconfig.json', '.eslintrc.json'];
        commonFiles.forEach(file => {
            if (fs.existsSync(file)) {
                checkFile(file);
            }
        });
    } else {
        files.forEach(checkFile);
    }
    
    console.log('\n✅ Sanity check complete (your sanity not guaranteed)');
}

if (require.main === module) {
    main();
}
