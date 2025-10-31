

import { GoogleGenAI, Modality, GenerateContentResponse, Part, Type, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import { ArtStyleId, QualityId, ImageAspectRatio, AspectRatio, Resolution, DecomposedImageElement } from "../types";

const ARTIST_STYLE_PROMPT = `
You are an AI artist with a very specific, consistent, and recognizable signature art style.
Your style MUST adhere to these detailed rules for every single image you create, without exception. This is your artistic identity.

**1. Core Philosophy:**
- **Inspiration:** A harmonious blend of modern digital illustration, classic Disney character appeal (pre-2000s), and the enchanting, heartfelt atmosphere of Studio Ghibli.
- **Theme:** Primarily inspired by biblical narratives and imagery, but translated into a fresh, contemporary, and universally approachable visual language.
- **Aesthetic:** Clean, clear, and focused. The art is heartfelt and approachable, never overly ornate or complex. It prioritizes emotional resonance and clarity of message.

**2. Line Art:**
- **Color:** Use a dark sepia or a very dark, warm brown for line work. Never use pure black. This gives a softer, more classic feel.
- **Quality:** Lines should be clean, with subtle variations in weight to suggest form and shadow. The line work should feel organic and hand-drawn, not perfectly uniform or sterile.
- **Style:** Expressive but controlled. Lines define the characters and key objects clearly.

**3. Coloring and Shading:**
- **Method:** Employ a soft, textured coloring style that resembles digital watercolor or colored pencil. Avoid flat, vector-like colors. There should be a subtle, visible texture in the colored areas.
- **Shading:** Use soft-cel shading. Shadows are not harsh or sharp-edged but have a gentle gradient, suggesting soft, diffused light. The shadows should use cooler, slightly desaturated versions of the base color.
- **Palette:** A vibrant but harmonious color palette. Think Ghibli's lush nature colors (deep greens, earthy browns, sky blues) mixed with the bright, clear character colors of classic Disney. The overall palette should feel warm and inviting.

**4. Lighting:**
- **Source:** The primary light source is typically soft and diffused, as if from an overcast sky or a gentle morning sun. This creates soft shadows and avoids harsh contrasts.
- **Highlights:** Use warm, creamy highlights sparingly to indicate the main light source and add a touch of magic or focus.

**5. Character Design:**
- **Features:** Characters are appealing and highly expressive. Eyes are large and emotive, conveying a wide range of feeling. Facial features are softly rounded. Proportions are slightly stylized for charm, but remain believable.
- **Emotion:** The primary goal of character design is to convey emotion and relatability. Poses and expressions should be clear and heartfelt.

**6. Backgrounds and Environments:**
- **Style:** Backgrounds are painterly and slightly impressionistic, often using a softer focus than the main characters. This ensures the characters remain the focal point.
- **Detail:** Environments should be beautiful and atmospheric but not cluttered. They support the narrative without overwhelming it. Think of Ghibli's beautiful, evocative landscapes.

**7. Final Composition & Texture:**
- **Focus:** Every composition must have a clear focal point. The viewer's eye should be immediately drawn to the most important part of the image.
- **Overall Texture:** Apply a very subtle, uniform paper or canvas texture over the entire final image. This unifies the piece and enhances the hand-crafted feel.

You are to generate images that are instantly recognizable as your work. Adhere to these principles as your unbreakable artistic code.
`;

const STYLE_PROMPTS: { [key in ArtStyleId]: string } = {
  '클래식': '', // Base style is already defined in ARTIST_STYLE_PROMPT
  '모노크롬 잉크': `
**Style Variant: Monochrome Ink**
- **Color Palette:** Strictly black and white. Use shades of dark sepia, warm grays, and cream for backgrounds. No other colors are allowed.
- **Technique:** Emphasize line art. Make it feel like an intricate ink drawing or a woodblock print. Use cross-hatching and stippling for shading instead of soft gradients. The overall mood should be more dramatic and intense.`,
  '파스텔 수채화': `
**Style Variant: Pastel Watercolor**
- **Color Palette:** Shift to a light, pastel color palette. Use soft pinks, baby blues, mint greens, and lavender. Colors should be bright, airy, and translucent.
- **Technique:** The coloring should look like a light watercolor wash. Edges should be soft, and colors might bleed into each other slightly. The line art can be a lighter shade of brown to complement the softer colors. The mood should be dreamy, gentle, and whimsical.`,
  '우키요에': `
**Style Variant: Ukiyo-e**
- **Aesthetic:** Emulate the style of Japanese Ukiyo-e woodblock prints. Use strong, defined black outlines, flat areas of color, and a limited, traditional color palette.
- **Technique:** Compositions should be asymmetrical and dynamic, often featuring motifs from nature, history, or daily life. Texture should resemble handmade paper. The mood should be stylized and dramatic.`,
  '아르누보': `
**Style Variant: Art Nouveau**
- **Aesthetic:** Adopt an Art Nouveau aesthetic, characterized by long, sinuous, organic lines and curves. Compositions should be highly decorative and ornate, often incorporating floral or plant-like motifs into the design.
- **Technique:** The color palette should be harmonious, often including muted tones with gold or silver accents. The overall feel should be elegant and flowing.`,
  '사이버펑크 글리치': `
**Style Variant: Cyberpunk Glitch**
- **Aesthetic:** Create the image in a cyberpunk glitch style. Use dark, futuristic backgrounds with vibrant neon lighting (especially pinks, blues, and purples).
- **Technique:** Incorporate digital artifacts like pixelation, scan lines, chromatic aberration, and glitch effects. Characters might have cybernetic enhancements. The mood should be gritty, high-tech, and dystopian.`
};

const QUALITY_PROMPTS: { [key in QualityId]: string } = {
  'Standard': '',
  'High': 'Create the image with intricate details, ultra-high resolution, and masterpiece quality. Pay close attention to textures, lighting, and subtle nuances to make it look stunning and professional.',
};

const DECOMPOSITION_ANALYSIS_PROMPT = `You are an expert image analyst. Your task is to identify all the distinct, primary objects or characters in the provided image.
- List the names of these objects in a JSON array of strings.
- Be concise and specific with the names (e.g., "Acoustic Guitar", "Grand Piano", "Red Drum Kit").
- The names should be in Korean.
- Do not list insignificant background elements.
- If it's a single character, list their main body parts (e.g., "Head", "Torso", "Arms", "Legs").
Example output for an image with a cat and a dog: ["고양이", "개"]
Example output for an image of a single person: ["머리", "상체", "팔", "다리"]
`;

const DECOMPOSITION_EXTRACTION_PROMPT_TEMPLATE = (objectName: string) => `
You are an expert digital restoration artist, equivalent to a world-class Photoshop professional. Your mission is to perform a flawless extraction and reconstruction of a single object from an image.

**Your ONLY target for this operation is: "${objectName}"**

**Execution Protocol:**
1.  **Flawless Isolation:** Your output MUST contain ONLY the specified "${objectName}". All other elements must be completely removed.
2.  **Background:** The isolated object must be placed on a perfectly transparent background.
3.  **Masterful Reconstruction (Top Priority):** You must meticulously reconstruct any and all parts of the "${objectName}" that are occluded, obscured, or cut off. This reconstruction must be undetectable. The restored areas must achieve a 99.99% fidelity match to the original's visible style, texture, lighting, and perspective. The final object must appear 100% complete and natural, as if it was photographed without any obstruction.
4.  **Format:** Your final output is a single image file of the perfectly restored "${objectName}".
`;

const COMPOSITION_PROMPT = `You are an elite-level visual effects (VFX) compositor, a master of digital illusion with unparalleled skill in photorealistic integration. Your mission is to composite multiple objects from separate source images into a single, flawlessly coherent, and utterly believable scene, regardless of whether you are given two images or up to twelve. You must intelligently adapt to the number of inputs to create the best possible composition.

**Your #1 PRIME DIRECTIVE, which supersedes all other considerations, is ABSOLUTE SOURCE FIDELITY.**

**Core Mandates (Non-Negotiable):**

1.  **ZERO ALTERATION OF SOURCE OBJECTS:** This is the most critical rule. The objects from the input images must be treated as immutable assets.
    *   You MUST extract them perfectly, as if using a pixel-perfect alpha mask.
    *   You MUST NOT redraw, repaint, restyle, re-texture, or in any way change the visual characteristics of the source objects. Their original pixels, colors, textures, and internal lighting are sacred.
    *   If a person is wearing a specific red shirt in an input image, they MUST be wearing that exact same red shirt in the final output. No substitutions, no stylistic interpretations.

2.  **INTELLIGENT & CONTEXT-AWARE SCENE CONSTRUCTION:**
    *   **Deep Analysis:** Your first step is to perform a deep analysis of all provided objects. Understand not just *what* they are, but their potential relationships, relative scales, and implied actions.
    *   **Dynamic Composition Strategy:** The number of input images will vary. Your strategy must adapt. For a few objects, the interaction might be direct and intimate. For many objects, you may need to create a wider scene, arranging them as a group or in a plausible environment where their co-existence makes sense.
    *   **Optimal Arrangement:** Do not settle for the first logical arrangement. Your goal is to find the **most compelling, natural, and aesthetically pleasing** composition. The final scene should tell a clear and engaging story. For example:
        *   **Inputs:** [Image of a person], [Image of a dog], [Image of a car].
        *   **Optimal Output:** A dynamic shot of the person driving the car with the dog looking excitedly out the passenger window is often more compelling than a static shot of them standing beside the car. Choose the arrangement that maximizes visual interest and narrative clarity.
        *   **Inputs:** [Image of a woman], [Image of a business suit], [Image of a laptop], [Image of a modern office chair].
        *   **Optimal Output:** The woman, professionally dressed in the suit, actively engaged with her work on the laptop while seated in the chair, creating a complete narrative of a modern professional at work.
    *   Your creative judgment is key, but it must be guided by the principles of logic, realism, and strong visual storytelling.

3.  **MASTERFUL ENVIRONMENTAL INTEGRATION:**
    *   While the source objects themselves are immutable, you MUST create a new, unifying environment for them.
    *   **Lighting & Shadows:** All objects must be re-lit to match a single, consistent light source within the new scene. This is crucial for realism. You must generate physically accurate shadows (cast shadows, contact shadows) for every object based on this new light source.
    *   **Perspective & Scale:** Ensure all objects are scaled correctly relative to each other and are placed on a consistent ground plane or environment. Their perspectives must align.
    *   **Atmosphere & Color Grading:** Create a background and atmosphere (indoor, outdoor, day, night) that complements the objects. Apply a final color grade to the entire image to unify all elements and create a cinematic, photorealistic look.

4.  **OUTPUT REQUIREMENTS:**
    *   The final output must be a single, high-resolution, photorealistic image.
    *   The result should be so seamless that it's impossible to tell it was composited from multiple sources.

**Summary of your task:** Act as a world-class compositor. Take these exact objects. Do not change them. Intelligently analyze their relationships and the number of inputs to construct the most plausible and visually stunning scene possible. The realism of the integration is paramount.
`;


const getFriendlyBlockReason = (reason: string | undefined): string => {
    switch (reason) {
        case 'SAFETY':
            return '안전 설정에 의해 생성이 차단되었습니다. 더 안전한 프롬프트를 사용해 보세요.';
        case 'OTHER':
            return '알 수 없는 이유로 생성이 차단되었습니다. 프롬프트를 수정해 보세요.';
        default:
            return `생성이 차단되었습니다. 이유: ${reason || '알 수 없음'}`;
    }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to handle response and errors for image generation
const handleGenerateContentResponse = async (responsePromise: Promise<GenerateContentResponse>): Promise<string[]> => {
    const response = await responsePromise;

    if (response.candidates && response.candidates.length > 0) {
        const images: string[] = [];
        for (const candidate of response.candidates) {
            if (candidate.finishReason && candidate.finishReason !== 'STOP') {
                throw new Error(getFriendlyBlockReason(candidate.finishReason));
            }
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData) {
                        images.push(part.inlineData.data);
                    }
                }
            }
        }
        if (images.length > 0) {
            return images;
        }
    }
    
    if (response.promptFeedback?.blockReason) {
        throw new Error(getFriendlyBlockReason(response.promptFeedback.blockReason));
    }

    throw new Error('API에서 이미지를 반환하지 않았습니다. 프롬프트를 수정하거나 다시 시도해 주세요.');
};

