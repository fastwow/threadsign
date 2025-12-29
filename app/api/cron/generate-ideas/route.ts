import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateIdeaFromPost } from "@/lib/openai";

/**
 * Cron job: Generate ideas from Reddit posts
 * Runs every 12 minutes
 * Only processes posts that haven't been processed yet (processed_at IS NULL)
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

    // Get unprocessed posts from /startups subreddit (limit to 5 per run to avoid rate limits)
    const { data: subreddit, error: subredditError } = await supabase
      .from("subreddits")
      .select("id")
      .eq("name", "r/startups")
      .single();

    if (subredditError || !subreddit) {
      throw new Error("r/startups subreddit not found");
    }

    const { data: unprocessedPosts, error: postsError } = await supabase
      .from("reddit_posts")
      .select("id, title, body, subreddits(name)")
      .is("processed_at", null)
      .eq("subreddit_id", subreddit.id)
      .limit(5);

    if (postsError) {
      throw postsError;
    }

    if (!unprocessedPosts || unprocessedPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No unprocessed posts found",
        ideas_generated: 0,
      });
    }

    // Get Developer Tools topic ID
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("id")
      .eq("key", "devtools")
      .single();

    if (topicError || !topic) {
      throw new Error("Developer Tools topic not found");
    }

    let ideasGenerated = 0;
    const errors: string[] = [];

    // Process each post
    for (const post of unprocessedPosts) {
      try {
        // Generate idea from post
        const ideaResult = await generateIdeaFromPost({
          postTitle: post.title,
          postBody: post.body || "",
          subreddit: (post.subreddits as any)?.name?.replace("r/", "") || "startups",
          promptVersion: "v1",
        });

        // Only store ideas with score >= 60
        if (ideaResult.score >= 60 && ideaResult.title) {
          // Insert the idea
          const { data: newIdea, error: ideaError } = await supabase
            .from("ideas")
            .insert({
              title: ideaResult.title,
              pitch: ideaResult.pitch,
              pain_insight: ideaResult.pain_insight,
              score: ideaResult.score,
              topic_id: topic.id,
              llm_model: "gpt-4o-mini",
              llm_prompt_version: "v1",
              llm_raw: {
                scoring_breakdown: ideaResult.scoring_breakdown,
              },
            })
            .select()
            .single();

          if (ideaError) {
            errors.push(`Failed to insert idea for post ${post.id}: ${ideaError.message}`);
            continue;
          }

          // Link idea to source post
          const { error: sourceError } = await supabase
            .from("idea_sources")
            .insert({
              idea_id: newIdea.id,
              reddit_post_id: post.id,
            });

          if (sourceError) {
            errors.push(`Failed to link idea to post ${post.id}: ${sourceError.message}`);
          } else {
            ideasGenerated++;
          }
        }

        // Mark post as processed (even if no idea was generated)
        await supabase
          .from("reddit_posts")
          .update({ processed_at: new Date().toISOString() })
          .eq("id", post.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Error processing post ${post.id}: ${errorMessage}`);
        
        // Still mark as processed to avoid infinite retries on bad posts
        await supabase
          .from("reddit_posts")
          .update({ processed_at: new Date().toISOString() })
          .eq("id", post.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Idea generation completed",
      posts_processed: unprocessedPosts.length,
      ideas_generated: ideasGenerated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error generating ideas:", error);
    return NextResponse.json(
      {
        error: "Failed to generate ideas",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

