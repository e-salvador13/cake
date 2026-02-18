'use client';

import { useState, useEffect, useCallback } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Define types for Speech Recognition
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
  results: ISpeechRecognitionResultList;
  resultIndex: number;
}

interface ISpeechRecognitionResultList {
  length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): ISpeechRecognitionAlternative;
  [index: number]: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || disabled) return;

    const SpeechRecognitionCtor = 
      ((window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition || 
       (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined;
    
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported, disabled, onTranscript]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={disabled || isListening}
      className={`
        p-3 rounded-full transition-all duration-200
        ${isListening 
          ? 'bg-red-400 text-white animate-pulse scale-110' 
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:scale-105'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md
      `}
      title={isListening ? 'Listening...' : 'Add task by voice'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className="w-5 h-5"
      >
        <path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21h-3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.08A7 7 0 0 0 19 11Z" />
      </svg>
    </button>
  );
}
