import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeFit(imageUrl) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `Analyze this outfit image: ${imageUrl}. 
  Return JSON with top, bottom, shoes, and aesthetic.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}



