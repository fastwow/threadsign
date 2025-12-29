import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateMockRedditPost } from "@/lib/openai";

/**
 * Cron job: Generate mock Reddit posts
 * Runs every 5 minutes
 * Scope: Developer Tools topic, /startups subreddit
 */
export async function GET(request: Request) {
  // Verify this is a cron request
  // Check for CRON_SECRET in query params or header (for manual testing)
  // In production, consider additional security measures
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") || request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // Get Developer Tools topic
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("id, key, label")
      .eq("key", "devtools")
      .single();

    if (topicError || !topic) {
      throw new Error("Developer Tools topic not found");
    }

    // Get /startups subreddit
    const { data: subreddit, error: subredditError } = await supabase
      .from("subreddits")
      .select("id, name")
      .eq("name", "r/startups")
      .single();

    if (subredditError || !subreddit) {
      throw new Error("r/startups subreddit not found");
    }

    // Generate at least 5 mock Reddit posts using LLM
    const postsToGenerate = 5;
    const generatedPosts = [];
    const skippedPosts = [];

    for (let i = 0; i < postsToGenerate; i++) {
      try {
        const mockPost = await generateMockRedditPost({
          subreddit: "startups",
          topic: topic.label,
        });

        // Check if post with this reddit_post_id already exists
        const { data: existingPost } = await supabase
          .from("reddit_posts")
          .select("id")
          .eq("reddit_post_id", mockPost.reddit_post_id)
          .single();

        if (existingPost) {
          skippedPosts.push(mockPost.reddit_post_id);
          continue;
        }

        // Insert the generated post
        const { data: newPost, error: insertError } = await supabase
          .from("reddit_posts")
          .insert({
            reddit_post_id: mockPost.reddit_post_id,
            subreddit_id: subreddit.id,
            title: mockPost.title,
            body: mockPost.body,
            permalink: mockPost.permalink,
            score: mockPost.score, // Raw Reddit score for realism only
            num_comments: mockPost.num_comments, // Raw comment count for realism only
            created_utc: new Date().toISOString(),
            processed_at: null, // Will be set when processed by idea generation
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error inserting post ${i + 1}:`, insertError);
          continue;
        }

        generatedPosts.push(newPost.id);
      } catch (error) {
        console.error(`Error generating post ${i + 1}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Reddit posts generation completed",
      posts_generated: generatedPosts.length,
      posts_skipped: skippedPosts.length,
      post_ids: generatedPosts,
    });
  } catch (error) {
    console.error("Error generating Reddit post:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Reddit post",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

