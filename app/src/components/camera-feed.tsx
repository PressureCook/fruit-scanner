
"use client"

/**
 * @fileOverview Camera interface component.
 * Provides a live video preview and capture functionality for mobile and desktop browsers.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CameraFeedProps {
  onCapture: (dataUri: string) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initializes the device camera stream.
   * Prefers the rear-facing camera ('environment') for scanning.
   */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access denied:", err);
      setError("Unable to access camera. Please check browser permissions.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  /**
   * Captures the current video frame and converts it to a base64 data URI.
   */
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        onCapture(dataUri);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      <Card className="relative overflow-hidden w-full aspect-[3/4] bg-black border-4 border-primary/20 shadow-2xl rounded-3xl">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white bg-destructive/80">
            <p className="font-semibold mb-4">{error}</p>
            <Button onClick={startCamera} variant="outline" className="text-white border-white hover:bg-white/20">
              <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </Card>

      {!error && (
        <Button
          onClick={captureFrame}
          size="lg"
          className="rounded-full w-20 h-20 shadow-xl bg-primary hover:bg-primary/90 transition-transform active:scale-90"
          aria-label="Capture photo"
        >
          <Camera className="h-10 w-10 text-white" />
        </Button>
      )}
    </div>
  );
};
