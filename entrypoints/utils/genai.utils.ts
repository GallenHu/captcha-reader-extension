import { STORAGE_KEY } from "../constants/storage";
import { getStorage, setStorage } from "../utils/storage.utils";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  createPartFromBase64,
  Type,
} from "@google/genai";

export async function predict(imgBase64: string) {
  const apiKey = await getStorage(STORAGE_KEY.API_KEY);
  const ai = new GoogleGenAI({
    apiKey,
  });
  const propmt = `图片验证码中的文字是？给出所有的3种可能，只能回复英文与数字，不要额外解释`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      createUserContent([propmt, createPartFromBase64(imgBase64, "image/png")]),
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "The text in the CAPTCHA",
          nullable: false,
        },
      },
    },
  });

  return response.text;
}
