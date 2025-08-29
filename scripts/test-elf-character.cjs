#!/usr/bin/env node

// Test script for elf character integration
const fs = require('fs');
const path = require('path');

console.log('🧝‍♀️ Testing Elf Character Integration...\n');

// Check if all required files exist
const requiredFiles = [
  'src/assets/character/a_cute_elf/elf-character-config.json',
  'src/presentation/ElfCharacterLoader.ts',
  'src/presentation/ElfCharacterIntegration.ts'
];

const missingFiles = [];
const existingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file}`);
  }
});

console.log(`\n📊 Results: ${existingFiles.length}/${requiredFiles.length} files found`);

if (missingFiles.length > 0) {
  console.log('\n⚠️  Missing files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Check elf character assets
console.log('\n🎨 Checking Elf Character Assets...');

const elfAssetPaths = [
  'src/assets/character/a_cute_elf/rotations/south.png',
  'src/assets/character/a_cute_elf/rotations/north.png',
  'src/assets/character/a_cute_elf/rotations/east.png',
  'src/assets/character/a_cute_elf/rotations/west.png',
  'src/assets/character/a_cute_elf/animations/walking-6-frames/south/frame_000.png',
  'src/assets/character/a_cute_elf/animations/walking-6-frames/north/frame_000.png',
  'src/assets/character/a_cute_elf/animations/walking-6-frames/east/frame_000.png',
  'src/assets/character/a_cute_elf/animations/walking-6-frames/west/frame_000.png'
];

let assetCount = 0;
elfAssetPaths.forEach(assetPath => {
  if (fs.existsSync(assetPath)) {
    assetCount++;
    console.log(`✅ ${path.basename(assetPath)}`);
  } else {
    console.log(`❌ ${path.basename(assetPath)}`);
  }
});

console.log(`\n📊 Asset Results: ${assetCount}/${elfAssetPaths.length} key assets found`);

// Check configuration file
if (fs.existsSync('src/assets/character/a_cute_elf/elf-character-config.json')) {
  console.log('\n⚙️  Checking Configuration...');
  try {
    const config = JSON.parse(fs.readFileSync('src/assets/character/a_cute_elf/elf-character-config.json', 'utf8'));
    
    console.log(`✅ Character ID: ${config.character?.id || 'undefined'}`);
    console.log(`✅ Character Name: ${config.character?.name || 'undefined'}`);
    console.log(`✅ Idle Frames: ${Object.keys(config.assets?.idle_frames || {}).length} directions`);
    console.log(`✅ Walking Frames: ${Object.keys(config.assets?.walking_frames || {}).length} directions`);
    
    // Check if all required directions are present
    const requiredDirections = ['south', 'north', 'east', 'west'];
    const idleDirections = Object.keys(config.assets?.idle_frames || {});
    const walkingDirections = Object.keys(config.assets?.walking_frames || {});
    
    const missingIdle = requiredDirections.filter(dir => !idleDirections.includes(dir));
    const missingWalking = requiredDirections.filter(dir => !walkingDirections.includes(dir));
    
    if (missingIdle.length === 0 && missingWalking.length === 0) {
      console.log('✅ All required directions configured');
    } else {
      if (missingIdle.length > 0) {
        console.log(`⚠️  Missing idle directions: ${missingIdle.join(', ')}`);
      }
      if (missingWalking.length > 0) {
        console.log(`⚠️  Missing walking directions: ${missingWalking.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Configuration file error: ${error.message}`);
  }
}

// Check manifest updates
console.log('\n📋 Checking Manifest Updates...');
if (fs.existsSync('src/assets/manifest.json')) {
  try {
    const manifest = JSON.parse(fs.readFileSync('src/assets/manifest.json', 'utf8'));
    
    // Check if elf character is in the manifest
    const hasElfAtlas = manifest.atlases?.some(atlas => atlas.key === 'elf_character');
    const hasElfPlayer = manifest.themes?.[0]?.assets?.player?.key === 'elf_character';
    const hasElfAnimations = manifest.animations?.some(anim => anim.key.startsWith('elf_'));
    
    console.log(`${hasElfAtlas ? '✅' : '❌'} Elf character atlas in manifest`);
    console.log(`${hasElfPlayer ? '✅' : '❌'} Elf character as default player`);
    console.log(`${hasElfAnimations ? '✅' : '❌'} Elf animations in manifest`);
    
    if (hasElfAnimations) {
      const elfAnimCount = manifest.animations.filter(anim => anim.key.startsWith('elf_')).length;
      console.log(`   📊 ${elfAnimCount} elf animations found`);
    }
    
  } catch (error) {
    console.log(`❌ Manifest file error: ${error.message}`);
  }
} else {
  console.log('❌ Manifest file not found');
}

// Summary
console.log('\n🎯 Integration Summary:');
const totalChecks = requiredFiles.length + elfAssetPaths.length;
const passedChecks = existingFiles.length + assetCount;
const successRate = Math.round((passedChecks / totalChecks) * 100);

console.log(`   📊 Success Rate: ${successRate}%`);
console.log(`   ✅ Passed: ${passedChecks}/${totalChecks} checks`);

if (successRate >= 80) {
  console.log('   🎉 Elf character integration looks good!');
} else if (successRate >= 60) {
  console.log('   ⚠️  Elf character integration partially complete');
} else {
  console.log('   ❌ Elf character integration needs attention');
}

console.log('\n🚀 Next Steps:');
console.log('   1. Run the game to test the elf character in action');
console.log('   2. Check browser console for any loading errors');
console.log('   3. Verify animations play correctly during movement');
console.log('   4. Test all four movement directions');

console.log('\n✨ Elf Character Integration Test Complete!\n');