"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

interface Idea {
  id: string;
  title: string;
  pitch: string;
  pain_insight: string;
  score: number;
  created_at: string;
  topic: {
    id: string;
    key: string;
    label: string;
  };
  idea_sources: Array<{
    reddit_post: {
      id: string;
      permalink: string;
      subreddit: {
        name: string;
      };
    };
  }>;
}

export function IdeaFeed() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [topics, setTopics] = useState<Array<{ id: string; key: string; label: string }>>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      setLoading(true);
      setError(null);

      try {
        // Load topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("id, key, label")
          .order("label");

        if (topicsError) throw topicsError;
        setTopics(topicsData || []);

        // Load ideas
        await loadIdeas(selectedTopic);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function loadIdeas(topicKey: string) {
    const supabase = createClient();
    setLoading(true);

    try {
      // If filtering by topic, first get the topic_id
      let topicId: string | null = null;
      if (topicKey !== "all") {
        const { data: topicData, error: topicError } = await supabase
          .from("topics")
          .select("id")
          .eq("key", topicKey)
          .single();

        if (topicError) throw topicError;
        topicId = topicData?.id || null;
        
        // If topic not found, return empty array
        if (!topicId) {
          setIdeas([]);
          setLoading(false);
          return;
        }
      }

      let query = supabase
        .from("ideas")
        .select(
          `
          id,
          title,
          pitch,
          pain_insight,
          score,
          created_at,
          topic_id,
          topics!topic_id(id, key, label),
          idea_sources(
            reddit_posts(
              id,
              permalink,
              subreddits(name)
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (topicId) {
        query = query.eq("topic_id", topicId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match Idea interface
      const transformedData = (data || [])
        .map((item: any) => {
          // Handle topic - Supabase returns it as an object (not array) for FK relationships
          const topic = item.topics;
          
          // Filter out items without valid topics
          if (!topic || !topic.id || !topic.label) {
            return null;
          }
          
          return {
            id: item.id,
            title: item.title,
            pitch: item.pitch,
            pain_insight: item.pain_insight,
            score: item.score,
            created_at: item.created_at,
            topic: topic,
            idea_sources: (item.idea_sources || []).map((is: any) => ({
              reddit_post: {
                id: is.reddit_posts?.id,
                permalink: is.reddit_posts?.permalink,
                subreddit: {
                  name: is.reddit_posts?.subreddits?.name || "Unknown",
                },
              },
            })),
          };
        })
        .filter((item): item is Idea => item !== null);
      
      setIdeas(transformedData as Idea[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }

  const handleTopicChange = (topicKey: string) => {
    setSelectedTopic(topicKey);
    loadIdeas(topicKey);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-muted-foreground";
  };

  const isNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours < 48; // New if less than 48 hours old
  };

  if (loading && ideas.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Loading ideas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic Filter */}
      <Tabs value={selectedTopic} onValueChange={handleTopicChange}>
        <TabsList>
          <TabsTrigger value="all">All Topics</TabsTrigger>
          {topics.map((topic) => (
            <TabsTrigger key={topic.id} value={topic.key}>
              {topic.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Ideas List */}
      {ideas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              No ideas found. Ideas are being generated from Reddit discussions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ideas.map((idea) => {
            const source = idea.idea_sources?.[0]?.reddit_post;
            const subreddit = source?.subreddit?.name || "Unknown";
            const redditUrl = source?.permalink
              ? `https://reddit.com${source.permalink}`
              : null;

            return (
              <Card key={idea.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{idea.title}</CardTitle>
                        {isNew(idea.created_at) && (
                          <Badge variant="secondary" className="bg-accent">
                            New
                          </Badge>
                        )}
                        {idea.topic && (
                          <Badge variant="outline">{idea.topic.label}</Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">{idea.pitch}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className={`h-4 w-4 ${getScoreColor(idea.score)}`} />
                        <span className={`font-semibold ${getScoreColor(idea.score)}`}>
                          {idea.score}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(idea.created_at)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Pain Insight</h4>
                    <p className="text-sm text-muted-foreground">{idea.pain_insight}</p>
                  </div>
                  {redditUrl && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Source: {subreddit}
                      </span>
                      <Button asChild variant="ghost" size="sm">
                        <a href={redditUrl} target="_blank" rel="noopener noreferrer">
                          View Thread
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

