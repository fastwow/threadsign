import { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailDigestsResult {
  success: boolean;
  subscriptions_processed?: number;
  emails_sent?: number;
  errors?: string[];
  error?: string;
}

/**
 * Step 3: Send email digests to subscribers
 * Sends only new ideas that match user's subscribed topics and haven't been sent before
 */
export async function sendEmailDigests(
  supabase: SupabaseClient
): Promise<SendEmailDigestsResult> {
  try {
    // Get all active subscriptions with their topics and user emails
    const { data: subscriptions, error: subsError } = await supabase
      .from("email_subscriptions")
      .select(
        `
        id,
        user_id,
        email_subscription_topics(
          topic_id,
          topics(id, key, label)
        )
      `
      )
      .eq("is_active", true);

    if (subsError) {
      throw subsError;
    }

    let emailsSent = 0;
    const errors: string[] = [];

    if (subscriptions && subscriptions.length > 0) {
      // Process each subscription
      for (const subscription of subscriptions) {
        try {
          // Get user's email from profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", subscription.user_id)
            .single();

          if (profileError || !profile?.email) {
            errors.push(`No email found for subscription ${subscription.id}`);
            continue;
          }

          const email = profile.email;

          const subscriptionTopics = (subscription.email_subscription_topics as any[]) || [];
          if (subscriptionTopics.length === 0) {
            continue; // Skip subscriptions with no topics
          }

          const topicIds = subscriptionTopics.map((est: any) => est.topic_id);

          // Get ideas that have already been sent to this user (idempotency)
          const { data: pastDeliveries, error: deliveriesError } = await supabase
            .from("email_deliveries")
            .select("ideas_included")
            .eq("subscription_id", subscription.id);

          if (deliveriesError) {
            errors.push(`Failed to fetch past deliveries for subscription ${subscription.id}: ${deliveriesError.message}`);
            continue;
          }

          // Collect all idea IDs that have been sent before
          const sentIdeaIds = new Set<string>();
          if (pastDeliveries) {
            for (const delivery of pastDeliveries) {
              const ideasIncluded = delivery.ideas_included as string[] | null;
              if (ideasIncluded && Array.isArray(ideasIncluded)) {
                ideasIncluded.forEach((id) => sentIdeaIds.add(id));
              }
            }
          }

          // Get new ideas matching subscribed topics that haven't been sent
          const { data: ideas, error: ideasError } = await supabase
            .from("ideas")
            .select(
              `
              id,
              title,
              pitch,
              pain_insight,
              score,
              created_at,
              topics(key, label),
              idea_sources(
                reddit_posts(
                  permalink,
                  subreddits(name)
                )
              )
            `
            )
            .in("topic_id", topicIds)
            .order("created_at", { ascending: false })
            .limit(10); // Limit to 10 most recent ideas per email

          if (ideasError) {
            errors.push(`Failed to fetch ideas for subscription ${subscription.id}: ${ideasError.message}`);
            continue;
          }

          // Filter out ideas that have already been sent
          const newIdeas = (ideas || []).filter((idea) => !sentIdeaIds.has(idea.id));

          if (newIdeas.length === 0) {
            continue; // No new ideas to send
          }

          // Format email content
          const topicLabels = subscriptionTopics.map((est: any) => est.topics?.label || "Unknown");
          const ideasListHtml = newIdeas
            .map((idea) => {
              const source = (idea.idea_sources as any[])?.[0]?.reddit_posts;
              const redditUrl = source?.permalink
                ? `https://reddit.com${source.permalink}`
                : null;
              const subreddit = source?.subreddits?.name || "Unknown";

              return `
                <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${idea.title}</h3>
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${idea.pitch}</p>
                  <div style="margin: 8px 0;">
                    <strong style="font-size: 14px;">Pain Insight:</strong>
                    <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px;">${idea.pain_insight}</p>
                  </div>
                  <div style="margin: 8px 0; font-size: 14px;">
                    <span style="color: #6b7280;">Score: </span>
                    <strong style="color: #059669;">${idea.score}</strong>
                    ${redditUrl ? `<span style="color: #6b7280; margin-left: 16px;">Source: <a href="${redditUrl}" style="color: #2563eb;">${subreddit}</a></span>` : ""}
                  </div>
                </div>
              `;
            })
            .join("");

          const emailHtml = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">New Product Ideas</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 0 0 24px 0;">
                Here are ${newIdeas.length} new product idea${newIdeas.length > 1 ? "s" : ""} matching your subscribed topics: ${topicLabels.join(", ")}
              </p>
              ${ideasListHtml}
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                  You're receiving this email because you subscribed to updates for: ${topicLabels.join(", ")}
                </p>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="color: #2563eb;">Manage your subscriptions</a>
                </p>
              </div>
            </div>
          `;

          // Send email
          const { data: emailResult, error: emailError } = await resend.emails.send({
            from: "ThreadSign <onboarding@resend.dev>", // TODO: Update with your domain
            to: email,
            subject: `${newIdeas.length} New Product Idea${newIdeas.length > 1 ? "s" : ""} from ThreadSign`,
            html: emailHtml,
          });

          if (emailError) {
            errors.push(`Failed to send email for subscription ${subscription.id}: ${emailError.message}`);
            continue;
          }

          // Record delivery (idempotency)
          const ideaIds = newIdeas.map((idea) => idea.id);
          const { error: deliveryError } = await supabase.from("email_deliveries").insert({
            subscription_id: subscription.id,
            sent_at: new Date().toISOString(),
            ideas_included: ideaIds,
            resend_message_id: emailResult?.id || null,
          });

          if (deliveryError) {
            errors.push(`Failed to record delivery for subscription ${subscription.id}: ${deliveryError.message}`);
          } else {
            emailsSent++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Error processing subscription ${subscription.id}: ${errorMessage}`);
        }
      }
    }

    return {
      success: true,
      subscriptions_processed: subscriptions?.length || 0,
      emails_sent: emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

