'use server';
/**
 * @fileOverview A Genkit flow for extracting data from fiscal documents.
 *
 * - extractFiscalDocumentData - A function that handles the fiscal document data extraction process.
 * - FiscalDocumentDataExtractionInput - The input type for the extractFiscalDocumentData function.
 * - FiscalDocumentDataExtractionOutput - The return type for the extractFiscalDocumentData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FiscalDocumentDataExtractionInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A fiscal document (NF-e or Declaration of Content) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FiscalDocumentDataExtractionInput = z.infer<typeof FiscalDocumentDataExtractionInputSchema>;

const FiscalDocumentDataExtractionOutputSchema = z.object({
  sender: z.object({
    name: z.string().describe('The full name of the sender.'),
    address: z.string().describe('The full address of the sender, including street, number, city, state, and zip code.'),
  }).describe('Details about the sender.'),
  recipient: z.object({
    name: z.string().describe('The full name of the recipient.'),
    address: z.string().describe('The full address of the recipient, including street, number, city, state, and zip code.'),
  }).describe('Details about the recipient.'),
  itemDescription: z.string().describe('A brief description of the items being shipped.'),
  invoiceNumber: z.string().optional().describe('The invoice number, if available.'),
  totalValue: z.string().optional().describe('The total value of the shipment, if available.'),
  documentType: z.enum(['NF-e', 'Declaration of Content', 'Other']).describe('The type of fiscal document identified.'),
});
export type FiscalDocumentDataExtractionOutput = z.infer<typeof FiscalDocumentDataExtractionOutputSchema>;

const fiscalDocumentDataExtractionPrompt = ai.definePrompt({
  name: 'fiscalDocumentDataExtractionPrompt',
  input: { schema: FiscalDocumentDataExtractionInputSchema },
  output: { schema: FiscalDocumentDataExtractionOutputSchema },
  prompt: `You are an AI assistant specialized in extracting data from fiscal documents like NF-e (Nota Fiscal Eletrônica) and Declarations of Content.
Your task is to accurately parse the provided document and extract the following information: sender's name and address, recipient's name and address, a description of the items being shipped, the invoice number (if present), the total value of the shipment (if present), and the type of document (NF-e, Declaration of Content, or Other).

Ensure the output is in the specified JSON format. If a field is not explicitly found in the document, return an empty string for string fields, or null for optional fields. Prioritize providing the most complete information possible.

Document: {{media url=documentDataUri}}`,
});

const fiscalDocumentDataExtractionFlow = ai.defineFlow(
  {
    name: 'fiscalDocumentDataExtractionFlow',
    inputSchema: FiscalDocumentDataExtractionInputSchema,
    outputSchema: FiscalDocumentDataExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await fiscalDocumentDataExtractionPrompt(input);
    return output!;
  }
);

export async function extractFiscalDocumentData(
  input: FiscalDocumentDataExtractionInput
): Promise<FiscalDocumentDataExtractionOutput> {
  return fiscalDocumentDataExtractionFlow(input);
}
