import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465' || process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
});

export async function sendInvitationEmail(to: string, customInviteUrl: string) {
    console.log('[Mail] Sending invitation email to', to);
    const mailOptions = {
        from: process.env.SMTP_FROM || 'info@photoup.pt',
        to,
        subject: 'You have been invited to join your Workspace',
        html: `
      <h2>Welcome to your Workspace!</h2>
      <p>Your subscription payment was successful, and your workspace is ready.</p>
      <p>Please click the link below to accept the invitation and securely set up your account password:</p>
      <a href="${customInviteUrl}"><strong>Accept Invitation & Set Password</strong></a>
      <br/><br/>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${customInviteUrl}</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[Mail] Invitation email securely sent to ${to}`);
    } catch (error) {
        console.error(`[Mail] Failed to send invitation email to ${to}:`, error);
        // Not throwing here to prevent the Stripe webhook from retrying infinitely
        // just because of an SMTP configuration issue in dev/testing.
    }
}
