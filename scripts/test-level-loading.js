// Quick test to verify level loading works
import { LevelService } from '../src/services/LevelService.js';

async function testLevelLoading() {
  console.log('🧪 Testing Level Loading...');
  
  const levelService = new LevelService();
  
  try {
    console.log('📋 Getting available levels...');
    const availableLevels = await levelService.listAvailableLevels();
    console.log(`✅ Found ${availableLevels.length} levels:`, availableLevels);
    
    if (availableLevels.length > 0) {
      console.log('🔍 Testing first level load...');
      const firstLevel = await levelService.loadLevel(availableLevels[0]);
      console.log(`✅ Successfully loaded: ${firstLevel.metadata.name}`);
    }
    
  } catch (error) {
    console.error('❌ Level loading test failed:', error);
  }
}

testLevelLoading();