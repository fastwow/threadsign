import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

/**
 * Server-only OpenAI client.
 * Never import or use this in client-side code.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a mock Reddit post using LLM
 * Returns raw signal data only - no scoring or evaluation
 */
export async function generateMockRedditPost(params: {
  subreddit: string;
  topic: string;
}): Promise<{
  title: string;
  body: string;
  score: number; // Raw Reddit upvote score for realism only
  num_comments: number; // Raw comment count for realism only
  permalink: string;
  reddit_post_id: string;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are generating realistic Reddit discussion posts for a subreddit about ${params.topic}. 
        Generate a post that describes a real-world problem, frustration, or need that someone might post about.
        The post should be authentic, detailed, and show genuine pain points that could inspire product ideas.
        Include realistic metadata (upvote score, comment count) for authenticity only - this is raw signal data.`,
      },
      {
        role: "user",
        content: `Generate a Reddit post for r/${params.subreddit} about ${params.topic}. 
        Include:
        - A compelling title
        - A detailed post body (2-4 paragraphs) describing a problem, frustration, or need
        - Make it realistic and authentic
        - Format the response as JSON with: title, body, score (integer 1-100, realistic upvote count), num_comments (integer 1-50, realistic comment count), permalink (e.g., "/r/startups/comments/abc123/"), reddit_post_id (random alphanumeric string)`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content);
  return {
    title: parsed.title,
    body: parsed.body || "",
    score: parseInt(parsed.score) || 0,
    num_comments: parseInt(parsed.num_comments) || 0,
    permalink: parsed.permalink,
    reddit_post_id: parsed.reddit_post_id,
  };
}

export interface IdeaGenerationResult {
  title: string;
  pitch: string;
  pain_insight: string;
  score: number; // Average of all criteria (0-100)
  scoring_breakdown: {
    pain_point_intensity: number; // 0-100
    willingness_to_pay: number; // 0-100
    competitive_landscape: number; // 0-100
    tam: number; // 0-100 (Total Addressable Market)
  };
}

/**
 * Generate a product idea from a Reddit post
 */
export async function generateIdeaFromPost(params: {
  postTitle: string;
  postBody: string;
  subreddit: string;
  promptVersion?: string;
}): Promise<IdeaGenerationResult> {
  const promptVersion = params.promptVersion || "v1";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a product strategist analyzing Reddit discussions to identify valuable product opportunities.
        Analyze the pain points described in Reddit posts and generate concise product ideas.
        
        For each idea, provide:
        1. A short, compelling product title
        2. A 1-2 sentence pitch describing the product
        3. A key pain insight extracted from the discussion
        4. A viability score from 0-100 based on four criteria (each scored 0-100 independently):
           - Pain point intensity (0-100): How severe and urgent is the problem?
           - Willingness to pay (0-100): How likely are users to pay for a solution?
           - Competitive landscape (0-100): How crowded is the market? (Higher = less crowded, better opportunity)
           - TAM (Total Addressable Market) (0-100): How large is the potential market?
        
        The final score is the simple average of all four criteria (sum / 4).
        Only generate ideas where the average score is 60 or above.`,
      },
      {
        role: "user",
        content: `Analyze this Reddit post from r/${params.subreddit}:
        
        Title: ${params.postTitle}
        
        Body: ${params.postBody}
        
        Generate a product idea in JSON format with:
        {
          "title": "Product name",
          "pitch": "1-2 sentence description",
          "pain_insight": "Key pain point extracted",
          "score": average_score_0_100 (average of all criteria),
          "scoring_breakdown": {
            "pain_point_intensity": 0-100,
            "willingness_to_pay": 0-100,
            "competitive_landscape": 0-100,
            "tam": 0-100
          }
        }
        
        Each criterion should be scored independently from 0-100.
        The score field should be the average of all four criteria.
        Only return the idea if the average score is 60 or above. If the score would be below 60, return null.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const parsed = JSON.parse(content);
  
  // Extract individual criterion scores (0-100 each)
  const painIntensity = Math.round(parsed.scoring_breakdown?.pain_point_intensity || 0);
  const willingnessToPay = Math.round(parsed.scoring_breakdown?.willingness_to_pay || 0);
  const competitiveLandscape = Math.round(parsed.scoring_breakdown?.competitive_landscape || 0);
  const tam = Math.round(parsed.scoring_breakdown?.tam || 0);
  
  // Calculate average score
  const averageScore = Math.round((painIntensity + willingnessToPay + competitiveLandscape + tam) / 4);
  
  // If score is below 60, return empty (will be discarded)
  if (parsed.score === null || averageScore < 60) {
    return {
      title: "",
      pitch: "",
      pain_insight: "",
      score: 0,
      scoring_breakdown: {
        pain_point_intensity: 0,
        willingness_to_pay: 0,
        competitive_landscape: 0,
        tam: 0,
      },
    };
  }

  return {
    title: parsed.title,
    pitch: parsed.pitch,
    pain_insight: parsed.pain_insight,
    score: averageScore,
    scoring_breakdown: {
      pain_point_intensity: painIntensity,
      willingness_to_pay: willingnessToPay,
      competitive_landscape: competitiveLandscape,
      tam: tam,
    },
  };
}