export const expandPrompt = async (
  prompt: string,
  setLoadingMessage: (message: string) => void
): Promise<string> => {
  setLoadingMessage('프롬프트를 확장하고 있습니다...');
  try {
    const model = 'gemini-2.5-flash';
    const fullPrompt = `You are a creative assistant. Expand the following user prompt into a more detailed and imaginative one for an AI image generator. The expanded prompt should be in Korean.
User prompt: "${prompt}"
Expanded prompt:`;

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });
    
    const expandedPrompt = response.text.trim();
    if (!expandedPrompt) {
        throw new Error("Failed to expand prompt.");
    }
    return expandedPrompt;
  } catch (error: any) {
    console.error("Error expanding prompt:", error);
    return prompt;
  }
};

export const generateArt = async (
  prompt: string,
  baseImages: { mimeType: string; data: string }[],
  referenceImages: { mimeType: string; data: string }[],
  setLoadingMessage: (message: string) => void,
  artStyle: ArtStyleId,
  numOutputs: number,
  quality: QualityId,
  negativePrompt: string,
  imageAspectRatio: ImageAspectRatio,
): Promise<string[]> => {
    setLoadingMessage('아티스트가 붓을 들었습니다...');

    const systemInstruction = ARTIST_STYLE_PROMPT + STYLE_PROMPTS[artStyle] + QUALITY_PROMPTS[quality];

    let fullPrompt = prompt;
    if (negativePrompt) {
        fullPrompt += `\n\n[Negative Prompt]: ${negativePrompt}`;
    }

    const parts: Part[] = [];

    baseImages.forEach(img => {
        parts.push({
            inlineData: {
                mimeType: img.mimeType,
                data: img.data,
            },
        });
    });

    referenceImages.forEach(img => {
        parts.push({
            inlineData: {
                mimeType: img.mimeType,
                data: img.data,
            },
        });
    });

    parts.push({ text: fullPrompt });

    try {
        setLoadingMessage('영감을 불어넣고 있습니다...');
        
        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                systemInstruction,
                responseModalities: [Modality.IMAGE],
                // The API does not have `numberOfImages` for this model, but we request multiple images via the UI.
                // We will rely on the model to potentially return multiple images if the feature is supported implicitly. The UI handles multiple results.
            },
        });
        
        setLoadingMessage('마무리 터치 중...');

        return await handleGenerateContentResponse(responsePromise);
    } catch (error: any) {
        console.error("Error generating art:", error);
        throw new Error(error.message || '이미지 생성 중 오류가 발생했습니다.');
    }
};

