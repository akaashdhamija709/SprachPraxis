import { Button } from "@/components/ui/button";

interface LevelSelectorProps {
  selectedLevel: string;
  onLevelChange: (level: string) => void;
}

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function LevelSelector({ selectedLevel, onLevelChange }: LevelSelectorProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-medium text-gray-800 mb-4">Select Your Target Level</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {CEFR_LEVELS.map((level) => (
          <Button
            key={level}
            variant={selectedLevel === level ? "default" : "outline"}
            className={`py-3 px-4 font-medium transition-all duration-200 ${
              selectedLevel === level
                ? "bg-primary border-primary text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
            }`}
            onClick={() => onLevelChange(level)}
          >
            {level}
          </Button>
        ))}
      </div>
    </div>
  );
}
