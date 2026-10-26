
"use client";

/**
 * @fileOverview Core utility for handling local ONNX model inference.
 * Manages model loading, image preprocessing, and result classification
 * for fruit quality assessment.
 */

/**
 * Type definition for the fruit classification result.
 */
export type FruitClassifierOutput = {
  classification: 'healthy' | 'rotten' | 'unknown';
  fruitType: string;
  confidence: number;
};

/**
 * Mapping of model output indices to fruit types and states.
 * This corresponds exactly to the training labels of transfer_model.onnx.
 */
const LABELS = [
  { type: 'Apple', status: 'healthy' },
  { type: 'Apple', status: 'rotten' },
  { type: 'Banana', status: 'healthy' },
  { type: 'Banana', status: 'rotten' },
  { type: 'Orange', status: 'healthy' },
  { type: 'Orange', status: 'rotten' },
] as const;

let session: any = null;

/**
 * Loads the ONNX model and its associated external data file.
 * Uses manual fetching and dynamic import of ONNX runtime to avoid SSR issues.
 */
export async function loadModel() {
  if (session) return session;
  
  try {
    // Dynamically import ONNX runtime only on the client
    const ort = await import('onnxruntime-web');
    
    // Set WASM paths
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

    const modelResponse = await fetch('/transfer_model.onnx');
    if (!modelResponse.ok) throw new Error("Could not fetch transfer_model.onnx");
    const modelBuffer = await modelResponse.arrayBuffer();

    const dataResponse = await fetch('/transfer_model.onnx.data');
    if (!dataResponse.ok) throw new Error("Could not fetch transfer_model.onnx.data");
    const dataBuffer = await dataResponse.arrayBuffer();

    session = await ort.InferenceSession.create(new Uint8Array(modelBuffer), {
      executionProviders: ['wasm'],
      externalData: [
        {
          data: new Uint8Array(dataBuffer),
          path: 'transfer_model.onnx.data',
        },
      ],
    });
    
    return session;
  } catch (e) {
    console.error("ONNX Load Error:", e);
    return null;
  }
}

/**
 * Normalizes raw output logits using Softmax function.
 */
function softmax(logits: Float32Array): Float32Array {
  const maxLogit = Math.max(...Array.from(logits));
  const scores = logits.map(l => Math.exp(l - maxLogit));
  const sum = scores.reduce((a, b) => a + b, 0);
  return scores.map(s => s / sum);
}

/**
 * Performs fruit classification on an image data URI using the loaded ONNX model.
 */
export async function classifyFruitWithONNX(dataUri: string): Promise<FruitClassifierOutput> {
  const sess = await loadModel();
  
  if (!sess) {
    return {
      classification: 'unknown',
      fruitType: 'unsupported',
      confidence: 0
    };
  }

  try {
    const ort = await import('onnxruntime-web');
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUri;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas initialization failed");
    
    ctx.drawImage(image, 0, 0, 224, 224);
    const imageData = ctx.getImageData(0, 0, 224, 224);
    const { data } = imageData;
    
    const floatData = new Float32Array(3 * 224 * 224);
    
    // ImageNet Normalization Constants
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let i = 0; i < 224 * 224; i++) {
      const r = data[i * 4] / 255.0;
      const g = data[i * 4 + 1] / 255.0;
      const b = data[i * 4 + 2] / 255.0;

      floatData[i] = (r - mean[0]) / std[0];
      floatData[i + 224 * 224] = (g - mean[1]) / std[1];
      floatData[i + 2 * 224 * 224] = (b - mean[2]) / std[2];
    }

    const tensor = new ort.Tensor('float32', floatData, [1, 3, 224, 224]);
    const feeds: Record<string, any> = {};
    feeds[sess.inputNames[0]] = tensor;
    
    const results = await sess.run(feeds);
    const rawOutput = results[sess.outputNames[0]].data as Float32Array;
    
    const output = Array.from(rawOutput).some(v => v > 1 || v < 0) 
      ? softmax(rawOutput) 
      : rawOutput;
    
    let maxIdx = 0;
    let maxConf = -Infinity;
    for (let i = 0; i < output.length; i++) {
      if (output[i] > maxConf) {
        maxConf = output[i];
        maxIdx = i;
      }
    }

    if (maxIdx >= LABELS.length || maxConf < 0.5) {
      return {
        classification: 'unknown',
        fruitType: 'unsupported',
        confidence: Math.max(0, maxConf)
      };
    }
    
    const label = LABELS[maxIdx];
    return {
      classification: label.status as any,
      fruitType: label.type,
      confidence: maxConf
    };
  } catch (err) {
    console.error("Inference Error:", err);
    return {
      classification: 'unknown',
      fruitType: 'unsupported',
      confidence: 0
    };
  }
}
