import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a subscription confirmation email
 */
export async function sendSubscriptionConfirmationEmail(
  email: string,
  topicLabels: string[]
): Promise<void> {
  try {
    await resend.emails.send({
      from: "ThreadSign <onboarding@resend.dev>", // TODO: Update with your domain
      to: email,
      subject: "You're subscribed to ThreadSign updates",
      html: `
        <h1>Welcome to ThreadSign!</h1>
        <p>You've successfully subscribed to email updates for the following topics:</p>
        <ul>
          ${topicLabels.map((label) => `<li>${label}</li>`).join("")}
        </ul>
        <p>You'll receive periodic emails with new product ideas based on real Reddit discussions.</p>
        <p>You can manage your subscriptions at any time in your dashboard.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send subscription confirmation email:", error);
    // Don't throw - subscription should still succeed even if email fails
  }
}

/**
 * Send an unsubscribe confirmation email
 */
export async function sendUnsubscribeConfirmationEmail(email: string): Promise<void> {
  try {
    await resend.emails.send({
      from: "ThreadSign <onboarding@resend.dev>", // TODO: Update with your domain
      to: email,
      subject: "You've unsubscribed from ThreadSign updates",
      html: `
        <h1>You've unsubscribed</h1>
        <p>You've successfully unsubscribed from ThreadSign email updates.</p>
        <p>You can resubscribe at any time in your dashboard.</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send unsubscribe confirmation email:", error);
    // Don't throw - unsubscribe should still succeed even if email fails
  }
}

