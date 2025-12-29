"use server";

import { createClient } from "@/lib/supabase/server";
import { sendSubscriptionConfirmationEmail, sendUnsubscribeConfirmationEmail } from "@/lib/email";

export interface SubscriptionResult {
  success: boolean;
  error?: string;
  subscriptionId?: string;
}

/**
 * Create or update an email subscription
 */
export async function updateSubscription(
  topicIds: string[]
): Promise<SubscriptionResult> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile to access email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "User profile not found" };
    }

    // Check if subscription already exists
    const { data: existingSubscription, error: subError } = await supabase
      .from("email_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError && subError.code !== "PGRST116") {
      // PGRST116 is "not found" which is fine
      return { success: false, error: subError.message };
    }

    let subscriptionId: string;

    if (existingSubscription) {
      // Update existing subscription
      const isActive = topicIds.length > 0;
      
      const { error: updateError } = await supabase
        .from("email_subscriptions")
        .update({ is_active: isActive })
        .eq("id", existingSubscription.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Remove all existing topic associations
      const { error: deleteError } = await supabase
        .from("email_subscription_topics")
        .delete()
        .eq("subscription_id", existingSubscription.id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      subscriptionId = existingSubscription.id;
    } else {
      // Create new subscription
      const { data: newSubscription, error: createError } = await supabase
        .from("email_subscriptions")
        .insert({
          user_id: user.id,
          is_active: topicIds.length > 0,
        })
        .select()
        .single();

      if (createError) {
        return { success: false, error: createError.message };
      }

      subscriptionId = newSubscription.id;
    }

    // Add selected topics
    if (topicIds.length > 0) {
      const topicInserts = topicIds.map((topicId) => ({
        subscription_id: subscriptionId,
        topic_id: topicId,
      }));

      const { error: insertError } = await supabase
        .from("email_subscription_topics")
        .insert(topicInserts);

      if (insertError) {
        return { success: false, error: insertError.message };
      }

      // Send confirmation email only for new subscriptions (not updates)
      if (!existingSubscription) {
        const { data: topics } = await supabase
          .from("topics")
          .select("label")
          .in("id", topicIds);

        if (topics && profile.email) {
          await sendSubscriptionConfirmationEmail(
            profile.email,
            topics.map((t) => t.label)
          );
        }
      }
    }

    return { success: true, subscriptionId };
  } catch (error) {
    console.error("Subscription update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Unsubscribe from email updates
 */
export async function unsubscribe(): Promise<SubscriptionResult> {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get user's profile to access email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "User profile not found" };
    }

    // Find existing subscription
    const { data: subscription, error: subError } = await supabase
      .from("email_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subError && subError.code !== "PGRST116") {
      return { success: false, error: subError.message };
    }

    if (!subscription) {
      return { success: false, error: "No subscription found" };
    }

    // Deactivate subscription
    const { error: updateError } = await supabase
      .from("email_subscriptions")
      .update({ is_active: false })
      .eq("id", subscription.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Remove all topic associations
    const { error: deleteError } = await supabase
      .from("email_subscription_topics")
      .delete()
      .eq("subscription_id", subscription.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Send confirmation email
    if (profile.email) {
      await sendUnsubscribeConfirmationEmail(profile.email);
    }

    return { success: true, subscriptionId: subscription.id };
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

