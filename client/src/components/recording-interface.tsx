import { useState, useEffect } from "react";
import { Mic, MicOff, RotateCcw, Lightbulb, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type GrammarAnalysis } from "@shared/schema";

interface RecordingInterfaceProps {
  onAnalysisComplete: (analysis: GrammarAnalysis) => void;
  targetLevel: string;
  exerciseId?: string;
}

export default function RecordingInterface({ 
  onAnalysisComplete, 
  targetLevel,
  exerciseId 
}: RecordingInterfaceProps) {
  const [textInput, setTextInput] = useState("");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const analyzeTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/analyze", {
        text,
        targetLevel,
      });
      return response.json();
    },
    onSuccess: (analysis: GrammarAnalysis) => {
      onAnalysisComplete(analysis);
      
      // Create practice session record
      if (exerciseId) {
        createSessionMutation.mutate({
          exerciseId,
          userResponse: textInput || transcript,
          analysisResult: analysis,
          detectedLevel: analysis.detectedLevel,
          grammarScore: analysis.grammarScore,
          vocabularyScore: analysis.vocabularyScore,
          structureScore: analysis.structureScore,
          overallScore: analysis.overallScore,
          duration: recordingStartTime ? Math.floor((Date.now() - recordingStartTime) / 1000) : 0,
        });
      }
      
      toast({
        title: "Analysis Complete",
        description: `Detected level: ${analysis.detectedLevel}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze text",
        variant: "destructive",
      });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/practice-sessions", sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/practice-sessions/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
      setRecordingStartTime(null);
    } else {
      if (isSupported) {
        // Clear previous input when starting new recording
        setTextInput("");
        resetTranscript();
        startListening();
        setRecordingStartTime(Date.now());
      } else {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Please use text input instead",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyzeText = () => {
    const textToAnalyze = textInput.trim() || transcript.trim();
    
    if (!textToAnalyze) {
      toast({
        title: "No Text to Analyze",
        description: "Please record speech or enter text first",
        variant: "destructive",
      });
      return;
    }

    if (textToAnalyze.length < 10) {
      toast({
        title: "Text Too Short",
        description: "Please provide more text for meaningful analysis",
        variant: "destructive",
      });
      return;
    }

    analyzeTextMutation.mutate(textToAnalyze);
  };

  const handleTryAgain = () => {
    setTextInput("");
    resetTranscript();
    setRecordingStartTime(null);
  };

  const wordCount = (textInput || transcript).split(/\s+/).filter(word => word.length > 0).length;

  useEffect(() => {
    // Update text input with transcript only if user hasn't manually typed anything
    if (transcript && !textInput) {
      console.log('Updating text input with transcript:', transcript);
      setTextInput(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        {/* Recording Interface */}
        <div className="text-center mb-6">
          <Button
            onClick={handleToggleRecording}
            className={`recording-button ${isListening ? "active" : ""}`}
            disabled={!isSupported && !textInput}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <p className="text-sm text-gray-600 mb-2">
            {isListening ? "Recording... Click to stop" : "Click to start recording"}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isListening ? "bg-red-500 animate-pulse" : "bg-gray-300"}`}></div>
            <span>{isListening ? "Recording" : "Ready to record"}</span>
          </div>
          
          {!isSupported && (
            <p className="text-sm text-orange-600 mt-2">
              Speech recognition not supported. Please use text input below.
            </p>
          )}
        </div>

        {/* Text Input Alternative */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-800 mb-3">
            {transcript ? "Speech detected (you can edit):" : "Or type your response:"}
          </h4>
          {transcript && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-blue-800">
                <strong>Live transcript:</strong> {transcript}
              </p>
            </div>
          )}
          <Textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Hallo, ich heiße..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500">{wordCount} words</span>
            <Button
              onClick={handleAnalyzeText}
              disabled={analyzeTextMutation.isPending || (!textInput.trim() && !transcript.trim())}
              className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {analyzeTextMutation.isPending ? "Analyzing..." : "Analyze Response"}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button
          onClick={handleTryAgain}
          variant="outline"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center border border-gray-100 h-auto flex-col space-y-2"
        >
          <RotateCcw className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-gray-800">Try Again</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center border border-gray-100 h-auto flex-col space-y-2"
          onClick={() => {
            toast({
              title: "Hint",
              description: "Try using more complex sentence structures and varied vocabulary for higher CEFR levels.",
            });
          }}
        >
          <Lightbulb className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-medium text-gray-800">Get Hints</span>
        </Button>
        
        <Button
          variant="outline"
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center border border-gray-100 h-auto flex-col space-y-2"
        >
          <SkipForward className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-800">Next Exercise</span>
        </Button>
      </div>
    </div>
  );
}
