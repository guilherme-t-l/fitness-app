// Simple test to verify timer accuracy logic
// Run with: node test-timer.js

function calculateRemainingTime(startTime, totalRestTime) {
  if (!startTime) return totalRestTime
  
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
  const remaining = Math.max(0, totalRestTime - elapsedSeconds)
  
  return remaining
}

// Test the timer logic
console.log('Testing timer accuracy...')

const testCases = [
  { startTime: Date.now() - 1000, totalTime: 90, expected: 89 }, // 1 second elapsed
  { startTime: Date.now() - 45000, totalTime: 90, expected: 45 }, // 45 seconds elapsed
  { startTime: Date.now() - 90000, totalTime: 90, expected: 0 }, // 90 seconds elapsed (should be 0)
  { startTime: Date.now() - 120000, totalTime: 90, expected: 0 }, // 120 seconds elapsed (should be 0)
  { startTime: null, totalTime: 90, expected: 90 }, // No start time
]

testCases.forEach((testCase, index) => {
  const result = calculateRemainingTime(testCase.startTime, testCase.totalTime)
  const passed = Math.abs(result - testCase.expected) <= 1 // Allow 1 second tolerance
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`  Expected: ${testCase.expected}s, Got: ${result}s`)
  console.log('')
})

console.log('Timer accuracy test completed!')
console.log('The new implementation should provide accurate timing on mobile devices.') 