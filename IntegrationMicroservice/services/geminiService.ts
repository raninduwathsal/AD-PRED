import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      video_url: { type: Type.STRING, description: "A relevant video URL, or a placeholder if not applicable." },
      question: { type: Type.STRING },
      option_1: { type: Type.STRING },
      option_2: { type: Type.STRING },
      option_3: { type: Type.STRING },
      option_4: { type: Type.STRING },
      correct_answer: { type: Type.STRING },
      chapter: { type: Type.STRING },
      difficulty: { type: Type.NUMBER },
    },
    required: ["video_url", "question", "option_1", "option_2", "option_3", "option_4", "correct_answer", "chapter", "difficulty"],
  },
};

const parseAndPrepareCards = (jsonText: string): Card[] => {
    const generatedCards = JSON.parse(jsonText);
    return generatedCards.map((card: Omit<Card, 'id'>) => ({
        ...card,
        id: crypto.randomUUID(),
    }));
};

const handleApiError = (error: unknown, context: string): never => {
    console.error(`Error ${context}:`, error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate questions. Gemini API error during ${context}: ${error.message}`);
    }
    throw new Error(`An unknown error occurred while ${context}.`);
};

const basePrompt = `
  You are an expert instructional designer creating content for a learning app like Duolingo.
  Your task is to create a series of multiple-choice questions based on the provided input.

  Follow these instructions carefully:
  1.  Generate a clear, concise question for each main concept.
  2.  Create four options (option_1, option_2, option_3, option_4). One must be the correct answer, and the others should be plausible distractors.
  3.  The 'correct_answer' field must exactly match one of the four options.
  4.  Analyze the complexity of the concept and assign a difficulty score between 0.1 (very easy) and 1.0 (very difficult).
  5.  Group the generated questions into logical 'chapters' of about 7-12 questions each. Name the chapters appropriately.
  6.  For the 'video_url', use a relevant URL if provided in the source content. Otherwise, use a placeholder like 'https://example.com/video/placeholder'.
  7.  Return the output as a JSON array of objects. Do NOT wrap the JSON in markdown backticks.

  The user has provided this SQL schema for the 'cards' table:
  CREATE TABLE cards (
      card_id INT AUTO_INCREMENT PRIMARY KEY,
      video_url VARCHAR(255) NOT NULL,
      question TEXT,
      option_1 VARCHAR(255) NOT NULL,
      option_2 VARCHAR(255) NOT NULL,
      option_3 VARCHAR(255) NOT NULL,
      option_4 VARCHAR(255) NOT NULL,
      correct_answer VARCHAR(255) NOT NULL,
      chapter VARCHAR(100) NOT NULL,
      difficulty FLOAT DEFAULT 0.5
  );
`;

export const generateQuestionsFromText = async (topic: string): Promise<Card[]> => {
  try {
    const prompt = `
      ${basePrompt}
      Please generate questions for the following topic:
      ---
      ${topic}
      ---
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema },
    });
    return parseAndPrepareCards(response.text);
  } catch (error) {
    handleApiError(error, "generating from text");
  }
};

interface FileInput {
    fileData: string; // base64 encoded
    mimeType: string;
    fileName: string;
}

export const generateQuestionsFromFile = async (fileInput: FileInput): Promise<Card[]> => {
    try {
        const prompt = `
            ${basePrompt}
            Please generate questions based on the content of the attached file: ${fileInput.fileName}.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: fileInput.mimeType,
                            data: fileInput.fileData,
                        },
                    },
                ],
            },
            config: { responseMimeType: "application/json", responseSchema },
        });
        return parseAndPrepareCards(response.text);
    } catch (error) {
        handleApiError(error, "generating from file");
    }
};
