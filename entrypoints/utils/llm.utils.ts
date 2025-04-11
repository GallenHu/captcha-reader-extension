import { STORAGE_KEY } from "../constants/storage";
import { getStorage, setStorage } from "./storage.utils";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  createPartFromBase64,
  Type,
} from "@google/genai";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function predict(imgBase64: string) {
  const model = await getStorage(STORAGE_KEY.MODEL);
  const apiKey = await getStorage(STORAGE_KEY.API_KEY);
  const baseUrl = await getStorage(STORAGE_KEY.BASE_URL);
  const provider = await getStorage(STORAGE_KEY.PROVIDER);

  // if (!provider) {
  //   throw new Error("model is not set");
  // }

  if (!model) {
    throw new Error("model is not set");
  }
  if (!apiKey) {
    throw new Error("apiKey is not set");
  }
  if (!baseUrl) {
    throw new Error("baseUrl is not set");
  }

  const prompt = `图片验证码中的文字是？给出所有的3种可能，只能回复英文与数字，不要额外解释`;

  switch (provider) {
    case "gemini":
      return predictWithGemini(imgBase64, prompt);
    default:
      return predictWithOpenai(imgBase64, prompt);
  }
}

async function predictWithGemini(imgBase64: string, prompt: string) {
  const model = await getStorage(STORAGE_KEY.MODEL);
  const apiKey = await getStorage(STORAGE_KEY.API_KEY);
  const baseUrl = await getStorage(STORAGE_KEY.BASE_URL);

  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model,
    contents: [
      createUserContent([prompt, createPartFromBase64(imgBase64, "image/png")]),
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          texts: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "The text in the CAPTCHA",
              nullable: false,
            },
          },
        },
      },
    },
  });

  return response.text;
}

async function predictWithOpenai(imgBase64: string, prompt: string) {
  const model = await getStorage(STORAGE_KEY.MODEL);
  const apiKey = await getStorage(STORAGE_KEY.API_KEY);
  const baseURL = await getStorage(STORAGE_KEY.BASE_URL);

  const openai = new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
  });

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${imgBase64}`,
          },
        },
      ],
    },
  ];

  const CaptchaList = z.object({
    texts: z.array(z.string()),
  });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      response_format: zodResponseFormat(CaptchaList, "captcha_list"),
    });

    return response.choices[0]?.message.content;
  } catch (error) {
    throw error;
  }
}
