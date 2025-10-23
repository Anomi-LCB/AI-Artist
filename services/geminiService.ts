

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
**스타일 변형: 모노크롬 잉크**
- **색상 팔레트:** 엄격한 흑백. 어두운 세피아, 따뜻한 회색, 크림색 음영을 배경에 사용하세요. 다른 색상은 허용되지 않습니다.
- **기법:** 라인 아트를 강조하세요. 복잡한 잉크 드로잉이나 목판화처럼 느껴지게 만드세요. 부드러운 그라데이션 대신 크로스 해칭과 점묘법을 사용하여 음영을 표현하세요. 전반적인 분위기는 더 극적이고 강렬해야 합니다.`,
  '파스텔 수채화': `
**스타일 변형: 파스텔 수채화**
- **색상 팔레트:** 밝은 파스텔 색상 팔레트로 전환하세요. 부드러운 분홍색, 베이비 블루, 민트 그린, 라벤더를 사용하세요. 색상은 밝고, 가볍고, 반투명해야 합니다.
- **기법:** 채색은 옅은 수채화 물감처럼 보여야 합니다. 가장자리는 부드러워야 하며 색상이 서로 약간 번질 수 있습니다. 라인 아트는 더 얇고 부드러운 색상을 보완하기 위해 더 밝은 갈색 음영일 수 있습니다. 분위기는 꿈꾸는 듯하고, 부드럽고, 기발해야 합니다.`,
  '우키요에': `
**스타일 변형: 우키요에**
- **미학:** 일본 우키요에 목판화 스타일을 모방하세요. 강렬하고 검은 윤곽선, 평면적인 색상 영역, 제한된 전통적인 색상 팔레트를 사용하세요.
- **기법:** 구성은 비대칭적이고 역동적이어야 하며, 종종 자연, 역사 또는 일상 생활의 모티프를 특징으로 합니다. 질감은 수제 종이와 비슷해야 합니다. 분위기는 양식화되고 극적이어야 합니다.`,
  '아르누보': `
**스타일 변형: 아르누보**
- **미학:** 아르누보 미학을 채택하세요. 길고 구불구불한 유기적인 선과 곡선이 특징입니다. 구성은 매우 장식적이고 화려해야 하며, 종종 꽃이나 식물과 같은 모티프가 디자인에 통합됩니다.
- **기법:** 색상 팔레트는 조화로워야 하며 종종 금색 또는 은색 악센트가 있는 차분한 톤을 포함합니다. 전반적인 느낌은 우아하고 흐르는 듯해야 합니다.`,
  '사이버펑크 글리치': `