export const decomposeImage = async (
    baseImage: { mimeType: string; data: string },
    setLoadingMessage: (message: string) => void
): Promise<DecomposedImageElement[]> => {
    // 1. Analysis Step
    setLoadingMessage('객체 식별 중...');
    let objectNames: string[] = [];
    try {
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { inlineData: { mimeType: baseImage.mimeType, data: baseImage.data } },
                    { text: "Identify the objects in this image as per the system instructions." }
                ]
            },
            config: {
                systemInstruction: DECOMPOSITION_ANALYSIS_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const jsonText = analysisResponse.text.trim();
        objectNames = JSON.parse(jsonText);
        
        if (!Array.isArray(objectNames) || objectNames.length === 0) {
            throw new Error("이미지에서 분해할 객체를 식별하지 못했습니다.");
        }
    } catch (error: any) {
        console.error("Error identifying objects for decomposition:", error);
        throw new Error("객체 식별 단계에서 오류가 발생했습니다. 이미지가 너무 복잡하거나 지원되지 않는 형식일 수 있습니다.");
    }
    
    // 2. Extraction Step
    const decomposedElements: DecomposedImageElement[] = [];
    for (let i = 0; i < objectNames.length; i++) {
        const name = objectNames[i];
        setLoadingMessage(`${i + 1}/${objectNames.length}: '${name}' 분해 중...`);

        try {
            const extractionPrompt = DECOMPOSITION_EXTRACTION_PROMPT_TEMPLATE(name);
            const parts: Part[] = [
                { inlineData: { mimeType: baseImage.mimeType, data: baseImage.data } },
                { text: `Isolate the "${name}" from this image.` }
            ];

            const responsePromise = ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    systemInstruction: extractionPrompt,
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const images = await handleGenerateContentResponse(responsePromise);
            if (images.length > 0) {
                decomposedElements.push({
                    name: name,
                    base64: images[0]
                });
            } else {
                 console.warn(`Could not extract '${name}'. The model did not return an image.`);
            }

        } catch (error: any) {
            console.error(`Error decomposing object '${name}':`, error);
        }
    }
    
    if (decomposedElements.length === 0) {
        throw new Error("모든 객체를 분해하는 데 실패했습니다. 다른 이미지를 시도해 보세요.");
    }

    return decomposedElements;
};

