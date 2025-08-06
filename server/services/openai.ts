import OpenAI from "openai";
import { type GrammarAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeGermanText(
  text: string, 
  targetLevel: string = "A1"
): Promise<GrammarAnalysis> {
  try {
    const prompt = `
You are a German language expert specializing in CEFR level assessment for Goethe certificate preparation. 

Analyze the following German text and provide detailed feedback:

Text to analyze: "${text}"
Target CEFR level: ${targetLevel}

Please analyze:
1. Grammar complexity and accuracy
2. Vocabulary range and appropriateness
3. Sentence structure and complexity
4. Overall CEFR level assessment (A1, A2, B1, B2, C1, C2)

Provide scores (0-100) for:
- Grammar Score
- Vocabulary Score  
- Structure Score
- Overall Score

Also provide specific feedback points categorized as:
- "correct": Things done well
- "warning": Areas for improvement
- "error": Clear mistakes that need correction

Include practical suggestions for improvement.

Respond in JSON format with this structure:
{
  "detectedLevel": "A1|A2|B1|B2|C1|C2",
  "grammarScore": number,
  "vocabularyScore": number,  
  "structureScore": number,
  "overallScore": number,
  "feedbackPoints": [
    {
      "type": "correct|warning|error",
      "title": "Brief title",
      "description": "Detailed explanation",
      "example": "Optional example"
    }
  ],
  "suggestions": ["Practical improvement suggestions"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", 
          content: "You are a German language assessment expert. Analyze text for CEFR level and provide detailed grammatical feedback in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and normalize the response
    return {
      detectedLevel: result.detectedLevel || "A1",
      grammarScore: Math.max(0, Math.min(100, result.grammarScore || 0)),
      vocabularyScore: Math.max(0, Math.min(100, result.vocabularyScore || 0)),
      structureScore: Math.max(0, Math.min(100, result.structureScore || 0)),
      overallScore: Math.max(0, Math.min(100, result.overallScore || 0)),
      feedbackPoints: result.feedbackPoints || [],
      suggestions: result.suggestions || [],
    };

  } catch (error) {
    console.error("Error analyzing German text:", error);
    throw new Error("Failed to analyze text. Please try again.");
  }
}

export async function generateExercisePrompt(level: string, category: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a German language teacher creating speaking exercises for Goethe certificate preparation."
        },
        {
          role: "user", 
          content: `Create a speaking exercise prompt in German for CEFR level ${level} on the topic of ${category}. The prompt should be appropriate for a ${level} level learner and encourage them to speak for 2-4 minutes.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Erzählen Sie etwas über sich.";
  } catch (error) {
    console.error("Error generating exercise prompt:", error);
    return "Erzählen Sie etwas über sich.";
  }
}
