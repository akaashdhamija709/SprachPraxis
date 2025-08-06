import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star } from "lucide-react";
import AppHeader from "@/components/app-header";
import LevelSelector from "@/components/level-selector";
import ExercisePrompt from "@/components/exercise-prompt";
import RecordingInterface from "@/components/recording-interface";
import FeedbackPanel from "@/components/feedback-panel";
import { Button } from "@/components/ui/button";
import { type Exercise, type PracticeSession, type GrammarAnalysis } from "@shared/schema";

export default function PracticePage() {
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<GrammarAnalysis | null>(null);

  // Fetch exercises for selected level
  const { data: exercises, isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises/level", selectedLevel],
  });

  // Fetch recent practice sessions
  const { data: recentSessions } = useQuery<PracticeSession[]>({
    queryKey: ["/api/practice-sessions/recent"],
  });

  // Set first exercise when exercises load
  useEffect(() => {
    if (exercises && exercises.length > 0 && !currentExercise) {
      setCurrentExercise(exercises[0]);
    }
  }, [exercises, currentExercise]);

  // Reset current exercise when level changes
  useEffect(() => {
    setCurrentExercise(null);
    setCurrentAnalysis(null);
  }, [selectedLevel]);

  const handleAnalysisComplete = (analysis: GrammarAnalysis) => {
    setCurrentAnalysis(analysis);
  };

  const handleNextExercise = () => {
    if (exercises && currentExercise) {
      const currentIndex = exercises.findIndex(ex => ex.id === currentExercise.id);
      const nextIndex = (currentIndex + 1) % exercises.length;
      setCurrentExercise(exercises[nextIndex]);
      setCurrentAnalysis(null);
    }
  };

  const getExerciseSessionData = (exerciseId: string) => {
    return recentSessions?.find(session => session.exerciseId === exerciseId);
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <LevelSelector selectedLevel={selectedLevel} onLevelChange={setSelectedLevel} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Practice Panel */}
          <div className="lg:col-span-2">
            {exercisesLoading ? (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-40 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : currentExercise ? (
              <>
                <ExercisePrompt exercise={currentExercise} />
                <RecordingInterface
                  onAnalysisComplete={handleAnalysisComplete}
                  targetLevel={selectedLevel}
                  exerciseId={currentExercise.id}
                />
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
                <p className="text-gray-500">No exercises available for level {selectedLevel}</p>
              </div>
            )}
          </div>

          {/* Feedback Panel */}
          <FeedbackPanel analysis={currentAnalysis} />
        </div>

        {/* Recent Practice Sessions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-800">Recent Practice Sessions</h2>
            {exercises && currentExercise && (
              <Button 
                onClick={handleNextExercise}
                className="bg-primary hover:bg-blue-700 text-white"
              >
                Next Exercise
              </Button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSessions?.map((session, index) => {
              const exercise = exercises?.find(ex => ex.id === session.exerciseId);
              return (
                <div key={session.id || index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      session.detectedLevel === 'A1' || session.detectedLevel === 'A2' ? 'bg-green-500' :
                      session.detectedLevel === 'B1' || session.detectedLevel === 'B2' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
                      {session.detectedLevel || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(session.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    {exercise?.title || 'Unknown Exercise'}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{session.duration ? formatDuration(session.duration) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{session.overallScore || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!recentSessions || recentSessions.length === 0) && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No practice sessions yet. Complete an exercise to see your progress here!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 z-50"
        onClick={handleNextExercise}
      >
        <span className="text-xl">+</span>
      </Button>
    </div>
  );
}