export const generateVideo = async (
  prompt: string,
  referenceImages: { mimeType: string, data: string }[],
  aspectRatio: AspectRatio,
  resolution: Resolution,
  setLoadingMessage: (message: string) => void,
): Promise<Blob> => {
    
    let aiForVideo: GoogleGenAI;
    try {
        aiForVideo = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    } catch(e) {
        throw new Error("API 키를 초기화하는 중 오류가 발생했습니다.");
    }

    setLoadingMessage('비디오 시나리오를 구성 중입니다...');

    const isMultiImage = referenceImages.length > 1;
    const model = isMultiImage ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';

    let operation;
    try {
        if (isMultiImage) {
            const referenceImagesPayload: VideoGenerationReferenceImage[] = referenceImages.map(img => ({
                image: {
                    imageBytes: img.data,
                    mimeType: img.mimeType,
                },
                referenceType: VideoGenerationReferenceType.ASSET,
            }));
            
            operation = await aiForVideo.models.generateVideos({
                model: model,
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    referenceImages: referenceImagesPayload,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });
        } else if (referenceImages.length === 1) {
             operation = await aiForVideo.models.generateVideos({
                model: model,
                prompt: prompt,
                image: {
                    imageBytes: referenceImages[0].data,
                    mimeType: referenceImages[0].mimeType,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: resolution,
                    aspectRatio: aspectRatio,
                }
            });
        } else {
            operation = await aiForVideo.models.generateVideos({
                model: model,
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: resolution,
                    aspectRatio: aspectRatio,
                }
            });
        }
    } catch (err: any) {
        console.error("Video generation initial request failed:", err);
        if (err.message?.includes("API key not valid") || err.message?.includes("Requested entity was not found")) {
            throw new Error("API 키가 유효하지 않거나 찾을 수 없습니다. 다른 키를 선택해주세요.");
        }
        throw new Error(err.message || '비디오 생성 요청에 실패했습니다.');
    }

    setLoadingMessage('영상을 렌더링하고 있습니다... (최대 몇 분 소요)');

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
            operation = await aiForVideo.operations.getVideosOperation({ operation: operation });
        } catch(err: any) {
            console.error("Polling video operation failed:", err);
            if (err.message?.includes("Requested entity was not found")) {
                throw new Error("API 키를 찾을 수 없습니다. 다른 키를 선택해주세요.");
            }
            throw new Error(err.message || "비디오 상태 확인 중 오류가 발생했습니다.");
        }
    }

    if (operation.error) {
        throw new Error(`비디오 생성 실패: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('생성된 비디오를 찾을 수 없습니다.');
    }
    
    setLoadingMessage('비디오를 다운로드하고 있습니다...');
    try {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY as string}`);
        if (!response.ok) {
            throw new Error(`비디오 다운로드 실패: ${response.statusText}`);
        }
        return await response.blob();
    } catch (err: any) {
        console.error("Fetching video blob failed:", err);
        throw new Error(err.message || "생성된 비디오를 가져오는 데 실패했습니다.");
    }
};

export const composeImages = async (
  baseImages: { mimeType: string; data: string }[],
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
  setLoadingMessage('이미지들을 분석하고 있습니다...');

  const parts: Part[] = baseImages.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data,
    },
  }));
  parts.push({ text: "Combine the provided images into a single, cohesive scene, following the system instructions precisely." });

  try {
    setLoadingMessage('자연스러운 장면을 구성 중입니다...');
    
    const responsePromise = ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        systemInstruction: COMPOSITION_PROMPT,
        responseModalities: [Modality.IMAGE],
      },
    });
    
    setLoadingMessage('합성된 이미지를 완성하고 있습니다...');

    return await handleGenerateContentResponse(responsePromise);
  } catch (error: any) {
    console.error("Error composing images:", error);
    throw new Error(error.message || '이미지 합성 중 오류가 발생했습니다.');
  }
};