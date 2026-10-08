const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'orbi'
});

const prisma = new PrismaClient({
    adapter
});

module.exports = prisma;