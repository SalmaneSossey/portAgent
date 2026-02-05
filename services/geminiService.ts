
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

export const extractDataFromPdf = async (base64Data: string): Promise<ExtractedData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data
          }
        },
        {
          text: `Extract the following fields from this Proforma Invoice and return them as a strict JSON object: 
          vendeur, acheteur, num_facture, date_facture (YYYY-MM-DD), devise (ISO code), 
          montant_total (float), incoterm, and items (list of description, hs_code, quantity, unit_price).`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vendeur: { type: Type.STRING },
          acheteur: { type: Type.STRING },
          num_facture: { type: Type.STRING },
          date_facture: { type: Type.STRING },
          devise: { type: Type.STRING },
          montant_total: { type: Type.NUMBER },
          incoterm: { type: Type.STRING },
          hs_code: { type: Type.STRING, description: "The main HS code for the document if available" },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                hs_code: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unit_price: { type: Type.NUMBER }
              },
              required: ["description", "hs_code", "quantity", "unit_price"]
            }
          }
        },
        required: ["vendeur", "acheteur", "num_facture", "date_facture", "montant_total", "devise", "items"]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  const data = JSON.parse(jsonStr);
  
  // Ensure hs_code exists at top level for the form if not found
  if (!data.hs_code && data.items?.length > 0) {
    data.hs_code = data.items[0].hs_code;
  }
  
  return data as ExtractedData;
};
