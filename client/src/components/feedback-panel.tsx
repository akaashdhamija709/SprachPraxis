import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Star, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type GrammarAnalysis, type UserProgress } from "@shared/schema";

interface FeedbackPanelProps {
  analysis: GrammarAnalysis | null;
}

export default function FeedbackPanel({ analysis }: FeedbackPanelProps) {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const { data: userProgress } = useQuery<UserProgress>({
    queryKey: ["/api/progress"],
  });

  const getLevelColor = (level: string) => {
    const colors = {
      A1: "bg-green-500",
      A2: "bg-green-600", 
      B1: "bg-yellow-500",
      B2: "bg-orange-500",
      C1: "bg-red-500",
      C2: "bg-purple-500",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "correct":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Assessment */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Level Assessment</h3>
        
        {analysis ? (
          <>
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${getLevelColor(analysis.detectedLevel)} text-white rounded-full text-xl font-bold mb-2`}>
                {analysis.detectedLevel}
              </div>
              <p className="text-sm text-gray-600">Detected Level</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Grammar Complexity</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(analysis.grammarScore)}`}
                      style={{ width: `${analysis.grammarScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analysis.grammarScore}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vocabulary Range</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(analysis.vocabularyScore)}`}
                      style={{ width: `${analysis.vocabularyScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analysis.vocabularyScore}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sentence Structure</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getScoreColor(analysis.structureScore)}`}
                      style={{ width: `${analysis.structureScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analysis.structureScore}%</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-400">?</span>
            </div>
            <p className="text-sm">Complete an exercise to see your level assessment</p>
          </div>
        )}
      </div>

      {/* Grammar Feedback */}
      {analysis && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Grammar Analysis</h3>
          
          <div className="space-y-4">
            {analysis.feedbackPoints.map((point, index) => (
              <div key={index} className={`feedback-item ${point.type}`}>
                {getFeedbackIcon(point.type)}
                <div>
                  <p className="text-sm font-medium text-gray-800">{point.title}</p>
                  <p className="text-xs text-gray-600">{point.description}</p>
                  {point.example && (
                    <p className="text-xs text-gray-500 italic mt-1">Example: {point.example}</p>
                  )}
                </div>
              </div>
            ))}

            {analysis.feedbackPoints.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No specific feedback points available
              </p>
            )}
          </div>

          {analysis.suggestions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Suggestions for Improvement:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
            className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-sm"
          >
            {showDetailedAnalysis ? "Hide" : "View"} Detailed Analysis
          </Button>

          {showDetailedAnalysis && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Overall Score: {analysis.overallScore}%</h4>
              <p className="text-sm text-gray-600">
                Your German proficiency is assessed at {analysis.detectedLevel} level based on grammar complexity, 
                vocabulary usage, and sentence structure. Continue practicing to improve your scores!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress Tracker */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Today's Progress</h3>
        
        {userProgress ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Exercises Completed</span>
                <span className="text-sm font-medium">{userProgress.exercisesCompleted}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-primary" 
                  style={{ width: `${Math.min(100, ((userProgress.exercisesCompleted || 0) / 5) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Speaking Time</span>
                <span className="text-sm font-medium">
                  {Math.floor((userProgress.totalSpeakingTime || 0) / 60)} min
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill bg-green-500" 
                  style={{ width: `${Math.min(100, ((userProgress.totalSpeakingTime || 0) / 900) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Streak</span>
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-500">{userProgress.streak || 0} days</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Loading progress...</p>
          </div>
        )}
      </div>
    </div>
  );
}
