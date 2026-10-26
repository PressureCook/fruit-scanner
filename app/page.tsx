
"use client"

/**
 * @fileOverview Main application entry point for FreshScan.
 * This component manages the application state (IDLE, PROCESSING, RESULT)
 * and coordinates between the camera/gallery inputs and the ONNX neural network classifier.
 */

import React, { useState } from 'react';
import { CameraFeed } from '@/components/camera-feed';
import { ImageSelection } from '@/components/image-selection';
import { ClassificationResult } from '@/components/classification-result';
import { FruitClassifierOutput, classifyFruitWithONNX } from '../lib/onnx-classifier';
import { Loader2, Zap, BrainCircuit } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

type AppState = 'IDLE' | 'PROCESSING' | 'RESULT';

export default function FreshScan() {
  const [state, setState] = useState<AppState>('IDLE');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fruitResult, setFruitResult] = useState<FruitClassifierOutput | null>(null);
  const { toast } = useToast();

  /**
   * Handles the processing of a captured or selected image.
   * Triggers the local ONNX neural network analysis.
   */
  const handleCapture = async (dataUri: string) => {
    setCapturedImage(dataUri);
    setState('PROCESSING');
    try {
      const res = await classifyFruitWithONNX(dataUri);
      setFruitResult(res);
      setState('RESULT');
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Scan Failed",
        description: "The neural network encountered an error. Please try again.",
        variant: "destructive",
      });
      setState('IDLE');
    }
  };

  /**
   * Resets the application state to allow for a new scan.
   */
  const reset = () => {
    setState('IDLE');
    setCapturedImage(null);
    setFruitResult(null);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background safe-area-pt safe-area-pb safe-area-px">
      <header className="px-6 pt-8 pb-4 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/30">
            <Zap className="h-6 w-6 text-white fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-primary">FreshScan</h1>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Neural Network Mode</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-6">
        {state === 'IDLE' && (
          <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="bg-muted/40 p-4 rounded-2xl text-center border border-dashed border-muted-foreground/20">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                Optimized For: Apples, Oranges, Bananas<br/>
                Runs 100% locally on your device
              </p>
            </div>
            <CameraFeed onCapture={handleCapture} />
            <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">OR</span>
              </div>
            </div>
            <ImageSelection onSelect={handleCapture} />
          </div>
        )}

        {state === 'PROCESSING' && (
          <div className="flex flex-col items-center gap-8 mt-12 animate-in zoom-in-95 duration-300">
            <div className="relative">
              {capturedImage && (
                <div className="relative w-64 h-80 overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <img
                    src={capturedImage}
                    className="w-full h-full object-cover opacity-60 blur-[2px]"
                    alt="Scanning"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 p-6 rounded-full shadow-2xl backdrop-blur-sm">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-primary mb-2">Analyzing Patterns...</h3>
              <p className="text-muted-foreground font-medium">Running edge-AI inference</p>
            </div>
          </div>
        )}

        {state === 'RESULT' && capturedImage && (
          <ClassificationResult
            fruitResult={fruitResult}
            imageUrl={capturedImage}
            onReset={reset}
          />
        )}
      </div>

      {state === 'IDLE' && (
        <footer className="mt-auto py-8 text-center w-full text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-50">
          Capture item clearly • Neural precision
        </footer>
      )}

      <Toaster />
    </main>
  );
}
