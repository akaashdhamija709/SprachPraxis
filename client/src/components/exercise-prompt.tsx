import { Clock } from "lucide-react";
import { type Exercise } from "@shared/schema";

interface ExercisePromptProps {
  exercise: Exercise;
  timeRemaining?: string;
}

export default function ExercisePrompt({ exercise, timeRemaining = "5:00" }: ExercisePromptProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-800">Speaking Practice</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{timeRemaining}</span>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-primary p-4 rounded-r-lg">
        <h4 className="font-medium text-gray-800 mb-2">
          Exercise: {exercise.title} ({exercise.level} Level)
        </h4>
        <p className="text-gray-600 text-sm">{exercise.prompt}</p>
        <div className="mt-2 text-xs text-gray-500">
          Category: {exercise.category} • Est. duration: {Math.floor(exercise.estimatedDuration / 60)} minutes
        </div>
      </div>
    </div>
  );
}
