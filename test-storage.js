#!/usr/bin/env node

// Simple test script to verify the storage functionality
import { storageService } from './src/services/storageService.js';
import { checkUrl, checkMultipleUrls } from './src/services/urlService.js';

async function runTests() {
  console.log('🧪 Running storage system tests...\n');

  try {
    // Test 1: Single URL check
    console.log('Test 1: Single URL check');
    const singleResult = await checkUrl('https://httpbin.org/status/200');
    console.log('✅ Single check result:', singleResult);

    // Test 2: Multiple URL check  
    console.log('\nTest 2: Multiple URL check');
    const multipleResults = await checkMultipleUrls([
      'https://httpbin.org/status/200',
      'https://httpbin.org/status/404',
      'https://example.com'
    ]);
    console.log('✅ Multiple check results:', multipleResults);

    // Test 3: Get statistics
    console.log('\nTest 3: Get statistics');
    const stats = await storageService.getStats();
    console.log('✅ Statistics:', stats);

    // Test 4: Get recent checks
    console.log('\nTest 4: Get recent checks');
    const recentChecks = await storageService.getRecentChecks(5);
    console.log('✅ Recent checks count:', recentChecks.length);
    console.log('Recent checks:', recentChecks.map(check => ({
      url: check.url,
      isBroken: check.isBroken,
      timestamp: check.timestamp
    })));

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();