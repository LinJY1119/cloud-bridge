import { GoogleGenAI } from "@google/genai";

async function test() {
  console.log("Before:", process.env.GEMINI_API_KEY?.substring(0, 5));
  if (process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
    delete process.env.GEMINI_API_KEY;
  }
  console.log("After:", process.env.GEMINI_API_KEY?.substring(0, 5));
  
  try {
    const ai = new GoogleGenAI();
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hi"
    });
    console.log("Success:", res.text);
  } catch (err: any) {
    console.error("Test Error:", err.message);
  }
}
test();
