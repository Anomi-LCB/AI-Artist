

import { GoogleGenAI, Modality, GenerateContentResponse, Part, AspectRatio, Resolution } from "@google/genai";
import { ArtStyleId, QualityId, ImageAspectRatio } from "../types";

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

const getFriendlyBlockReason = (reason: string | undefined): string => {
    switch (reason) {
        case 'SAFETY':
            return '안전 설정에 의해 생성이 차단되었습니다. 더 안전한 프롬프트를 사용해 보세요.';
        case 'OTHER':
            return '알 수 없는 이유로 생성이 차단되었습니다. 프롬프트를 약간 수정하여 다시 시도해 보세요.';
        default:
            return `생성이 차단되었습니다 (이유: ${reason}).`;
    }
};

export const expandPrompt = async (
    userPrompt: string,
    onStatusUpdate: (message: string) => void
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    onStatusUpdate("프롬프트를 확장하는 중...");
    try {
        const expansionPrompt = `You are a creative assistant and an expert prompt engineer for an advanced AI image generation model. Your task is to take a user's core idea and expand it into a much more vivid, artistic, and detailed prompt.
- **Goal:** Enhance the original concept with rich sensory details, dynamic action, emotional depth, and a compelling atmosphere.
- **Process:** Maintain the key subject of the original prompt but build a world around it. Describe the lighting, the environment, the mood, and the specific details that will make the image come alive.
- **Output:** The final result should be a well-written, descriptive paragraph that the image generation model can easily understand and interpret to create a beautiful piece of art. It should be written in a single block of text.

# Original User Prompt:
"${userPrompt}"`;
        const expansionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: expansionPrompt,
        });
        
        const expandedText = expansionResponse.text;
        if (expandedText && expandedText.trim()) {
            return expandedText.trim();
        }
        throw new Error("Expanded prompt was empty.");
    } catch (expansionError) {
        console.warn("Prompt expansion failed:", expansionError);
        onStatusUpdate("프롬프트 확장에 실패했습니다.");
        throw expansionError;
    }
};

