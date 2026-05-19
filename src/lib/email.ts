const OWNER_EMAIL = "eng.mohamednagyhassan@gmail.com";

interface EmailData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  date: string;
}

async function sendWithResend(payload: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("Resend error:", res.status, body);
    return false;
  }
  return true;
}

export async function sendOwnerNotification(data: EmailData): Promise<void> {
  await sendWithResend({
    from: "Portfolio <hello@mnagyh.com>",
    to: OWNER_EMAIL,
    subject: "New Portfolio Contact Message",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#e2e8f0;padding:32px;border-radius:12px;">
        <h2 style="color:#38bdf8;margin-top:0;">New recruiter inquiry received</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#94a3b8;width:100px;">Name:</td><td style="padding:8px 0;font-weight:600;">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;">Email:</td><td style="padding:8px 0;">${data.email}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;">Company:</td><td style="padding:8px 0;">${data.company || "—"}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;">Subject:</td><td style="padding:8px 0;">${data.subject}</td></tr>
          <tr><td style="padding:8px 0;color:#94a3b8;">Date:</td><td style="padding:8px 0;">${data.date}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#1e293b;border-radius:8px;border-left:3px solid #38bdf8;">
          <p style="margin:0;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;">Message</p>
          <p style="margin:8px 0 0;white-space:pre-wrap;">${data.message}</p>
        </div>
      </div>
    `,
  });
}

export async function sendRecruiterConfirmation(data: EmailData): Promise<void> {
  await sendWithResend({
    from: "Mohamed Nagy Hassan <hello@mnagyh.com>",
    to: data.email,
    subject: "Thanks for contacting Mohamed Nagy Hassan",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f1117;color:#e2e8f0;padding:32px;border-radius:12px;">
        <h2 style="color:#38bdf8;margin-top:0;">Thank you, ${data.name}!</h2>
        <p style="color:#cbd5e1;line-height:1.6;">
          Thank you for reaching out. I have received your message successfully and will get back to you soon.
        </p>
        <div style="margin-top:24px;padding:16px;background:#1e293b;border-radius:8px;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">Your inquiry details:</p>
          <p style="margin:8px 0 0;font-weight:600;">${data.subject}</p>
        </div>
        <p style="margin-top:24px;color:#64748b;font-size:13px;">
          — Mohamed Nagy Hassan<br>QA Engineer | Manual · API · Automation
        </p>
      </div>
    `,
  });
}
