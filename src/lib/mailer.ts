import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendContactEmail(data: {
  name: string;
  email: string;
  service: string;
  message: string;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'luffybaz111@gmail.com',
    subject: `📩 פנייה חדשה מ-${data.name} | ${data.service}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">פנייה חדשה מהאתר</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; font-weight:bold;">שם:</td><td style="padding:8px;">${data.name}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">אימייל:</td><td style="padding:8px;">${data.email}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">שירות:</td><td style="padding:8px;">${data.service}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">הודעה:</td><td style="padding:8px;">${data.message}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmails(data: {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  amount: number;
  packageName?: string;
  paymentRef?: string;
  date: string;
}) {
  const { customerName, customerEmail, serviceType, amount, packageName, paymentRef, date } = data;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'luffybaz111@gmail.com',
    subject: `💰 תשלום חדש — ₪${amount} | ${serviceType}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">💰 תשלום חדש התקבל!</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; font-weight:bold;">לקוח:</td><td style="padding:8px;">${customerName}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">אימייל:</td><td style="padding:8px;">${customerEmail}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">שירות:</td><td style="padding:8px;">${serviceType}</td></tr>
          ${packageName ? `<tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">חבילה:</td><td style="padding:8px;">${packageName}</td></tr>` : ''}
          <tr><td style="padding:8px; font-weight:bold;">סכום:</td><td style="padding:8px; color:#22c55e; font-size:18px; font-weight:bold;">₪${amount}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px; font-weight:bold;">תאריך:</td><td style="padding:8px;">${date}</td></tr>
          ${paymentRef ? `<tr><td style="padding:8px; font-weight:bold;">מזהה תשלום:</td><td style="padding:8px;">${paymentRef}</td></tr>` : ''}
        </table>
      </div>
    `,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `קיבלנו את התשלום שלך ✓`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">תודה על התשלום, ${customerName}! 🎉</h2>
        <p>אישרנו את התשלום שלך בהצלחה.</p>
        <div style="background:#f0f9ff; padding:20px; border-radius:8px; margin:20px 0;">
          <h3 style="margin:0 0 10px;">סיכום הזמנה</h3>
          <p><strong>שירות:</strong> ${serviceType}</p>
          ${packageName ? `<p><strong>חבילה:</strong> ${packageName}</p>` : ''}
          <p><strong>סכום ששולם:</strong> <span style="color:#22c55e; font-weight:bold;">₪${amount}</span></p>
          <p><strong>תאריך:</strong> ${date}</p>
        </div>
        <p style="font-size:18px; color:#6366f1; font-weight:bold;">ניצור איתך קשר תוך 24 שעות 🚀</p>
        <p>בברכה,<br>צוות DevCraft</p>
      </div>
    `,
  });
}
