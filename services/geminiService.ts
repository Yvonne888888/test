import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEventDescription = async (title: string, location: string): Promise<string> => {
  if (!apiKey) return "请配置 API Key 以使用 AI 助手功能。";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `为一个标题为“${title}”，地点在“${location}”的班级聚会写一段热情、简洁的活动简介（100字以内）。包含欢迎语和期待大家参与的话术。`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 生成失败，请重试。";
  }
};

export const generateEventSuggestions = async (): Promise<string[]> => {
    if (!apiKey) return ["烧烤派对", "母校一日游", "KTV 欢唱夜"];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "生成5个适合老同学聚会的活动主题名称，简短有趣，JSON数组格式返回（纯文本数组）。",
        });
        const text = response.text || "[]";
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        return ["主题聚餐", "户外徒步", "桌游派对", "怀旧茶话会", "海边露营"];
    }
}
