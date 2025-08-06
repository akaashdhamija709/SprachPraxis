import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");
  const lastProcessedIndexRef = useRef(0);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const initializeRecognition = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser");
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure for continuous listening
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE'; // German language
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      console.log('Speech recognition result event:', event.results.length, 'results');
      
      let newFinalTranscript = '';
      let interimTranscript = '';
      
      // Process only NEW results that we haven't seen before
      for (let i = lastProcessedIndexRef.current; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        console.log(`Result ${i}: "${transcriptPart}" (final: ${event.results[i].isFinal})`);
        
        if (event.results[i].isFinal) {
          newFinalTranscript += transcriptPart + ' ';
          lastProcessedIndexRef.current = i + 1;
        }
      }
      
      // Process interim results from the last final result onward
      for (let i = lastProcessedIndexRef.current; i < event.results.length; i++) {
        if (!event.results[i].isFinal) {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Add only NEW final transcript to accumulated text
      if (newFinalTranscript.trim()) {
        accumulatedTranscriptRef.current += newFinalTranscript;
        console.log('Added new final transcript:', newFinalTranscript);
        console.log('Total accumulated:', accumulatedTranscriptRef.current);
      }

      // Update display with accumulated final + current interim
      const displayTranscript = accumulatedTranscriptRef.current + interimTranscript;
      console.log('Setting transcript to:', displayTranscript);
      setTranscript(displayTranscript.trim());
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      
      // Don't treat network errors as fatal - just continue
      if (event.error === 'network' || event.error === 'no-speech') {
        return;
      }
      
      setError(`Speech recognition error: ${event.error}`);
      if (event.error !== 'aborted') {
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // If we should still be listening, restart immediately
      if (isListeningRef.current) {
        console.log('Restarting speech recognition...');
        setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.error('Error restarting recognition:', e);
              // Try again after a short delay
              setTimeout(() => {
                if (isListeningRef.current && recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (e2) {
                    console.error('Failed to restart recognition twice:', e2);
                    setIsListening(false);
                    isListeningRef.current = false;
                  }
                }
              }, 500);
            }
          }
        }, 100);
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, [isSupported]);

  useEffect(() => {
    if (isSupported) {
      recognitionRef.current = initializeRecognition();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      isListeningRef.current = false;
    };
  }, [initializeRecognition, isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) {
      return;
    }

    console.log('Starting continuous speech recognition...');
    setError(null);
    isListeningRef.current = true;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
      setError('Failed to start speech recognition');
      isListeningRef.current = false;
    }
  }, []);

  const stopListening = useCallback(() => {
    console.log('Stopping speech recognition...');
    isListeningRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    accumulatedTranscriptRef.current = "";
    lastProcessedIndexRef.current = 0;
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}