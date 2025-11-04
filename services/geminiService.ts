

import { GoogleGenAI, Modality, GenerateContentResponse, Part, Type, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import { ArtStyleId, QualityId, ImageAspectRatio, AspectRatio, Resolution, DecomposedImageElement, ResizeOption, DecomposedLayer } from "../types";

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
  '클래식': `
**Style Variant: Classic (Default)**
- **Aesthetic:** This is your signature style. It blends modern digital illustration with the charm of classic Disney (pre-2000s) and the heartfelt atmosphere of Studio Ghibli.
- **Line Art:** Use clean, dark sepia (not black) lines with subtle weight variation.
- **Coloring:** Apply a soft, textured coloring that resembles digital watercolor or colored pencil. Use soft-cel shading.
- **Palette:** The color palette should be vibrant yet harmonious, warm, and inviting.
- **Goal:** Create a clean, clear, and emotionally resonant image that is instantly recognizable as your work. Adhere to all core rules of your artistic identity, especially the use of sepia line art, soft texturing, and a Ghibli/Disney-inspired aesthetic.`,
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
- **Technique:** Incorporate digital artifacts like pixelation, scan lines, chromatic aberration, and glitch effects. Characters might have cybernetic enhancements. The mood should be gritty, high-tech, and dystopian.`,
  '카툰': `
**Style Variant: Cartoon**
- **Aesthetic:** A bright, bold, and clean cartoon style reminiscent of modern American animation. Use thick, confident black outlines.
- **Technique:** Employ flat colors with minimal, hard-edged cel shading. The focus is on clarity and appeal. Characters should have exaggerated, expressive features. The mood should be fun, energetic, and playful.`
};

const QUALITY_PROMPTS: { [key in QualityId]: string } = {
  'Standard': '',
  'High': 'Create the image with intricate details, ultra-high resolution, and masterpiece quality. Pay close attention to textures, lighting, and subtle nuances to make it look stunning and professional.',
};

const DECOMPOSITION_ANALYSIS_PROMPT = `You are an expert image analyst. Your task is to identify all the distinct, primary objects or characters in the provided image.

**Core Rules:**
- List the names of these objects in a JSON array of strings.
- Be concise and specific with the names (e.g., "Acoustic Guitar", "Grand Piano", "Red Drum Kit").
- The names must be in Korean.
- Do not list insignificant background elements.
- If it's a single character, list their main body parts (e.g., "Head", "Torso", "Arms", "Legs").

**User Guidance (Highest Priority):**
- The user may provide a specific instruction. This instruction MUST be treated as a strict filter for your object selection.
- For example, if the user says "only the person", you must identify and list ONLY the person's components, ignoring all other objects.
- If the user says "exclude the background", you must identify and list everything that is NOT part of the distant background.

Example output for an image with a cat and a dog: ["고양이", "개"]
Example output for an image of a single person: ["머리", "상체", "팔", "다리"]
`;

const LAYER_DECOMPOSITION_ANALYSIS_PROMPT = `You are an expert image analyst specializing in scene deconstruction for professional graphic editors. Your task is to analyze an image and break it down into its primary, logical, and stackable layers, as if preparing it for a Photoshop project.

**Core Rules:**
1.  **Identify Logical Layers:** Analyze the image and identify the main constituent layers. Think in terms of foreground, midground, and background. Typical layers might include: "Main Character", "Secondary Character", "Foreground Object", "Midground Elements", "Background Landscape", "Sky".
2.  **Naming Convention:** Layer names MUST be in Korean. They should be concise, descriptive, and intuitive (e.g., "나무", "소녀", "배경 산", "하늘").
3.  **Output Format:** Your response MUST be a JSON object containing a single key, "layers", which is an array of strings.
4.  **Layer Order:** The array should be ordered from the **top-most layer (foreground) to the bottom-most layer (background)**. This is critical.

**User Guidance (Highest Priority):**
- If the user provides a prompt, use it as a hint to better identify or name the layers. For example, if the prompt is "A girl reading under a tree", you should prioritize identifying "소녀" and "나무" as separate key layers.

**Example Output for an image of a girl reading under a tree with mountains in the back:**
{
  "layers": ["소녀", "나무", "배경 산", "하늘"]
}
`;

const DECOMPOSITION_EXTRACTION_PROMPT_TEMPLATE = (objectName: string) => `
You are an expert digital restoration artist, equivalent to a world-class Photoshop professional. Your mission is to perform a flawless extraction and reconstruction of a single object from an image.

**Your ONLY target for this operation is: "${objectName}"**

**Execution Protocol:**
1.  **Flawless Isolation:** Your output MUST contain ONLY the specified "${objectName}". All other elements must be completely removed.
2.  **Background & Format:** The isolated object MUST be placed on a perfectly transparent background. The final output file format MUST be a PNG that correctly utilizes an alpha channel for 100% transparency. Ensure the edges are clean with no haloing or background residue.
3.  **Masterful Reconstruction (Top Priority):** You must meticulously reconstruct any and all parts of the "${objectName}" that are occluded, obscured, or cut off. This reconstruction must be undetectable. The restored areas must achieve a 99.99% fidelity match to the original's visible style, texture, lighting, and perspective. The final object must appear 100% complete and natural, as if it was photographed without any obstruction.
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
    *   **Optimal Arrangement:** Your goal is to find the **most compelling, natural, and aesthetically pleasing** composition. The final scene should tell a clear and engaging story. For example:
        *   **Inputs:** [Image of a person], [Image of a dog], [Image of a car].
        *   **Optimal Output:** A dynamic shot of the person driving the car with the dog looking excitedly out the passenger window is often more compelling than a static shot of them standing beside the car.
    *   Your creative judgment is key, but it must be guided by the principles of logic, realism, and strong visual storytelling.

3.  **MASTERFUL ENVIRONMENTAL INTEGRATION:**
    *   While the source objects themselves are immutable, you MUST create a new, unifying environment for them.
    *   **Lighting & Shadows:** All objects must be re-lit to match a single, consistent light source within the new scene. This is crucial for realism. You must generate physically accurate shadows (cast shadows, contact shadows) for every object based on this new light source.
    *   **Perspective & Scale:** Ensure all objects are scaled correctly relative to each other and are placed on a consistent ground plane or environment. Their perspectives must align.
    *   **Atmosphere & Color Grading:** Create a background and atmosphere that complements the objects. Apply a final color grade to the entire image to unify all elements and create a cinematic, photorealistic look.

**User's Specific Directive (Highest Priority):**
- You may be given an additional text prompt from the user. This directive is your **ABSOLUTE HIGHEST PRIORITY** for arranging the scene.
- If the user says "put the dog to the left of the car, on the grass", you MUST follow that instruction precisely, even if you think another arrangement is more creative. The user's text prompt is the final command.
- If no specific prompt is given, you are to use your creative judgment as described in the mandates above to create the best possible scene.

**Output Requirements:**
- The final output must be a single, high-resolution, photorealistic image.
- The result should be so seamless that it's impossible to tell it was composited from multiple sources.
`;

const INTERACTIVE_ANALYSIS_PROMPT = `You are an expert image analysis tool. The user has provided an image with a small, bright red circular marker. Your ONLY task is to identify the single, complete object or entity the marker is on.

**CRITICAL:** The red marker is ONLY a guide. Do not mention it in your response.

**Output Format:**
Your response MUST be a JSON object with a single key: "name". The value must be a concise, descriptive name for the object in Korean.

Example output:
{
  "name": "어쿠스티 기타"
}
`;

const BACKGROUND_REMOVAL_PROMPT = `You are an expert image editor specializing in background removal. Your ONLY task is to identify the primary subject(s) in the image and completely remove the background.

**CRITICAL REQUIREMENTS:**
1. The final output MUST be a single image file in PNG format that properly uses an alpha channel.
2. The background MUST be 100% perfectly transparent.
3. The subject(s) must be perfectly cut out with clean edges, leaving no residual background pixels or "halo" effects.
4. Do not alter the subject(s) themselves in any way (color, shape, etc.).
`;
const RESIZE_PROMPT_TEMPLATE = (option: ResizeOption) => {
    let instruction = '';
    switch (option) {
        case '2x':
            instruction = 'double its original resolution (2x upscale)';
            break;
        case '4x':
            instruction = 'four times its original resolution (4x upscale)';
            break;
        case 'hd':
            instruction = 'a standard HD resolution (1024 pixels on its longest side)';
            break;
        case '0.5x':
            instruction = 'half its original resolution (0.5x downscale), intelligently preserving key details';
            break;
        case '0.25x':
            instruction = 'a quarter of its original resolution (0.25x downscale), intelligently preserving key details';
            break;
    }

    return `You are an expert in AI image restoration and intelligent resizing. Your task is to re-render the provided image to ${instruction}.

**Core Rules:**
1.  **Intelligent Upscaling/Downscaling:** This is not a simple resize. You must intelligently generate new details for upscaling or preserve critical details for downscaling, ensuring consistency with the original image's style and content.
2.  **Detail & Sharpness:** Meticulously enhance details, sharpen edges without creating artifacts, and improve textures. When downscaling, consolidate details gracefully without losing the essence of the image.
3.  **Fidelity:** Preserve the original artwork's character, composition, and color fidelity perfectly.
4.  **Professional Grade:** The output must be a high-quality, professional-grade image, free of digital noise or compression artifacts.`;
};
const GENERATIVE_FILL_PROMPT_TEMPLATE = (prompt: string) => `You are a world-class digital artist and VFX expert specializing in photorealistic generative fill and inpainting. Your mission is to execute a user's text instruction to edit an image with absolute precision and undetectable realism.

**PRIME DIRECTIVE: The user's instruction is the ultimate command and must be followed literally and precisely.**

**Execution Protocol:**
1.  **Literal Interpretation:** Analyze the user's instruction: "${prompt}". Execute this command exactly as written. Do not add, remove, or interpret beyond the specified request.
2.  **Flawless Integration:** The modifications MUST be perfectly seamless. This includes:
    *   **Physics-Accurate Lighting:** The new elements must adopt the exact lighting environment of the original image, including light direction, color temperature, and softness. Cast shadows must be physically correct in terms of direction, diffusion, and contact.
    *   **Pixel-Perfect Textures:** Any generated textures must perfectly match the surrounding materials in grain, reflectivity, and detail.
    *   **Consistent Perspective:** All added or modified elements must align flawlessly with the image's existing perspective grid.
3.  **Total Preservation:** You are forbidden from altering any pixel of the image that is not directly required to fulfill the user's instruction. The integrity of the untouched areas is paramount.

Your goal is a final image where the edit is so perfect it's impossible to tell any modification occurred.`;

const COLORIZE_PROMPT = `You are a world-renowned digital restoration artist and historian, specializing in the art of photorealistic colorization. Your task is to colorize the provided black and white image with the highest degree of realism and contextual accuracy possible.

**Core Mandates:**
1.  **Deep Contextual Analysis:** Before applying any color, perform a deep analysis of the image content. Consider the era, the materials of clothing, the types of objects, and the likely time of day. Your color choices must reflect this analysis. For example, fabrics from the 1940s have different dyes and textures than modern ones.
2.  **Physics-Based Coloring:** Apply color based on the principles of light and material science. Skin tones should have subtle variations (subsurface scattering), metals should have appropriate specular highlights, and fabrics should show texture in their color.
3.  **Natural Palette:** Avoid overly saturated or cartoonish colors. Strive for a palette that is natural, authentic, and evocative of the scene's true atmosphere.
4.  **Preserve Luminance:** Do not alter the original image's brightness, contrast, or shadow structure. Your job is to add color information only, perfectly mapping it to the existing tonal values.

The final output must be a breathtakingly realistic, full-color photograph that looks as if it were originally shot in color.`;


const getFriendlyBlockReason = (reason: string | undefined): string => {
    switch (reason) {
        case 'SAFETY':
            return '안전 설정에 의해 생성이 차단되었습니다. 더 안전한 프롬프트를 사용해 보세요.';
        case 'NO_IMAGE':
            return '모델이 이미지를 생성하지 않았습니다. 프롬프트를 더 명확하게 하거나 다른 이미지를 사용해 보세요.';
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

    let textForModel = "";
    const userInstruction = prompt.trim();

    if (baseImages.length > 0) {
      if (userInstruction) {
        textForModel = `Task: You are given a base image. Your primary mission is to modify it according to the following user instruction, while strictly adhering to your signature '${artStyle}' style.
User Instruction: "${userInstruction}"`;
      } else {
        textForModel = `Task: Re-imagine the provided image completely in your signature '${artStyle}' style. You must follow the composition of the original, but reinterpret every element through the lens of your unique artistic identity.`;
      }
    } else if (referenceImages.length > 0) {
      textForModel = `CRITICAL TASK: Your absolute top priority is to maintain the identity, features, and style of the character(s) from the provided reference image(s). Place this EXACT character into a new scene based on the user's instruction below, rendered in your signature '${artStyle}' style. Do not change the character's appearance.
User Instruction: "${userInstruction}"`;
    } else {
      textForModel = userInstruction;
    }

    if (negativePrompt.trim()) {
      textForModel += `\n\n[Negative Prompt - Exclude these elements]: ${negativePrompt.trim()}`;
    }

    if (textForModel.trim()) {
      parts.push({ text: textForModel });
    }
    
    // UI should prevent this call without any content, but as a safeguard.
    if (!parts.some(p => p.text?.trim() || p.inlineData)) {
      throw new Error('프롬프트나 이미지를 제공해야 합니다.');
    }

    try {
        setLoadingMessage('영감을 불어넣고 있습니다...');
        
        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                systemInstruction,
                responseModalities: [Modality.IMAGE],
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
    prompt: string,
    setLoadingMessage: (message: string) => void
): Promise<DecomposedImageElement[]> => {
    // 1. Analysis Step
    setLoadingMessage('객체 식별 중...');
    let objectNames: string[] = [];
    try {
        let analysisUserText = "Analyze this image and identify the primary objects according to the system instructions.";
        if (prompt) {
          analysisUserText = `Prioritize object identification based on this user directive: "${prompt}"`;
        }

        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { inlineData: { mimeType: baseImage.mimeType, data: baseImage.data } },
                    { text: analysisUserText }
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

export const decomposeImageIntoLayers = async (
    baseImage: { mimeType: string; data: string },
    prompt: string,
    setLoadingMessage: (message: string) => void
): Promise<DecomposedLayer[]> => {
    // 1. Layer Analysis Step
    setLoadingMessage('레이어 구조 분석 중...');
    let layerNames: string[] = [];
    try {
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: {
                parts: [
                    { inlineData: { mimeType: baseImage.mimeType, data: baseImage.data } },
                    { text: prompt ? `User hint: "${prompt}"` : "" }
                ]
            },
            config: {
                systemInstruction: LAYER_DECOMPOSITION_ANALYSIS_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        layers: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['layers']
                }
            }
        });

        const jsonText = analysisResponse.text.trim();
        const result = JSON.parse(jsonText);
        layerNames = result.layers;
        
        if (!Array.isArray(layerNames) || layerNames.length === 0) {
            throw new Error("이미지에서 레이어를 식별하지 못했습니다.");
        }
    } catch (error: any) {
        console.error("Error identifying layers for decomposition:", error);
        throw new Error("레이어 분석 단계에서 오류가 발생했습니다.");
    }
    
    // 2. Layer Extraction Step
    const decomposedLayers: DecomposedLayer[] = [];
    for (let i = 0; i < layerNames.length; i++) {
        const name = layerNames[i];
        setLoadingMessage(`${i + 1}/${layerNames.length}: '${name}' 레이어 추출 중...`);

        try {
            const extractionPrompt = DECOMPOSITION_EXTRACTION_PROMPT_TEMPLATE(name);
            const responsePromise = ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ inlineData: baseImage }, { text: `Isolate the "${name}" from this image.` }] },
                config: {
                    systemInstruction: extractionPrompt,
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            const images = await handleGenerateContentResponse(responsePromise);
            if (images.length > 0) {
                decomposedLayers.push({
                    id: Date.now() + i,
                    name: name,
                    base64: images[0],
                    isVisible: true
                });
            } else {
                 console.warn(`Could not extract layer '${name}'. The model did not return an image.`);
            }
        } catch (error: any) {
            console.error(`Error decomposing layer '${name}':`, error);
            // Don't stop the whole process, just skip this layer
        }
    }
    
    if (decomposedLayers.length === 0) {
        throw new Error("모든 레이어를 추출하는 데 실패했습니다. 다른 이미지를 시도해 보세요.");
    }

    return decomposedLayers;
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
  prompt: string,
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
  setLoadingMessage('이미지들을 분석하고 있습니다...');

  const parts: Part[] = baseImages.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.data,
    },
  }));
  
  const userPrompt = prompt.trim() || "Task: The user has not provided a specific instruction. Your mission is to analyze all provided images and arrange them into the most logical and visually stunning single scene, following the system instructions precisely.";
  parts.push({ text: userPrompt });

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

