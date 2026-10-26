
'use server';
/**
 * @fileOverview Definition of data types for the local Fruit Classifier.
 * Note: Classification is performed locally via ONNX, these types ensure consistency.
 */

import {z} from 'genkit';

const FruitClassifierOutputSchema = z.object({
  classification: z.string().describe("The state of the fruit: 'healthy', 'rotten', or 'unknown'."),
  fruitType: z.string().describe("The type of fruit identified."),
  confidence: z.number().min(0).max(1).describe('Confidence score (0 to 1).'),
});

export type FruitClassifierOutput = z.infer<typeof FruitClassifierOutputSchema>;
