const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

async function sendWeeklyReport() {
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  for (const company of companies) {
    const stats = await getCompanyStats(company.id);
    const manager = await prisma.user.findFirst({
      where: { companyId: company.id, role: 'MANAGER' },
      select: { email: true },
    });
    if (!manager) continue;

    await transporter.sendMail({
      from: '"LeadArrow" <no-reply@leadarrow.com>',
      to: manager.email,
      subject: `Weekly Report – ${company.name}`,
      html: `<h2>Weekly Summary</h2>
             <p>Total Leads: ${stats.total}</p>
             <p>Accepted: ${stats.accepted}</p>
             <p>Connection Rate: ${stats.connectionRate}%</p>
             <p>Avg Response: ${stats.avgResponse}s</p>`,
    });
  }
}

async function getCompanyStats(companyId) {
  const total = await prisma.leadLog.count({ where: { companyId } });
  const accepted = await prisma.leadLog.count({ where: { companyId, status: 'CONNECTED' } });
  const attempts = await prisma.routingAttempt.findMany({
    where: { leadLog: { companyId }, status: 'ACCEPTED' },
    select: { createdAt: true, leadLog: { select: { createdAt: true } } },
  });
  const avg = attempts.reduce((s, a) => s + (new Date(a.createdAt) - new Date(a.leadLog.createdAt)), 0) / (attempts.length || 1);
  return {
    total,
    accepted,
    connectionRate: ((accepted / total) * 100).toFixed(1),
    avgResponse: Math.round(avg / 1000),
  };
}

// Schedule: every Monday at 8:00 AM
cron.schedule('0 8 * * 1', () => {
  console.log('Running weekly report job...');
  sendWeeklyReport().catch(console.error);
});