export const extractObjectAtPoint = async (
    originalImage: { mimeType: string; data: string },
    imageWithMarker: { mimeType: string; data: string },
    setLoadingMessage: (message: string) => void
): Promise<DecomposedImageElement> => {
    // Step 1: Analyze the image with the marker to get the object's name
    setLoadingMessage('선택한 객체 분석 중...');
    let objectName = '';
    try {
        const analysisResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: imageWithMarker },
                    { text: "Identify the object at the red marker, following system instructions." }
                ]
            },
            config: {
                systemInstruction: INTERACTIVE_ANALYSIS_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                    },
                    required: ['name']
                }
            }
        });

        const jsonText = analysisResponse.text.trim();
        const result = JSON.parse(jsonText);
        objectName = result.name;
        if (!objectName || typeof objectName !== 'string' || objectName.trim() === '') {
            throw new Error("API did not return a valid object name.");
        }

    } catch (error: any) {
        console.error("Error identifying object at point:", error);
        throw new Error("선택한 지점에서 객체 이름을 식별하는 데 실패했습니다. 다른 지점을 클릭해보세요.");
    }

    // Step 2: Extract the named object from the original image (without the marker)
    setLoadingMessage(`'${objectName}' 추출 중...`);
    try {
        const extractionPrompt = DECOMPOSITION_EXTRACTION_PROMPT_TEMPLATE(objectName);
        const parts: Part[] = [
            { inlineData: originalImage },
            { text: `Isolate the "${objectName}" from this image.` }
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
            return {
                name: objectName,
                base64: images[0]
            };
        } else {
             throw new Error(`모델이 '${objectName}'에 대한 이미지를 반환하지 않았습니다.`);
        }

    } catch (error: any) {
        console.error(`Error extracting object '${objectName}':`, error);
        throw new Error(`'${objectName}' 객체를 이미지에서 추출하는 데 실패했습니다.`);
    }
};

