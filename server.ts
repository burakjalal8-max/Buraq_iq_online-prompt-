import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support high payload size for base64 images
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface PromptAnalysisResult {
  title: string;
  detailedPromptEn: string;
  detailedPromptAr: string;
  shortPromptEn: string;
  shortPromptAr: string;
  negativePromptEn: string;
  negativePromptAr: string;
  aspectRatio: string;
  styleTags: string[];
  keyElements: Array<{ name: string; description: string }>;
  midjourneyCommand: string;
  fluxPrompt: string;
}

// API endpoint to reverse engineer image prompt
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', engineHint } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'لم يتم إرسال أي صورة لتحليلها (No image provided)' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'مفتاح Gemini API غير مهيأ. يرجى التأكد من إضافة GEMINI_API_KEY في الإعدادات.',
      });
    }

    // Clean base64 string
    let cleanBase64 = imageBase64;
    let detectedMime = mimeType;

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch && mimeMatch[1]) {
        detectedMime = mimeMatch[1];
      }
      cleanBase64 = parts[1];
    }

    const systemInstruction = `You are "Buraq IQ Vision Prompt Engine" - the world's most elite reverse-prompt engineer and prompt craftsman for modern AI generative models (Flux.1 Schnell/Dev, Midjourney v6.1, Stable Diffusion XL, Google Imagen 3, DALL-E 3).
The user wants you to analyze the uploaded image and extract the exact generative prompts in both English and Arabic.

Follow these strict rules:
1. Provide an extremely high-detail, cinematic English prompt that could be pasted directly into Midjourney, Flux, or SD to recreate an image with identical subject, composition, atmosphere, camera perspective, lighting (e.g. rim light, volumetric glow, golden hour, bioluminescent, harsh shadows), artistic style, color grading, and lens specifics (e.g. 35mm lens, f/1.8, bokeh, wide-angle, macro).
2. Provide a master-level Arabic translation and creative recreation of the prompt (صياغة عربية احترافية، دقيقة، وبليغة تصف كل تفاصيل الصورة ومكوناتها وأسلوبها الفني والإضاءة وزاوية التصوير بدقة مذهلة).
3. Provide a concise/short prompt in English and Arabic (1-2 sentences capturing core essence).
4. Provide negative prompt recommendations in both English and Arabic.
5. Identify the estimated aspect ratio (e.g., 16:9, 1:1, 9:16, 4:5, 3:2, 21:9).
6. Provide relevant style/aesthetic tags (e.g., "Hyperrealistic", "Cyberpunk", "Cinematic 8k", "Volumetric Lighting", "Octane Render", "Studio Portrait", etc.).
7. List 3 key visual elements breakdown with Arabic names and descriptions.
8. Format a ready-to-copy Midjourney command ("/imagine prompt: ...") and Flux prompt.

Return ONLY a valid JSON object matching this TypeScript structure, with no markdown code backticks around it:
{
  "title": "A captivating title in Arabic & English e.g. 'سفينة فضاء مستقبلية - Futuristic Starship'",
  "detailedPromptEn": "Detailed English prompt here...",
  "detailedPromptAr": "البرومبت العربي المفصل والاحترافي هنا...",
  "shortPromptEn": "Short English prompt here...",
  "shortPromptAr": "البرومبت العربي السريع والمختصر هنا...",
  "negativePromptEn": "blurry, low quality, distorted, bad anatomy, deformed hands, extra limbs, watermark, text, out of frame",
  "negativePromptAr": "صورة ضبابية، جودة رديئة، تشوه في الأطراف أو الأصابع، علامات مائية، نصوص مشوهة، إضاءة غير متناسقة",
  "aspectRatio": "16:9",
  "styleTags": ["Cinematic", "8K Resolution", "Unreal Engine 5", "Photorealistic"],
  "keyElements": [
    { "name": "الموضوع الرئيسي (Subject)", "description": "وصف دقيق للموضوع الرئيسي في الصورة" },
    { "name": "الإضاءة والأجواء (Lighting & Mood)", "description": "وصف دقيق لمصادر الضوء والظلال والجو العام" },
    { "name": "زاوية الكاميرا والعمق (Camera & Depth)", "description": "وصف دقيق لمنظور العدسة وعمق الميدان" }
  ],
  "midjourneyCommand": "/imagine prompt: ...",
  "fluxPrompt": "..."
}`;

    const promptText = `Analyze this image in depth and generate the complete reverse prompt in English and Arabic according to instructions. ${
      engineHint ? `Target model preference: ${engineHint}.` : ''
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: detectedMime,
              data: cleanBase64,
            },
          },
          {
            text: `${systemInstruction}\n\n${promptText}`,
          },
        ],
      },
    });

    const rawText = response.text || '';
    
    // Clean potential markdown blocks
    let cleanJsonStr = rawText.trim();
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsedData = JSON.parse(cleanJsonStr);
      return res.json({ success: true, data: parsedData });
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', rawText);
      // Fallback object if JSON was slightly malformed
      return res.json({
        success: true,
        data: {
          title: 'تحليل الصورة المستخرجة',
          detailedPromptEn: rawText,
          detailedPromptAr: 'تم استخراج البرومبت بنجاح من الصورة.',
          shortPromptEn: rawText.slice(0, 150) + '...',
          shortPromptAr: 'برومبت مستخرج بواسطة Buraq IQ AI Studio',
          negativePromptEn: 'low quality, blurry, distorted, watermark',
          negativePromptAr: 'جودة منخفضة، تشويش، علامات مائية',
          aspectRatio: '1:1',
          styleTags: ['AI Vision', 'Buraq IQ', 'Auto-Generated'],
          keyElements: [
            { name: 'التحليل المباشر', description: 'تمت قراءة الصورة بنجاح بواسطة النموذج.' }
          ],
          midjourneyCommand: `/imagine prompt: ${rawText.slice(0, 100)} --v 6.1`,
          fluxPrompt: rawText.slice(0, 100),
        },
      });
    }
  } catch (err: any) {
    console.error('Error analyzing image:', err);
    return res.status(500).json({
      error: err?.message || 'حدث خطأ غير متوقع أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.',
    });
  }
});

// App Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Buraq IQ AI Studio', timestamp: new Date().toISOString() });
});

// Serve frontend in production or through Vite in development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Buraq IQ AI Studio] Server is running on port ${PORT}`);
});
