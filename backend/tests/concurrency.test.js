const test = require('node:test');
const assert = require('node:assert/strict');

// Import controllers
const wasteController = require('../src/controllers/waste.controller');
const rewardController = require('../src/controllers/reward.controller');
const prisma = require('../src/db');

// Valid 24-character hexadecimal MongoDB ObjectIds
const VALID_DECL_ID = '507f1f77bcf86cd799439011';
const VALID_REWARD_ID = '507f1f77bcf86cd799439022';
const VALID_CENTER_ID = '507f1f77bcf86cd799439033';
const VALID_CITIZEN_ID = '507f1f77bcf86cd799439044';
const VALID_ADMIN_ID = '507f1f77bcf86cd799439055';
const VALID_PARTNER_ID = '507f1f77bcf86cd799439066';

// Helper to create mock response object
function createMockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

test('1. Approval without acceptedWeight is rejected with 400', async () => {
  const origFindUnique = prisma.wasteDeclaration.findUnique;
  try {
    prisma.wasteDeclaration.findUnique = async () => ({
      id: VALID_DECL_ID,
      citizenId: VALID_CITIZEN_ID,
      status: 'PENDING',
      wasteCategory: { id: 'cat-1', name: 'Plastic', pointsPerKg: 10 },
      delivery: null,
    });

    const req = {
      user: { id: VALID_ADMIN_ID, role: 'ADMIN' },
      params: { id: VALID_DECL_ID },
      body: { status: 'APPROVED' }, // Missing acceptedWeight
    };
    const res = createMockRes();

    await wasteController.reviewDeclaration(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonData.status, 'error');
    assert.match(res.jsonData.message, /verified, positive accepted weight/i);
  } finally {
    prisma.wasteDeclaration.findUnique = origFindUnique;
  }
});