export const removeBackground = async (
  baseImage: { mimeType: string; data: string },
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
    setLoadingMessage('배경을 제거하고 있습니다...');
    try {
        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: baseImage }] },
            config: {
                systemInstruction: BACKGROUND_REMOVAL_PROMPT,
                responseModalities: [Modality.IMAGE],
            },
        });
        return await handleGenerateContentResponse(responsePromise);
    } catch (error: any) {
        console.error("Error removing background:", error);
        throw new Error(error.message || '배경 제거 중 오류가 발생했습니다.');
    }
};

export const resizeImage = async (
  baseImage: { mimeType: string; data: string },
  option: ResizeOption,
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
    const message = {
        '2x': '해상도를 2배로 높이고 있습니다...',
        '4x': '해상도를 4배로 높이고 있습니다...',
        'hd': 'HD 해상도로 변환 중입니다...',
        '0.5x': '해상도를 0.5배로 줄이고 있습니다...',
        '0.25x': '해상도를 0.25배로 줄이고 있습니다...',
    }[option];
    setLoadingMessage(message);

    try {
        const systemInstruction = RESIZE_PROMPT_TEMPLATE(option);
        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: baseImage }] },
            config: {
                systemInstruction,
                responseModalities: [Modality.IMAGE],
            },
        });
        return await handleGenerateContentResponse(responsePromise);
    } catch (error: any) {
        console.error(`Error resizing image with option ${option}:`, error);
        throw new Error(error.message || '해상도 조절 중 오류가 발생했습니다.');
    }
};

