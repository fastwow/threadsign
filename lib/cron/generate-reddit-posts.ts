import { SupabaseClient } from "@supabase/supabase-js";
import { generateMockRedditPost } from "@/lib/openai";

export interface GenerateRedditPostsResult {
  success: boolean;
  posts_generated?: number;
  posts_skipped?: number;
  error?: string;
}

/**
 * Step 1: Generate mock Reddit posts
 * Generates at least 5 mock Reddit posts using LLM
 * Scope: Developer Tools topic, /startups subreddit
 */
export async function generateRedditPosts(
  supabase: SupabaseClient
): Promise<GenerateRedditPostsResult> {
  try {
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
    const generatedPosts: string[] = [];
    const skippedPosts: string[] = [];

    for (let i = 0; i < postsToGenerate; i++) {
      try {
        const mockPost = await generateMockRedditPost({
          subreddit: "startups",
          topic: topic.label,
        });

        // Check if post with this reddit_post_id already exists (idempotency)
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
            score: mockPost.score,
            num_comments: mockPost.num_comments,
            created_utc: new Date().toISOString(),
            processed_at: null,
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

    return {
      success: true,
      posts_generated: generatedPosts.length,
      posts_skipped: skippedPosts.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

