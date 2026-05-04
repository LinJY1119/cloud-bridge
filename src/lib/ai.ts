export interface AIConfig {
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  model?: string;
}

export async function generateAIContent(prompt: string, config?: AIConfig): Promise<string> {
  const provider = import.meta.env.VITE_AI_PROVIDER || 'gemini';

  if (provider === 'openai') {
    return generateOpenAIContent(prompt, config);
  } else {
    return generateGeminiContent(prompt, config);
  }
}

async function generateOpenAIContent(prompt: string, config?: AIConfig): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const baseUrl = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.deepseek.com/v1';
  let model = import.meta.env.VITE_OPENAI_MODEL || 'deepseek-chat';
  
  if (config?.model && config.model.includes('gemini')) {
      // Ignore gemini models if we are forced to openai
  } else if (config?.model) {
      model = config.model;
  }

  if (!apiKey) {
    throw new Error('缺少 VITE_OPENAI_API_KEY 环境变量');
  }

  const messages = [];
  if (config?.systemInstruction) {
    messages.push({ role: 'system', content: config.systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const body: any = {
    model: model,
    messages: messages,
    temperature: config?.temperature || 0.7,
  };

  if (config?.responseMimeType === 'application/json') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} ${errorData ? JSON.stringify(errorData) : ''}`);
  }

  const data = await response.json();
  return data.choices[0].message.content || '';
}

async function generateGeminiContent(prompt: string, config?: AIConfig): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  let apiKey = '';
  try {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  } catch (e) {}
  if (!apiKey) {
    try {
      // @ts-ignore
      apiKey = process.env.GEMINI_API_KEY;
    } catch (e) {}
  }

  if (!apiKey || apiKey === 'YOUR_API_KEY' || apiKey === 'undefined') {
      throw new Error('缺少有效的 Gemini API Key。');
  }

  let baseUrl = '';
  try {
    baseUrl = import.meta.env.VITE_GEMINI_BASE_URL;
  } catch(e) {}

  const genAIConfig: any = { apiKey };
  if (baseUrl) {
    genAIConfig.baseUrl = baseUrl;
  }
  const ai = new GoogleGenAI(genAIConfig);

  const reqConfig: any = {
    temperature: config?.temperature || 0.7,
  };

  if (config?.systemInstruction) {
    reqConfig.systemInstruction = config.systemInstruction;
  }
  if (config?.responseMimeType) {
    reqConfig.responseMimeType = config.responseMimeType;
  }

  const response = await ai.models.generateContent({
    model: config?.model || "gemini-2.5-flash",
    contents: prompt,
    config: reqConfig
  });

  return response.text || '';
}