export const generateArt = async (
  userPrompt: string,
  baseImages: { mimeType: string; data: string }[],
  referenceImages: { mimeType: string; data: string }[],
  onStatusUpdate: (message: string) => void,
  artStyle: ArtStyleId,
  numOutputs: number,
  quality: QualityId,
  negativePrompt: string,
  imageAspectRatio: ImageAspectRatio,
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  
  try {
    const useImagenModel = baseImages.length === 0;

    onStatusUpdate(numOutputs > 1 ? `${numOutputs}개의 이미지를 생성하는 중...` : '이미지 생성 중...');

    if (useImagenModel) {
        // --- LOGIC FOR IMAGEN MODEL (text or reference images -> new image) ---
        let finalPromptText: string;
        const qualityInstruction = QUALITY_PROMPTS[quality] || '';
        let referenceImageDescription = '';

        if (referenceImages.length > 0) {
            onStatusUpdate("참고 이미지를 분석하는 중...");
            const analysisPromptText = `You are an expert art analyst. Analyze the provided image(s) with depth and nuance. Deconstruct them recursively to capture their core essence.
1. **Emotional Core & Narrative:** What is the central emotion or story being conveyed? Analyze character expressions, body language, and their interaction with the environment to understand the narrative. What is the main theme?
2. **Atmosphere & Mood:** Describe the overall atmosphere (e.g., melancholic, joyful, tense, serene). How is this mood created?
3. **Color & Light Analysis:** Analyze the color palette. What are the dominant colors, and what psychological effects do they have? How does the use of light (e.g., soft, harsh, dramatic lighting) contribute to the mood and focus?
4. **Composition & Dynamics:** Analyze the composition in detail. Where is the focal point? How do lines, shapes, and balance guide the viewer's eye and contribute to the image's energy?
5. **Synthesis:** Combine all the above analyses into a comprehensive description of the image. This description should go beyond just 'what is in the image' to capture 'what it is about' on an emotional and thematic level. This analysis will be used by another artist to recreate not just the form, but the soul of the image.`;

            const analysisResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [
                    ...referenceImages.map(image => ({ inlineData: image })),
                    { text: analysisPromptText }
                ]},
            });
            
            referenceImageDescription = analysisResponse.text;

            if (!referenceImageDescription) {
                throw new Error("참고 이미지를 분석하지 못했습니다.");
            }
            onStatusUpdate("분석을 기반으로 그림을 그리는 중...");
            finalPromptText = `${ARTIST_STYLE_PROMPT}\n${STYLE_PROMPTS[artStyle] || ''}\n\n**Based on the following analysis of a reference image, create a new illustration in your signature style:**\n"${referenceImageDescription}"\n\n**Incorporate the user's specific instructions:** "${userPrompt || 'Create an image based on the analysis.'}"\n\n**Quality Instructions:** ${qualityInstruction}`;
        } else {
            // Text prompt only
            onStatusUpdate("프롬프트를 기반으로 그림을 그리는 중...");
            finalPromptText = `${ARTIST_STYLE_PROMPT}\n${STYLE_PROMPTS[artStyle] || ''}\n\n**User's Request:** "${userPrompt}"\n\n**Quality Instructions:** ${qualityInstruction}`;
        }
        
        if (negativePrompt && negativePrompt.trim()) {
            finalPromptText += `\n\n**Negative Prompt (Crucial Exclusion):** Under no circumstances should the final image contain any of the following elements or concepts: "${negativePrompt.trim()}". The artist must strictly avoid these.`;
        }

        const generationPromises = [];
        for (let i = 0; i < numOutputs; i++) {
            generationPromises.push(
                ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: finalPromptText,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/png',
                        aspectRatio: imageAspectRatio,
                    },
                })
            );
        }

        const responses = await Promise.all(generationPromises);
        const allResults: string[] = [];

        responses.forEach(response => {
            if (!response.generatedImages || response.generatedImages.length === 0) {
                console.warn("Imagen API did not return any images for a request.");
                return;
            }
            const base64Image = response.generatedImages[0].image.imageBytes;
            if (base64Image) {
                allResults.push(base64Image);
            }
        });

        if (allResults.length === 0) {
            throw new Error("Imagen API에서 유효한 이미지를 받지 못했습니다. 모든 생성이 실패했을 수 있습니다.");
        }
        return allResults;

    } else {
        // --- LOGIC FOR GEMINI MODEL (direct image modification/remake) ---

        let finalPromptText: string;
        let finalPromptParts: Part[] = [];
        
        let aspectRatioDescription = '';
        switch(imageAspectRatio) {
            case '16:9': aspectRatioDescription = "16:9 widescreen landscape"; break;
            case '9:16': aspectRatioDescription = "9:16 tall portrait"; break;
            default: aspectRatioDescription = "1:1 square"; break;
        }
        const aspectRatioInstruction = `\n\n**MANDATORY OUTPUT FORMAT:** The final image's aspect ratio MUST BE ${aspectRatioDescription}. This is the most critical instruction. Failure to adhere to this aspect ratio will result in an incorrect output. Do not default to a square image unless specifically instructed with '1:1 square'.`;
        
        const finalArtistPrompt = ARTIST_STYLE_PROMPT + aspectRatioInstruction + (STYLE_PROMPTS[artStyle] || '');
        const qualityInstruction = QUALITY_PROMPTS[quality] || '';
        
        if (referenceImages.length > 0) {
          onStatusUpdate("이미지들을 조합하여 그림을 그리는 중...");
          finalPromptText = `${finalArtistPrompt}\n\n**Task:** Redraw the **base image(s)** (the first image(s) provided) by incorporating the style, mood, and elements from the **reference images** (all subsequent images).\n\n**User's Instructions:** "${userPrompt || 'Combine them creatively.'}"\n\n**Quality Instructions:** ${qualityInstruction}`;
          finalPromptParts.push({ text: finalPromptText });
          baseImages.forEach(img => finalPromptParts.push({ inlineData: img }));
          referenceImages.forEach(img => finalPromptParts.push({ inlineData: img }));
        } else {
          onStatusUpdate("이미지를 수정하는 중...");
          finalPromptText = `**Task:** You are an expert image editor. Edit the provided image based on the user's specific instructions. The output should be a modified version of the original image. Only if no specific edit instruction is given, redraw the image in your signature style.\n\n**Your Signature Style (use if redrawing):**\n${finalArtistPrompt}\n\n**User's Editing Instructions:** "${userPrompt}"\n\n**Quality Instructions:** ${qualityInstruction}`;
          finalPromptParts.push({ text: finalPromptText });
          baseImages.forEach(img => finalPromptParts.push({ inlineData: img }));
        }
        
        if (negativePrompt && negativePrompt.trim()) {
          const negativePromptText = `\n\n**Negative Prompt (Crucial Exclusion):** Under no circumstances should the final image contain any of the following elements or concepts: "${negativePrompt.trim()}". The artist must strictly avoid these.`;
          (finalPromptParts[0] as { text: string }).text += negativePromptText;
        }

        const generationPromises = [];
        for (let i = 0; i < numOutputs; i++) {
            generationPromises.push(
                ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: finalPromptParts },
                    config: { responseModalities: [Modality.IMAGE] },
                })
            );
        }

        const responses = await Promise.all(generationPromises);
        const allResults: string[] = [];
        let firstBlockReason: string | undefined = undefined;


        responses.forEach(response => {
            if (!response.candidates || response.candidates.length === 0) {
                const blockReason = response.promptFeedback?.blockReason;
                if (blockReason && !firstBlockReason) {
                    firstBlockReason = blockReason;
                }
                console.warn(`하나의 이미지 생성이 차단되었습니다 (이유: ${blockReason}).`);
                return;
            }

            const resultsFromCandidate = response.candidates
                .map(candidate => {
                    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
                        console.warn(`후보 생성이 중단되었습니다: ${candidate.finishReason}`);
                        return null;
                    }
                    const imagePart = candidate.content?.parts?.find(p => p.inlineData);
                    if (imagePart?.inlineData?.data) {
                        return imagePart.inlineData.data;
                    }
                    console.error("후보에서 이미지 데이터를 찾지 못했습니다:", JSON.stringify(candidate, null, 2));
                    return null;
                })
                .filter((data): data is string => data !== null);

            allResults.push(...resultsFromCandidate);
        });

        if (allResults.length === 0) {
            if (firstBlockReason) {
                throw new Error(getFriendlyBlockReason(firstBlockReason));
            }
            throw new Error("API에서 유효한 이미지를 받지 못했습니다. 모든 생성이 실패했거나 예상치 못한 응답 형식이 반환되었습니다.");
        }
        
        return allResults;
    }
  } catch (error) {
    console.error("Error generating art:", error);
     if (error instanceof Error) {
        throw new Error(`아트를 생성하지 못했습니다: ${error.message}`);
    }
    throw new Error("아트를 생성하지 못했습니다. 다시 시도해주세요.");
  }
};

