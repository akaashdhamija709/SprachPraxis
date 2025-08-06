import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: text("level").notNull(), // A1, A2, B1, B2, C1, C2
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull(), // e.g., "Personal Introduction", "Work & Career"
  estimatedDuration: integer("estimated_duration").notNull(), // in seconds
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const practiceSession = pgTable("practice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").references(() => exercises.id),
  userResponse: text("user_response"),
  audioUrl: text("audio_url"), // for stored audio recordings
  analysisResult: jsonb("analysis_result"), // store AI analysis
  detectedLevel: text("detected_level"),
  grammarScore: integer("grammar_score"), // 0-100
  vocabularyScore: integer("vocabulary_score"), // 0-100
  structureScore: integer("structure_score"), // 0-100
  overallScore: integer("overall_score"), // 0-100
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currentLevel: text("current_level").notNull().default("A1"),
  exercisesCompleted: integer("exercises_completed").default(0),
  totalSpeakingTime: integer("total_speaking_time").default(0), // in seconds
  streak: integer("streak").default(0), // consecutive days
  lastPracticeDate: timestamp("last_practice_date"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSession).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type PracticeSession = typeof practiceSession.$inferSelect;
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Additional types for API responses
export const grammarAnalysisSchema = z.object({
  detectedLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  grammarScore: z.number().min(0).max(100),
  vocabularyScore: z.number().min(0).max(100),
  structureScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  feedbackPoints: z.array(z.object({
    type: z.enum(["correct", "warning", "error"]),
    title: z.string(),
    description: z.string(),
    example: z.string().optional(),
  })),
  suggestions: z.array(z.string()),
});

export type GrammarAnalysis = z.infer<typeof grammarAnalysisSchema>;
