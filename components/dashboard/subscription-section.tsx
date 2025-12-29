"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, ChevronDown } from "lucide-react";
import { updateSubscription, unsubscribe as unsubscribeAction } from "@/app/actions/subscriptions";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  key: string;
  label: string;
}

interface Subscription {
  id: string;
  is_active: boolean;
  topics: Topic[];
}

export function SubscriptionSection({ userId }: { userId: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const loadSubscriptionData = async () => {
    const supabase = createClient();

    try {
      // Load user's subscription
      const { data: subData, error: subError } = await supabase
        .from("email_subscriptions")
        .select(
          `
          id,
          is_active,
          email_subscription_topics(
            topic:topics(id, key, label)
          )
        `
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (subError) throw subError;

      if (subData) {
        setSubscription({
          id: subData.id,
          is_active: subData.is_active,
          topics: (subData.email_subscription_topics as any[]).map(
            (est: any) => est.topic
          ),
        });
        const topicIds = (subData.email_subscription_topics as any[]).map((est: any) => est.topic.id);
        setSelectedTopics(new Set(topicIds));
        // Set default expansion state: expanded if no topics, collapsed if has topics
        setIsExpanded(topicIds.length === 0);
      } else {
        setSubscription(null);
        setSelectedTopics(new Set());
        // Expanded if no subscription/topics
        setIsExpanded(true);
      }
    } catch (err) {
      console.error("Failed to load subscription:", err);
      throw err;
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const supabase = createClient();
        // Load topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("id, key, label")
          .order("label");

        if (topicsError) throw topicsError;
        setTopics(topicsData || []);

        // Load user's subscription
        await loadSubscriptionData();
      } catch (err) {
        setMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to load subscription",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId]);

  const handleTopicToggle = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const topicIds = Array.from(selectedTopics);
      const result = await updateSubscription(topicIds);

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.error || "Failed to update subscription",
        });
        return;
      }

      setMessage({
        type: "success",
        text:
          topicIds.length > 0
            ? "Email subscription updated successfully"
            : "Email subscription disabled",
      });

      // Reload subscription data
      await loadSubscriptionData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update subscription",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const result = await unsubscribeAction();

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.error || "Failed to unsubscribe",
        });
        return;
      }

      // Clear selected topics
      setSelectedTopics(new Set());

      setMessage({
        type: "success",
        text: "Successfully unsubscribed from email notifications",
      });

      // Reload subscription data
      await loadSubscriptionData();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to unsubscribe",
      });
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading subscription settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <div>
              <CardTitle>Email Subscriptions</CardTitle>
              <CardDescription className="mt-1">
                Subscribe to receive periodic emails with new product ideas by topic
              </CardDescription>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-200 text-muted-foreground",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
        <div className="space-y-3">
          {topics.map((topic) => (
            <div key={topic.id} className="flex items-center space-x-2">
              <Checkbox
                id={`topic-${topic.id}`}
                checked={selectedTopics.has(topic.id)}
                onCheckedChange={() => handleTopicToggle(topic.id)}
              />
              <Label
                htmlFor={`topic-${topic.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {topic.label}
              </Label>
            </div>
          ))}
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 text-sm ${
              message.type === "success" ? "text-green-500" : "text-destructive"
            }`}
          >
            {message.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : subscription?.is_active ? "Update Subscription" : "Save Subscription"}
          </Button>
          {subscription?.is_active && (
            <Button
              onClick={handleUnsubscribe}
              disabled={saving}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Unsubscribe
            </Button>
          )}
        </div>
        </CardContent>
      )}
    </Card>
  );
}

