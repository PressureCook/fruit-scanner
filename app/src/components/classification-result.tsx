
"use client"

import React from 'react';
import { CheckCircle2, XCircle, RotateCcw, HelpCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FruitClassifierOutput } from '@/ai/flows/ai-fruit-classifier';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ClassificationResultProps {
  fruitResult: FruitClassifierOutput | null;
  imageUrl: string;
  onReset: () => void;
}

export const ClassificationResult: React.FC<ClassificationResultProps> = ({ 
  fruitResult, 
  imageUrl, 
  onReset 
}) => {
  const confidence = fruitResult?.confidence || 0;
  const confidencePercent = Math.round(confidence * 100);

  let status: 'healthy' | 'rotten' | 'unknown' = 'unknown';
  let title = 'Unknown';
  let description = '';

  if (fruitResult) {
    status = fruitResult.classification as any;
    title = fruitResult.classification === 'unknown' ? 'Unknown / Unsupported' : fruitResult.classification;
    description = fruitResult.classification === 'unknown' 
      ? "We couldn't confidently identify this as a supported fruit (Apple, Orange, Banana) or the scan was unclear."
      : `The neural model identified this as a ${fruitResult.fruitType} in ${fruitResult.classification} condition.`;
  }

  const getThemeColor = () => {
    if (status === 'healthy') return "from-green-500/90 to-transparent";
    if (status === 'rotten') return "from-red-500/90 to-transparent";
    return "from-slate-500/90 to-transparent";
  };

  const getStatusIcon = () => {
    if (status === 'healthy') return <CheckCircle2 className="h-8 w-8 drop-shadow-md text-white" />;
    if (status === 'rotten') return <XCircle className="h-8 w-8 drop-shadow-md text-white" />;
    return <HelpCircle className="h-8 w-8 drop-shadow-md text-white" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="overflow-hidden rounded-3xl border-4 border-white shadow-2xl relative">
        <div className="relative w-full aspect-[3/4]">
          <Image
            src={imageUrl}
            alt="Scan Result"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className={cn("absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t", getThemeColor())}>
          <div className="flex items-center gap-3 text-white">
            {getStatusIcon()}
            <h2 className="text-2xl font-bold tracking-tight capitalize drop-shadow-md">
              {title}
            </h2>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Neural Confidence</span>
              <span className="text-lg font-bold text-primary">{confidencePercent}%</span>
            </div>
            <Progress 
              value={confidencePercent} 
              className={cn(
                "h-3 rounded-full",
                confidence < 0.5 ? "[&>div]:bg-orange-400" : ""
              )} 
            />
            <div className="flex gap-3 items-start">
              {status === 'unknown' && <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onReset}
        variant="secondary"
        size="lg"
        className="w-full h-14 rounded-2xl shadow-md text-lg font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
      >
        <RotateCcw className="h-5 w-5" />
        Start New Scan
      </Button>
    </div>
  );
};
