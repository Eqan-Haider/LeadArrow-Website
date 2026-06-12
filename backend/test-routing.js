require('dotenv').config();
const { routeLead } = require('./src/services/routingEngine');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  // ✅ your real company ID
  const companyId = '09747c6b-a803-4191-8709-5a9368cb1a04';

  // 1. create a test lead
  const lead = await prisma.leadLog.create({
    data: {
      companyId,
      prospectName: 'Direct Test',
      leadSource: 'Direct Test',
      crmLeadId: 'test-direct',
      crmRecordUrl: 'https://example.com',
      status: 'ROUTING',
    },
  });
  console.log('Lead created:', lead.id);

  // 2. call the routing engine
  await routeLead(lead.id, companyId);
  console.log('Routing engine finished. Check database for RoutingAttempt.');
}

test().catch(err => console.error('Test error:', err));