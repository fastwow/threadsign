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
 */
export async function generateMockRedditPost(params: {
  subreddit: string;
  topic: string;
}): Promise<{
  title: string;
  body: string;
  score: number;
  num_comments: number;
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
        The post should be authentic, detailed, and show genuine pain points that could inspire product ideas.`,
      },
      {
        role: "user",
        content: `Generate a Reddit post for r/${params.subreddit} about ${params.topic}. 
        Include:
        - A compelling title
        - A detailed post body (2-4 paragraphs) describing a problem, frustration, or need
        - Make it realistic and authentic
        - Format the response as JSON with: title, body, score (integer 1-100), num_comments (integer 1-50), permalink (e.g., "/r/startups/comments/abc123/"), reddit_post_id (random alphanumeric string)`,
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
  score: number;
  scoring_breakdown: {
    pain_point_intensity: number;
    willingness_to_pay: number;
    competitive_landscape: number;
    tam: number;
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
        4. A viability score from 0-100 based on four criteria (each worth 25 points):
           - Pain point intensity (0-25): How severe and urgent is the problem?
           - Willingness to pay (0-25): How likely are users to pay for a solution?
           - Competitive landscape (0-25): How crowded is the market? (Higher = less crowded)
           - TAM (Total Addressable Market) (0-25): How large is the potential market?
        
        Only generate ideas that score 60 or above in total.`,
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
          "score": total_score_0_100,
          "scoring_breakdown": {
            "pain_point_intensity": 0-25,
            "willingness_to_pay": 0-25,
            "competitive_landscape": 0-25,
            "tam": 0-25
          }
        }
        
        Only return the idea if the total score is 60 or above. If the score would be below 60, return null.`,
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
  
  // If score is below 60, return null (will be discarded)
  if (parsed.score === null || parsed.score < 60) {
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
    score: Math.round(parsed.score),
    scoring_breakdown: {
      pain_point_intensity: parsed.scoring_breakdown?.pain_point_intensity || 0,
      willingness_to_pay: parsed.scoring_breakdown?.willingness_to_pay || 0,
      competitive_landscape: parsed.scoring_breakdown?.competitive_landscape || 0,
      tam: parsed.scoring_breakdown?.tam || 0,
    },
  };
}