export const generateVideo = async (
  prompt: string,
  referenceImages: { mimeType: string; data: string }[],
  aspectRatio: AspectRatio,
  resolution: Resolution,
  onStatusUpdate: (message: string) => void
): Promise<Blob> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    onStatusUpdate('비디오 생성을 시작합니다...');
    
    if (referenceImages.length === 0 && !prompt.trim()) {
      throw new Error("비디오를 생성하려면 참고 이미지가 최소 1개 이상 필요하거나 프롬프트가 있어야 합니다.");
    }
    
    const isMultiImageMode = referenceImages.length > 1;

    let model: string;
    let finalResolution: Resolution;
    let finalAspectRatio: AspectRatio;

    if (isMultiImageMode) {
        model = 'veo-3.1-generate-preview';
        finalResolution = '720p'; // VEO multi-image requires 720p
        finalAspectRatio = '16:9'; // VEO multi-image requires 16:9
    } else {
        model = 'veo-3.1-fast-generate-preview';
        finalResolution = resolution;
        finalAspectRatio = aspectRatio;
    }
    
    let operation;
    let requestPayload: any = {
        model: model,
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: finalResolution,
            aspectRatio: finalAspectRatio,
        }
    };

    if (referenceImages.length > 0) {
        if (isMultiImageMode) {
            requestPayload.config.referenceImages = referenceImages.map(img => ({
                image: { imageBytes: img.data, mimeType: img.mimeType },
                referenceType: 'ASSET',
            }));
        } else { // Single image mode
            requestPayload.image = {
                imageBytes: referenceImages[0].data,
                mimeType: referenceImages[0].mimeType,
            };
        }
    }

    operation = await ai.models.generateVideos(requestPayload);

    onStatusUpdate('모델이 프롬프트를 분석 중입니다...');
    
    const pollIntervals = [
      { duration: 30000, message: '장면을 구성하고 있습니다... 이 과정은 몇 분 정도 소요될 수 있습니다.' },
      { duration: 30000, message: '거의 다 됐습니다... 최종 렌더링 중입니다.' },
    ];
    let pollIndex = 0;

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
      
      // Update status message based on polling intervals
      if (pollIndex < pollIntervals.length && !operation.done) {
          onStatusUpdate(pollIntervals[pollIndex].message);
          await new Promise(resolve => setTimeout(resolve, pollIntervals[pollIndex].duration));
          pollIndex++;
      } else if (!operation.done) {
          onStatusUpdate('생성이 예상보다 오래 걸리고 있습니다...');
      }
    }
    
    onStatusUpdate('비디오를 가져오는 중...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("생성된 비디오 URI를 찾을 수 없습니다.");
    }
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY!}`);
    if (!response.ok) {
        throw new Error(`비디오 다운로드 실패: ${response.statusText}`);
    }

    return await response.blob();

  } catch (error) {
    console.error("Error generating video:", error);
    if (error instanceof Error) {
      if (error.message.includes("Requested entity was not found")) {
        throw new Error("API 키를 찾을 수 없거나 유효하지 않습니다. 다른 키를 선택해주세요.");
      }
      throw new Error(`비디오를 생성하지 못했습니다: ${error.message}`);
    }
    throw new Error("비디오를 생성하지 못했습니다. 다시 시도해주세요.");
  }
};