**스타일 변형: 사이버펑크 글리치**
- **미학:** 사이버펑크 글리치 스타일로 이미지를 만드세요. 생생한 네온 조명(특히 분홍색, 파란색, 보라색)이 있는 어둡고 미래적인 배경을 사용하세요.
- **기법:** 픽셀화, 스캔 라인, 색수차, 글리치 효과와 같은 디지털 아티팩트를 통합하세요. 캐릭터는 사이버네틱 강화 기능을 가질 수 있습니다. 분위기는 거칠고, 첨단 기술이며, 디스토피아적이어야 합니다.`
};

const QUALITY_PROMPTS: { [key in QualityId]: string } = {
  'Standard': '',
  'High': 'Create the image with intricate details, ultra-high resolution, and masterpiece quality. Pay close attention to textures, lighting, and subtle nuances to make it look stunning and professional.',
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
  isPromptExpansionEnabled: boolean
): Promise<string[]> => {
  // @ts-ignore
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const useImagenModel = baseImages.length === 0;

    onStatusUpdate(numOutputs > 1 ? `${numOutputs}개의 이미지를 생성하는 중...` : '이미지 생성 중...');

    if (useImagenModel) {
        // --- LOGIC FOR IMAGEN MODEL (text or reference images -> new image) ---
        
        let finalUserPrompt = userPrompt;

        if (isPromptExpansionEnabled && userPrompt.trim()) {
            onStatusUpdate("프롬프트를 확장하는 중...");
            try {
                const expansionPrompt = `당신은 AI 이미지 생성 모델을 위한 프롬프트 전문가입니다. 다음 사용자의 프롬프트를 받아서, 핵심 주제는 유지하면서도 훨씬 더 생생하고, 예술적이며, 상세한 묘사가 담긴 프롬프트로 확장해주세요. 최종 결과물은 이미지 생성 모델이 잘 이해할 수 있도록 작성되어야 합니다.\n\n# 원본 프롬프트:\n"${userPrompt}"`;
                const expansionResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: expansionPrompt,
                });
                
                const expandedText = expansionResponse.text;
                if (expandedText && expandedText.trim()) {
                    finalUserPrompt = expandedText.trim();
                }
            } catch (expansionError) {
                console.warn("Prompt expansion failed:", expansionError);
                onStatusUpdate("프롬프트 확장에 실패하여 원본으로 진행합니다.");
            }
        }


        let finalPromptText: string;
        const qualityInstruction = QUALITY_PROMPTS[quality] || '';
        let referenceImageDescription = '';

        if (referenceImages.length > 0) {
            onStatusUpdate("참고 이미지를 분석하는 중...");
            const analysisPromptText = `당신은 미술 분석 전문가입니다. 제공된 이미지를 깊이 있고 다층적으로 분석하세요. 이미지의 핵심 본질을 파악하기 위해 재귀적으로 해체해야 합니다.
1. **감정의 핵과 서사:** 이미지가 전달하려는 핵심적인 감정이나 이야기는 무엇입니까? 인물의 표정, 몸짓, 그리고 주변 환경과의 상호작용을 분석하여 서사를 파악하세요. 중심 주제는 무엇인가요?
2. **분위기와 무드:** 전체적인 분위기(예: 우울함, 기쁨, 긴장감, 평온함)를 묘사하세요. 이러한 무드는 어떻게 만들어지고 있나요?
3. **색채와 빛 분석:** 사용된 색상 팔레트를 분석하세요. 주조색은 무엇이며, 이 색들이 주는 심리적 효과는 무엇입니까? 빛의 사용(예: 부드러운, 거친, 극적인 조명)이 분위기와 초점을 만드는 데 어떻게 기여하고 있나요?
4. **구도와 역동성:** 구성을 세밀하게 분석하세요. 초점은 어디에 있습니까? 선, 형태, 균형이 감상자의 시선을 어떻게 유도하며 이미지의 에너지에 기여하나요?
5. **종합:** 위의 모든 분석을 종합하여, 이미지를 완벽하게 설명하는 글을 작성하세요. 이 설명은 단순히 이미지에 '무엇이 있는지'를 넘어, 감정적이고 주제적인 차원에서 '무엇을 표현하려 하는지'를 포착해야 합니다. 이 분석은 다른 아티스트가 이미지의 형태뿐만 아니라 그 영혼까지 재창조하는 데 사용될 것입니다.`;

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
            finalPromptText = `${ARTIST_STYLE_PROMPT}\n${STYLE_PROMPTS[artStyle] || ''}\n\n**Based on the following analysis of a reference image, create a new illustration in your signature style:**\n"${referenceImageDescription}"\n\n**Incorporate the user's specific instructions:** "${finalUserPrompt || 'Create an image based on the analysis.'}"\n\n**Quality Instructions:** ${qualityInstruction}`;
        } else {
            // Text prompt only
            onStatusUpdate("프롬프트를 기반으로 그림을 그리는 중...");
            finalPromptText = `${ARTIST_STYLE_PROMPT}\n${STYLE_PROMPTS[artStyle] || ''}\n\n**User's Request:** "${finalUserPrompt}"\n\n**Quality Instructions:** ${qualityInstruction}`;
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

        responses.forEach(response => {
            if (!response.candidates || response.candidates.length === 0) {
                const blockReason = response.promptFeedback?.blockReason;
                if (blockReason) {
                    console.warn(`하나의 이미지 생성이 차단되었습니다 (${blockReason}).`);
                } else {
                    console.warn("API에서 응답 후보를 받지 못했습니다. 요청이 차단되었을 수 있습니다.");
                }
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
): Promise<string> => {
  try {
    // @ts-ignore
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    onStatusUpdate('비디오 생성을 시작합니다...');
    
    if (referenceImages.length === 0) {
      throw new Error("비디오를 생성하려면 참고 이미지가 최소 1개 이상 필요합니다.");
    }
    
    const isMultiImageMode = referenceImages.length > 1;

    const model = isMultiImageMode ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
    const finalResolution = isMultiImageMode ? '720p' : resolution;
    const finalAspectRatio = isMultiImageMode ? '16:9' : aspectRatio;
    
    let operation;

    if (isMultiImageMode) {
      const referenceImagesPayload = referenceImages.map(img => ({
        image: {
          imageBytes: img.data,
          mimeType: img.mimeType,
        },
        referenceType: 'ASSET',
      }));

      operation = await ai.models.generateVideos({
        model: model,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          referenceImages: referenceImagesPayload,
          resolution: finalResolution,
          aspectRatio: finalAspectRatio,
        }
      });
    } else { // Single image mode
      const singleImage = referenceImages[0];
      operation = await ai.models.generateVideos({
        model: model,
        prompt: prompt,
        image: {
          imageBytes: singleImage.data,
          mimeType: singleImage.mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: finalResolution,
          aspectRatio: finalAspectRatio,
        }
      });
    }

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
    // @ts-ignore
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`비디오 다운로드 실패: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);

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