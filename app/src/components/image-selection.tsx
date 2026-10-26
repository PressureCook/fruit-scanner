"use client"

import React, { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageSelectionProps {
  onSelect: (dataUri: string) => void;
}

export const ImageSelection: React.FC<ImageSelectionProps> = ({ onSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onSelect(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        variant="outline"
        className="w-full h-14 rounded-2xl border-2 border-dashed border-primary/30 hover:bg-primary/5 hover:border-primary/50 text-muted-foreground flex items-center justify-center gap-2 text-lg font-medium"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon className="h-6 w-6 text-primary" />
        Pick from Gallery
      </Button>
    </div>
  );
};