export const generativeFill = async (
  baseImage: { mimeType: string; data: string },
  prompt: string,
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
    setLoadingMessage('이미지를 편집하고 있습니다...');
    try {
        const systemInstruction = GENERATIVE_FILL_PROMPT_TEMPLATE(prompt);
        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: baseImage }, { text: prompt }] },
            config: {
                systemInstruction,
                responseModalities: [Modality.IMAGE],
            },
        });
        return await handleGenerateContentResponse(responsePromise);
    } catch (error: any) {
        console.error("Error with generative fill:", error);
        throw new Error(error.message || '이미지 편집 중 오류가 발생했습니다.');
    }
};

export const remixImageStyle = async (
  baseImage: { mimeType: string; data: string },
  artStyle: ArtStyleId,
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
    setLoadingMessage(`이미지를 '${artStyle}' 스타일로 리믹스하고 있습니다...`);
    try {
        const systemInstruction = ARTIST_STYLE_PROMPT + STYLE_PROMPTS[artStyle];
        const userPrompt = `Task: Your task is to completely redraw the provided image, transforming it into your signature '${artStyle}' art style.
**Crucial Rules:**
1. **Preserve Everything:** You MUST faithfully preserve the original image's composition, scene, characters, objects, and their poses. Do not add, remove, or change the core elements.
2. **Total Stylistic Transformation:** This is NOT a filter. Redraw the entire image from scratch using the line art, coloring, shading, and texture defined by your '${artStyle}' style in the system instructions.
The final result should be the original scene, but as if you, the AI artist, painted it yourself.`;

        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: baseImage }, { text: userPrompt }] },
            config: {
                systemInstruction,
                responseModalities: [Modality.IMAGE],
            },
        });
        return await handleGenerateContentResponse(responsePromise);
    } catch (error: any) {
        console.error(`Error remixing image with style ${artStyle}:`, error);
        throw new Error(error.message || '스타일 리믹스 중 오류가 발생했습니다.');
    }
};

export const colorizeImage = async (
  baseImage: { mimeType: string; data: string },
  setLoadingMessage: (message: string) => void
): Promise<string[]> => {
    setLoadingMessage('이미지를 채색하고 있습니다...');
    try {
        const responsePromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: baseImage }] },
            config: {
                systemInstruction: COLORIZE_PROMPT,
                responseModalities: [Modality.IMAGE],
            },
        });
        return await handleGenerateContentResponse(responsePromise);
    } catch (error: any) {
        console.error("Error colorizing image:", error);
        throw new Error(error.message || '이미지 채색 중 오류가 발생했습니다.');
    }
};