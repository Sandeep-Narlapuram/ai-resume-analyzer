import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoringService } from '../src/services/scoring.service.js';

test('computeCompositeScore applies fixed weights correctly', () => {
  const score = scoringService.computeCompositeScore({
    keywordMatch: 80,
    formatting: 90,
    sectionCompleteness: 70,
    readability: 60,
  });
  // 80*0.4 + 90*0.2 + 70*0.2 + 60*0.2 = 32 + 18 + 14 + 12 = 76
  assert.equal(score, 76);
});

test('computeCompositeScore handles missing categories as zero', () => {
  const score = scoringService.computeCompositeScore({ keywordMatch: 100 });
  // 100*0.4 = 40
  assert.equal(score, 40);
});

test('computeCompositeScore returns 100 for a perfect breakdown', () => {
  const score = scoringService.computeCompositeScore({
    keywordMatch: 100,
    formatting: 100,
    sectionCompleteness: 100,
    readability: 100,
  });
  assert.equal(score, 100);
});
