const test = require('node:test');
const assert = require('node:assert/strict');
const { reviewDeclarationSchema } = require('../src/validations/reviewDeclaration.validation');
const { redeemRewardSchema } = require('../src/validations/reward.validation');
const { updateProfileSchema } = require('../src/validations/user.validation');

test('Validation: Approval without acceptedWeight is rejected', () => {
  const result = reviewDeclarationSchema.safeParse({
    status: 'APPROVED',
  });
  assert.equal(result.success, false);
  const issues = result.error.issues;
  assert.ok(issues.some((i) => i.path.includes('acceptedWeight')));
});

test('Validation: Approval with non-positive or zero acceptedWeight is rejected', () => {
  const resultZero = reviewDeclarationSchema.safeParse({
    status: 'APPROVED',
    acceptedWeight: 0,
  });
  assert.equal(resultZero.success, false);

  const resultNegative = reviewDeclarationSchema.safeParse({
    status: 'APPROVED',
    acceptedWeight: -5.5,
  });
  assert.equal(resultNegative.success, false);
});

test('Validation: Approval with valid positive acceptedWeight is accepted', () => {
  const result = reviewDeclarationSchema.safeParse({
    status: 'APPROVED',
    acceptedWeight: 12.5,
  });
  assert.equal(result.success, true);
  assert.equal(result.data.acceptedWeight, 12.5);
});

test('Validation: Rejection without acceptedWeight is valid', () => {
  const result = reviewDeclarationSchema.safeParse({
    status: 'REJECTED',
    rejectionReason: 'Contaminated waste batch',
  });
  assert.equal(result.success, true);
});

test('Validation: Reward redemption requires valid 24-character hexadecimal ObjectId', () => {
  const invalid = redeemRewardSchema.safeParse({
    rewardId: 'short-id',
  });
  assert.equal(invalid.success, false);

  const valid = redeemRewardSchema.safeParse({
    rewardId: '507f1f77bcf86cd799439011',
  });
  assert.equal(valid.success, true);
});

test('Validation: Profile updates reject role, status, or balance fields', () => {
  const result = updateProfileSchema.safeParse({
    fullName: 'Jane Doe',
    role: 'ADMIN',
    ecoBalance: 99999,
  });
  assert.equal(result.success, true);
  // Extracted data must not include role or ecoBalance
  assert.equal(result.data.role, undefined);
  assert.equal(result.data.ecoBalance, undefined);
});
