'use server';
/**
 * @fileOverview A Genkit flow for intelligent package sizing.
 *
 * - suggestPackageSize - A function that suggests the most appropriate package size (P, M, G)
 *   and highlights any potential restrictions based on a free-form text description.
 * - IntelligentPackageSizingInput - The input type for the suggestPackageSize function.
 * - IntelligentPackageSizingOutput - The return type for the suggestPackageSize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentPackageSizingInputSchema = z.object({
  packageDescription: z
    .string()
    .describe('A free-form text description of the package contents.'),
});
export type IntelligentPackageSizingInput = z.infer<
  typeof IntelligentPackageSizingInputSchema
>;

const IntelligentPackageSizingOutputSchema = z.object({
  suggestedSize: z.union([z.literal('P'), z.literal('M'), z.literal('G')]).describe('The suggested package size.'),
  restrictions: z.string().describe('Any potential restrictions for the package based on its size or content.'),
});
export type IntelligentPackageSizingOutput = z.infer<
  typeof IntelligentPackageSizingOutputSchema
>;

export async function suggestPackageSize(
  input: IntelligentPackageSizingInput
): Promise<IntelligentPackageSizingOutput> {
  return intelligentPackageSizingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentPackageSizingPrompt',
  input: {schema: IntelligentPackageSizingInputSchema},
  output: {schema: IntelligentPackageSizingOutputSchema},
  prompt: `You are an AI assistant for a logistics company called VYA. Your task is to analyze a package description and determine the most appropriate package size (P, M, or G) based on the VYA sizing guidelines.
Additionally, you should identify any potential restrictions related to the package.

Here are the VYA package sizing guidelines:
- P (Pequeno): Up to 3kg (e.g., cell phones, documents). Pricing starts at R$15.
- M (Médio): Up to 10kg (e.g., shoe boxes, bags of clothes). Pricing starts at R$25.
- G (Grande): Up to 30kg (e.g., bulky bundles). Pricing starts at R$45.

Important Restriction: Package size G cannot be transported by motorcycles.

Package Description: {{{packageDescription}}}

Based on the description, suggest the most appropriate package size and list any applicable restrictions.`,
});

const intelligentPackageSizingFlow = ai.defineFlow(
  {
    name: 'intelligentPackageSizingFlow',
    inputSchema: IntelligentPackageSizingInputSchema,
    outputSchema: IntelligentPackageSizingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