test('2. Approval with valid accepted weight awards correct points', async () => {
  const origFindUnique = prisma.wasteDeclaration.findUnique;
  const origTransaction = prisma.$transaction;

  try {
    prisma.wasteDeclaration.findUnique = async () => ({
      id: VALID_DECL_ID,
      citizenId: VALID_CITIZEN_ID,
      status: 'PENDING',
      estimatedWeight: 5.0,
      wasteCategory: { id: 'cat-1', name: 'Plastic', pointsPerKg: 10 },
      delivery: null,
    });

    let transactionExecuted = false;
    let awardedAmount = 0;

    prisma.$transaction = async (callback) => {
      transactionExecuted = true;
      const fakeTx = {
        wasteDeclaration: {
          updateMany: async () => ({ count: 1 }),
          findUnique: async () => ({ id: VALID_DECL_ID, status: 'APPROVED' }),
        },
        wasteDelivery: {
          create: async (args) => ({ id: 'del-1', ...args.data }),
        },
        ecoTransaction: {
          create: async (args) => {
            awardedAmount = args.data.amount;
            return { id: 'tx-1', ...args.data };
          },
        },
        user: {
          update: async () => ({ ecoBalance: awardedAmount }),
        },
        notification: {
          create: async () => ({ id: 'notif-1' }),
        },
      };
      return callback(fakeTx);
    };

    const req = {
      user: { id: VALID_ADMIN_ID, role: 'ADMIN' },
      params: { id: VALID_DECL_ID },
      body: { status: 'APPROVED', acceptedWeight: 7.5 },
    };
    const res = createMockRes();

    await wasteController.reviewDeclaration(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(transactionExecuted, true);
    // 7.5 kg * 10 pts/kg = 75 Eco Coins
    assert.equal(awardedAmount, 75);
    assert.equal(res.jsonData.data.newBalance, 75);
  } finally {
    prisma.wasteDeclaration.findUnique = origFindUnique;
    prisma.$transaction = origTransaction;
  }
});

test('3. Two simultaneous approval requests produce exactly one award (concurrency guard)', async () => {
  const origFindUnique = prisma.wasteDeclaration.findUnique;
  const origTransaction = prisma.$transaction;

  try {
    prisma.wasteDeclaration.findUnique = async () => ({
      id: VALID_DECL_ID,
      citizenId: VALID_CITIZEN_ID,
      status: 'PENDING',
      wasteCategory: { id: 'cat-1', name: 'Plastic', pointsPerKg: 10 },
      delivery: null,
    });

    let attemptCount = 0;
    prisma.$transaction = async (callback) => {
      attemptCount++;
      const currentAttempt = attemptCount;
      const fakeTx = {
        wasteDeclaration: {
          updateMany: async () => {
            // First concurrent request succeeds (count: 1); second concurrent request gets count: 0
            if (currentAttempt === 1) return { count: 1 };
            return { count: 0 };
          },
          findUnique: async () => ({ id: VALID_DECL_ID, status: 'APPROVED' }),
        },
        wasteDelivery: { create: async () => ({ id: 'del-1' }) },
        ecoTransaction: { create: async () => ({ id: 'tx-1' }) },
        user: { update: async () => ({ ecoBalance: 50 }) },
        notification: { create: async () => ({ id: 'notif-1' }) },
      };
      return callback(fakeTx);
    };

    // Simulate two concurrent requests
    const req1 = {
      user: { id: VALID_ADMIN_ID, role: 'ADMIN' },
      params: { id: VALID_DECL_ID },
      body: { status: 'APPROVED', acceptedWeight: 5.0 },
    };
    const res1 = createMockRes();

    const req2 = {
      user: { id: 'admin-2', role: 'ADMIN' },
      params: { id: VALID_DECL_ID },
      body: { status: 'APPROVED', acceptedWeight: 5.0 },
    };
    const res2 = createMockRes();

    await Promise.all([
      wasteController.reviewDeclaration(req1, res1, () => {}),
      wasteController.reviewDeclaration(req2, res2, () => {}),
    ]);

    // Request 1 succeeded
    assert.equal(res1.statusCode, 200);
    assert.equal(res1.jsonData.status, 'success');

    // Request 2 was rejected by the atomic state transition guard with 409 Conflict
    assert.equal(res2.statusCode, 409);
    assert.equal(res2.jsonData.status, 'error');
  } finally {
    prisma.wasteDeclaration.findUnique = origFindUnique;
    prisma.$transaction = origTransaction;
  }
});

test('4. Failed approval transaction does not leave partial balance, delivery, or ledger changes', async () => {
  const origFindUnique = prisma.wasteDeclaration.findUnique;
  const origTransaction = prisma.$transaction;

  try {
    prisma.wasteDeclaration.findUnique = async () => ({
      id: VALID_DECL_ID,
      citizenId: VALID_CITIZEN_ID,
      status: 'PENDING',
      wasteCategory: { id: 'cat-1', name: 'Plastic', pointsPerKg: 10 },
      delivery: null,
    });

    let balanceUpdated = false;
    let ledgerCreated = false;

    prisma.$transaction = async (callback) => {
      const fakeTx = {
        wasteDeclaration: {
          updateMany: async () => ({ count: 1 }),
          findUnique: async () => ({ id: VALID_DECL_ID }),
        },
        wasteDelivery: {
          create: async () => {
            // Simulated database crash / constraint failure
            throw new Error('Database constraint error during delivery creation');
          },
        },
        ecoTransaction: {
          create: async () => { ledgerCreated = true; },
        },
        user: {
          update: async () => { balanceUpdated = true; },
        },
        notification: {
          create: async () => {},
        },
      };
      return callback(fakeTx);
    };

    const req = {
      user: { id: VALID_ADMIN_ID, role: 'ADMIN' },
      params: { id: VALID_DECL_ID },
      body: { status: 'APPROVED', acceptedWeight: 5.0 },
    };
    const res = createMockRes();
    let passedError = null;

    await wasteController.reviewDeclaration(req, res, (err) => { passedError = err; });

    // Ensure downstream updates were never executed due to transactional abort
    assert.equal(balanceUpdated, false);
    assert.equal(ledgerCreated, false);
    assert.ok(passedError !== null);
  } finally {
    prisma.wasteDeclaration.findUnique = origFindUnique;
    prisma.$transaction = origTransaction;
  }
});

test('5. A PARTNER cannot review a declaration belonging to an unauthorized center', async () => {
  const origFindUnique = prisma.wasteDeclaration.findUnique;
  const origFindFirst = prisma.recyclingCenter.findFirst;

  try {
    prisma.wasteDeclaration.findUnique = async () => ({
      id: VALID_DECL_ID,
      citizenId: VALID_CITIZEN_ID,
      status: 'PENDING',
      delivery: {
        centerId: VALID_CENTER_ID,
      },
    });

    // Partner manages center-authorized, NOT VALID_CENTER_ID
    prisma.recyclingCenter.findFirst = async () => null;

    const req = {
      user: { id: VALID_PARTNER_ID, role: 'PARTNER' },
      params: { id: VALID_DECL_ID },
      body: { status: 'APPROVED', acceptedWeight: 5.0 },
    };
    const res = createMockRes();

    await wasteController.reviewDeclaration(req, res, () => {});

    assert.equal(res.statusCode, 403);
    assert.equal(res.jsonData.status, 'error');
    assert.match(res.jsonData.message, /not authorized to review declarations for this recycling center/i);
  } finally {
    prisma.wasteDeclaration.findUnique = origFindUnique;
    prisma.recyclingCenter.findFirst = origFindFirst;
  }
});

test('6. Two simultaneous redemption requests with enough balance for only one succeed only once', async () => {
  const origTransaction = prisma.$transaction;

  try {
    let stockCount = 1;
    let userBalance = 100;
    const cost = 100;

    prisma.$transaction = async (callback) => {
      const fakeTx = {
        reward: {
          findUnique: async () => ({ id: VALID_REWARD_ID, title: 'Eco Bottle', pointsCost: cost, stock: stockCount, isActive: true }),
          updateMany: async () => {
            if (stockCount >= 1) {
              stockCount -= 1;
              return { count: 1 };
            }
            return { count: 0 };
          },
        },
        user: {
          updateMany: async () => {
            if (userBalance >= cost) {
              userBalance -= cost;
              return { count: 1 };
            }
            return { count: 0 };
          },
          findUnique: async () => ({ ecoBalance: userBalance }),
        },
        rewardRedemption: { create: async () => ({ id: 'redemp-1' }) },
        ecoTransaction: { create: async () => ({ id: 'tx-redemp-1' }) },
        notification: { create: async () => ({ id: 'notif-redemp-1' }) },
      };
      return callback(fakeTx);
    };

    const req1 = {
      user: { id: VALID_CITIZEN_ID },
      body: { rewardId: VALID_REWARD_ID },
    };
    const res1 = createMockRes();

    const req2 = {
      user: { id: VALID_CITIZEN_ID },
      body: { rewardId: VALID_REWARD_ID },
    };
    const res2 = createMockRes();

    await Promise.all([
      rewardController.redeemReward(req1, res1, () => {}),
      rewardController.redeemReward(req2, res2, () => {}),
    ]);

    // Request 1 succeeded
    assert.equal(res1.statusCode, 201);
    assert.equal(res1.jsonData.status, 'success');

    // Request 2 failed with 400
    assert.equal(res2.statusCode, 400);
    assert.equal(res2.jsonData.status, 'error');

    // Invariant: Balance cannot be negative
    assert.equal(userBalance, 0);
    assert.equal(stockCount, 0);
  } finally {
    prisma.$transaction = origTransaction;
  }
});

test('7. Failed redemption leaves balance, stock, and ledger unchanged', async () => {
  const origTransaction = prisma.$transaction;

  try {
    let ledgerCreated = false;

    prisma.$transaction = async (callback) => {
      const fakeTx = {
        reward: {
          findUnique: async () => ({ id: VALID_REWARD_ID, title: 'Plant Kit', pointsCost: 300, stock: 1, isActive: true }),
          updateMany: async () => ({ count: 1 }), // stock ok
        },
        user: {
          updateMany: async () => ({ count: 0 }), // balance update fails! Insufficient balance
          findUnique: async () => ({ ecoBalance: 50 }),
        },
        rewardRedemption: { create: async () => { throw new Error('Should not reach here'); } },
        ecoTransaction: { create: async () => { ledgerCreated = true; } },
        notification: { create: async () => {} },
      };
      return callback(fakeTx);
    };

    const req = {
      user: { id: 'user-low-balance' },
      body: { rewardId: VALID_REWARD_ID },
    };
    const res = createMockRes();

    await rewardController.redeemReward(req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.match(res.jsonData.message, /insufficient/i);
    assert.equal(ledgerCreated, false);
  } finally {
    prisma.$transaction = origTransaction;
  }
});
