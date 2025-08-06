import { 
  type Exercise, 
  type InsertExercise,
  type PracticeSession,
  type InsertPracticeSession,
  type UserProgress,
  type InsertUserProgress
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExercisesByLevel(level: string): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Practice session methods
  createPracticeSession(session: InsertPracticeSession): Promise<PracticeSession>;
  getPracticeSession(id: string): Promise<PracticeSession | undefined>;
  getRecentPracticeSessions(limit?: number): Promise<PracticeSession[]>;

  // User progress methods
  getUserProgress(): Promise<UserProgress | undefined>;
  updateUserProgress(progress: Partial<InsertUserProgress>): Promise<UserProgress>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private exercises: Map<string, Exercise>;
  private practiceSessions: Map<string, PracticeSession>;
  private userProgress: UserProgress | undefined;

  constructor() {
    this.exercises = new Map();
    this.practiceSessions = new Map();
    this.userProgress = undefined;
    
    // Initialize with sample exercises
    this.initializeDefaultExercises();
  }

  private async initializeDefaultExercises() {
    const defaultExercises: InsertExercise[] = [
      {
        level: "A1",
        title: "Personal Introduction",
        prompt: "Stellen Sie sich vor und erzählen Sie über Ihre Familie, Ihren Beruf und Ihre Hobbys. Sprechen Sie etwa 2-3 Minuten.",
        category: "Personal Information",
        estimatedDuration: 180,
      },
      {
        level: "A1", 
        title: "Daily Routine",
        prompt: "Beschreiben Sie Ihren typischen Tag. Was machen Sie morgens, mittags und abends?",
        category: "Daily Life",
        estimatedDuration: 150,
      },
      {
        level: "A2",
        title: "Work & Career",
        prompt: "Erzählen Sie über Ihren Beruf oder Ihren Traumjob. Was sind Ihre Aufgaben und was gefällt Ihnen daran?",
        category: "Work & Career",
        estimatedDuration: 240,
      },
      {
        level: "A2",
        title: "Hobbies & Free Time",
        prompt: "Was machen Sie gerne in Ihrer Freizeit? Beschreiben Sie Ihre Hobbys und warum sie Ihnen Spaß machen.",
        category: "Leisure",
        estimatedDuration: 200,
      },
      {
        level: "B1",
        title: "Travel & Tourism",
        prompt: "Erzählen Sie über eine Reise, die Sie gemacht haben oder gerne machen möchten. Beschreiben Sie die Erfahrungen und Eindrücke.",
        category: "Travel",
        estimatedDuration: 300,
      },
      {
        level: "B1",
        title: "Environmental Issues",
        prompt: "Was denken Sie über Umweltprobleme? Welche Maßnahmen können wir ergreifen, um die Umwelt zu schützen?",
        category: "Environment",
        estimatedDuration: 360,
      },
      {
        level: "B2",
        title: "Technology & Society",
        prompt: "Diskutieren Sie die Auswirkungen der Technologie auf unser tägliches Leben. Was sind die Vor- und Nachteile?",
        category: "Technology",
        estimatedDuration: 400,
      },
      {
        level: "C1",
        title: "Cultural Differences",
        prompt: "Analysieren Sie kulturelle Unterschiede zwischen Ihrem Heimatland und Deutschland. Wie beeinflussen diese das Zusammenleben?",
        category: "Culture",
        estimatedDuration: 480,
      },
    ];

    for (const exercise of defaultExercises) {
      await this.createExercise(exercise);
    }
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByLevel(level: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(exercise => exercise.level === level);
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      ...insertExercise,
      id,
      createdAt: new Date(),
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async createPracticeSession(insertSession: InsertPracticeSession): Promise<PracticeSession> {
    const id = randomUUID();
    const session: PracticeSession = {
      ...insertSession,
      id,
      duration: insertSession.duration || null,
      detectedLevel: insertSession.detectedLevel || null,
      grammarScore: insertSession.grammarScore || null,
      vocabularyScore: insertSession.vocabularyScore || null,
      structureScore: insertSession.structureScore || null,
      overallScore: insertSession.overallScore || null,
      createdAt: new Date(),
    };
    this.practiceSessions.set(id, session);
    return session;
  }

  async getPracticeSession(id: string): Promise<PracticeSession | undefined> {
    return this.practiceSessions.get(id);
  }

  async getRecentPracticeSessions(limit: number = 10): Promise<PracticeSession[]> {
    const sessions = Array.from(this.practiceSessions.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
    return sessions;
  }

  async getUserProgress(): Promise<UserProgress | undefined> {
    return this.userProgress;
  }

  async updateUserProgress(progressUpdate: Partial<InsertUserProgress>): Promise<UserProgress> {
    if (!this.userProgress) {
      // Create initial progress if it doesn't exist
      const id = randomUUID();
      this.userProgress = {
        id,
        currentLevel: "A1",
        exercisesCompleted: 0,
        totalSpeakingTime: 0,
        streak: 0,
        lastPracticeDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...progressUpdate,
      };
    } else {
      this.userProgress = {
        ...this.userProgress,
        ...progressUpdate,
        updatedAt: new Date(),
      };
    }
    return this.userProgress;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = randomUUID();
    const progress: UserProgress = {
      ...insertProgress,
      id,
      currentLevel: insertProgress.currentLevel || "A1",
      exercisesCompleted: insertProgress.exercisesCompleted || null,
      totalSpeakingTime: insertProgress.totalSpeakingTime || null,
      streak: insertProgress.streak || null,
      lastPracticeDate: insertProgress.lastPracticeDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userProgress = progress;
    return progress;
  }
}

export const storage = new MemStorage();
