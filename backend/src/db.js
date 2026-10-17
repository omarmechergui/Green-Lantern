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
const prisma = new Proxy({}, {
  get(target, prop) {
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
});

module.exports = prisma;

