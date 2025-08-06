import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeGermanText, generateExercisePrompt } from "./services/openai";
import { insertPracticeSessionSchema, grammarAnalysisSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Get exercises by level
  app.get("/api/exercises/level/:level", async (req, res) => {
    try {
      const { level } = req.params;
      if (!["A1", "A2", "B1", "B2", "C1", "C2"].includes(level)) {
        return res.status(400).json({ message: "Invalid CEFR level" });
      }
      
      const exercises = await storage.getExercisesByLevel(level);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Get specific exercise
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExercise(id);
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Analyze text with AI
  app.post("/api/analyze", async (req, res) => {
    try {
      const { text, targetLevel } = req.body;
      
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ message: "Text is required for analysis" });
      }

      if (text.trim().length < 10) {
        return res.status(400).json({ message: "Text too short for meaningful analysis" });
      }

      const analysis = await analyzeGermanText(text, targetLevel || "A1");
      
      // Validate the analysis result
      const validatedAnalysis = grammarAnalysisSchema.parse(analysis);
      
      res.json(validatedAnalysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze text" 
      });
    }
  });

  // Create practice session
  app.post("/api/practice-sessions", async (req, res) => {
    try {
      const sessionData = insertPracticeSessionSchema.parse(req.body);
      const session = await storage.createPracticeSession(sessionData);
      
      // Update user progress
      const currentProgress = await storage.getUserProgress();
      const exercisesCompleted = (currentProgress?.exercisesCompleted || 0) + 1;
      const totalSpeakingTime = (currentProgress?.totalSpeakingTime || 0) + (sessionData.duration || 0);
      
      await storage.updateUserProgress({
        exercisesCompleted,
        totalSpeakingTime,
        lastPracticeDate: new Date(),
      });
      
      res.json(session);
    } catch (error) {
      console.error("Create session error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create practice session" 
      });
    }
  });

  // Get recent practice sessions
  app.get("/api/practice-sessions/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const sessions = await storage.getRecentPracticeSessions(limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch practice sessions" });
    }
  });

  // Get user progress
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress();
      
      if (!progress) {
        // Create initial progress
        const initialProgress = await storage.createUserProgress({
          currentLevel: "A1",
          exercisesCompleted: 0,
          totalSpeakingTime: 0,
          streak: 0,
        });
        return res.json(initialProgress);
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Update user progress
  app.patch("/api/progress", async (req, res) => {
    try {
      const updateData = req.body;
      const progress = await storage.updateUserProgress(updateData);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Generate new exercise prompt
  app.post("/api/generate-exercise", async (req, res) => {
    try {
      const { level, category } = req.body;
      
      if (!level || !category) {
        return res.status(400).json({ message: "Level and category are required" });
      }
      
      const prompt = await generateExercisePrompt(level, category);
      res.json({ prompt });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate exercise" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
