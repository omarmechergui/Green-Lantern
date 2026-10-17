const { PrismaClient } = require('@prisma/client');
const env = require('./config/env');

let prismaInstance = null;
let prismaInitError = null;

function getPrismaClient() {
  if (prismaInitError) {
    return null;
  }
  if (!prismaInstance) {
    try {
      prismaInstance = new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    } catch (err) {
      prismaInitError = err;
      return null;
    }
  }
  return prismaInstance;
}

// Proxied object allowing standard prisma usage while being resilient if not generated yet
const prismaOverrides = new Map();

const prisma = new Proxy({}, {
  get(target, prop) {
    if (prismaOverrides.has(prop)) {
      return prismaOverrides.get(prop);
    }
    const client = getPrismaClient();
    if (!client) {
      if (prop === '$disconnect') {
        return async () => {};
      }
      return undefined;
    }
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  set(target, prop, value) {
    prismaOverrides.set(prop, value);
    return true;
  },
  deleteProperty(target, prop) {
    return prismaOverrides.delete(prop);
  },
});

module.exports = prisma;

