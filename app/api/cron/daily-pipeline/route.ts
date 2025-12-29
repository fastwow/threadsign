import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateRedditPosts } from "@/lib/cron/generate-reddit-posts";
import { generateIdeas } from "@/lib/cron/generate-ideas";
import { sendEmailDigests } from "@/lib/cron/send-email-digests";

/**
 * Daily Pipeline Cron Job
 * Runs once per day at 09:00 Kyiv time (06:00 UTC) via Vercel Cron (Hobby plan compatible)
 * 
 * Pipeline Steps (run in sequence):
 * 1. Generate mock Reddit posts
 * 2. Evaluate posts → generate ideas
 * 3. Send email digests to subscribers
 * 
 * All steps are idempotent and safe to re-run.
 */
export async function GET(request: Request) {
  // Verify this is a cron request
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret") || request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pipelineStartTime = Date.now();

  try {
    const supabase = createServiceClient();

    // Step 1: Generate Mock Reddit Posts
    const step1Result = await generateRedditPosts(supabase);

    // Step 2: Generate Ideas from Reddit Posts
    const step2Result = await generateIdeas(supabase);

    // Step 3: Send Email Digests to Subscribers
    const step3Result = await sendEmailDigests(supabase);

    // Return combined results
    const pipelineDuration = Date.now() - pipelineStartTime;
    const allStepsSuccessful = 
      step1Result.success &&
      step2Result.success &&
      step3Result.success;

    return NextResponse.json({
      success: allStepsSuccessful,
      message: "Daily pipeline completed",
      duration_ms: pipelineDuration,
      results: {
        step1_generate_posts: step1Result,
        step2_generate_ideas: step2Result,
        step3_send_emails: step3Result,
      },
    });
  } catch (error) {
    console.error("Error in daily pipeline:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run daily pipeline",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
