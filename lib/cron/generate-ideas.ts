import { SupabaseClient } from "@supabase/supabase-js";
import { generateIdeaFromPost } from "@/lib/openai";

export interface GenerateIdeasResult {
  success: boolean;
  posts_processed?: number;
  ideas_generated?: number;
  errors?: string[];
  error?: string;
}

/**
 * Step 2: Generate ideas from Reddit posts
 * Evaluates unprocessed Reddit posts and generates product ideas with viability scores
 * Only stores ideas with score >= 60
 */
export async function generateIdeas(
  supabase: SupabaseClient
): Promise<GenerateIdeasResult> {
  try {
    // Get unprocessed posts from /startups subreddit
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
      .limit(10); // Process up to 10 posts per day

    if (postsError) {
      throw postsError;
    }

    let ideasGenerated = 0;
    const errors: string[] = [];

    if (unprocessedPosts && unprocessedPosts.length > 0) {
      // Get Developer Tools topic ID
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .eq("key", "devtools")
        .single();

      if (topicError || !topic) {
        throw new Error("Developer Tools topic not found");
      }

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
                  pain_point_intensity: ideaResult.scoring_breakdown.pain_point_intensity,
                  willingness_to_pay: ideaResult.scoring_breakdown.willingness_to_pay,
                  competitive_landscape: ideaResult.scoring_breakdown.competitive_landscape,
                  tam: ideaResult.scoring_breakdown.tam,
                },
              })
              .select()
              .single();

            if (ideaError) {
              errors.push(`Failed to insert idea for post ${post.id}: ${ideaError.message}`);
            } else {
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
          }

          // Mark post as processed regardless of evaluation score (idempotency)
          const { error: updateError } = await supabase
            .from("reddit_posts")
            .update({ processed_at: new Date().toISOString() })
            .eq("id", post.id);

          if (updateError) {
            errors.push(`Failed to mark post ${post.id} as processed: ${updateError.message}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push(`Error processing post ${post.id}: ${errorMessage}`);

          // Still mark as processed to avoid infinite retries
          const { error: updateError } = await supabase
            .from("reddit_posts")
            .update({ processed_at: new Date().toISOString() })
            .eq("id", post.id);

          if (updateError) {
            errors.push(`Failed to mark post ${post.id} as processed after error: ${updateError.message}`);
          }
        }
      }
    }

    return {
      success: true,
      posts_processed: unprocessedPosts?.length || 0,
      ideas_generated: ideasGenerated,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

