
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function* streamGeminiResponse(prompt: string, useCoT: boolean) {
    const model = 'gemini-2.5-flash';
    let fullPrompt = prompt;

    if (useCoT) {
        fullPrompt = `Please think step by step before answering the following question. First, provide your detailed reasoning process. After your reasoning, clearly label the final answer with "Final Answer:".\n\nQuestion: ${prompt}`;
    }

    try {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: fullPrompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error in streamGeminiResponse:", error);
        yield "An error occurred while communicating with the Gemini API. Please check the console for details.";
    }
}


export async function generateRAGResponse(prompt: string, context: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const fullPrompt = `Based on the following context, please answer the question. If the context does not contain the answer, say that you cannot answer based on the provided information.\n\nContext:\n---\n${context}\n---\n\nQuestion: ${prompt}`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating RAG response:", error);
        return "An error occurred while generating the response.";
    }
}