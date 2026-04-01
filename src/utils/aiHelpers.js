import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API Key from .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * ── Generate Ultra-High Professional Prompt (15 Lines) ──────────────────────
 * Produces highly detailed prompt according to the module type.
 */
const generateProfessionalPrompt = (name, type = 'product', description = '') => {
    const basePromptChunks = [
        "Masterpiece quality, 8k resolution, ultra-detailed photography.",
        "Cinematic lighting with professional studio setup.",
        "Macro photography capturing extreme fine textures and realistic depth.",
        "Perfect color balance, high dynamic range (HDR), ray-traced reflections.",
        "Sharp focus on subject, soft dreamy bokeh in the background.",
        "Commercial grade professional styling for high-end digital catalogs.",
        "Ambient occlusion, subsurface scattering on organic surfaces.",
        "Crystal clear clarity, sharp edges, zero digital noise or artifacts.",
        "Hyper-realistic rendering with realistic shadows and highlights."
    ];

    let specificContext = "";
    if (type === 'merchant' || type === 'outlet') {
        specificContext = `Modern professional outlet storefront for "${name}". 
        Elegant architectural design, vibrant signage, inviting atmosphere. 
        Highly detailed exterior with clean windows and professional lighting. 
        Bustling but organized environment, premium commercial aesthetic.`;
    } else if (type === 'offer') {
        specificContext = `Dynamic promotional banner for "${name}". High-contrast, vibrant, professional graphic design. Gourmet app discount style.`;
    } else if (type === 'category') {
        // CONCISE PREMIUM ICON STYLE (MORE RELIABLE)
        return `Premium 3D food icon for "${name}". 
        High quality, 8k resolution, isometric, modern clay style, 
        vibrant colors, social media rendering, clean minimalist white background.`.trim();
    } else {
        // Product (default)
        specificContext = `High-end gourmet food photography of "${name}". 
        ${description ? description : 'Mouth-watering presentation on a premium ceramic plate.'} 
        Fresh ingredients, steam rising, glistening textures. 
        Professional culinary plating, award-winning food styling.`;
    }

    return `${basePromptChunks.join("\n")}\n${specificContext}\nExtreme detail, 8k, photorealistic, premium feel.`.trim();
};

/**
 * BANANA AI (GOOGLE IMAGEN 3) IMAGE GENERATOR
 * Uses the official Google AI key to produce high-end 3D assets.
 */
export const fetchBananaImage = async (name) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Google AI Key missing");

    try {
        // Correct Official Nano Banana / Imagen 3 Endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:generateImages?key=${apiKey}`;

        const professionalPrompt = `3D clay rendered icon of ${name}, isometric, clean white background, vibrant warm colors, soft ambient occlusion, modern app icon aesthetic, 8k resolution.`;

        const response = await axios.post(endpoint, {
            prompt: professionalPrompt,
            number_of_images: 1,
            aspect_ratio: "1:1",
            safety_setting: "BLOCK_MEDIUM_AND_ABOVE"
        });

        // Google returns base64 or a blob link depending on account type
        const imageData = response.data?.images?.[0]?.url || response.data?.images?.[0]?.base64;

        if (imageData) {
            return imageData.startsWith('http') ? imageData : `data:image/png;base64,${imageData}`;
        }

        throw new Error("Empty response from Google AI");
    } catch (error) {
        console.warn("Banana AI falling back to high-res proxy...", error);
        // Fallback to our high-res proxy if the key has restricted Imagen access
        const seed = Math.floor(Math.random() * 1000000);
        return `https://image.pollinations.ai/prompt/3D%20clay%20icon%20of%20${encodeURIComponent(name)}%2C%20vibrant%2C%20white%20background%2C%20isometric?width=1024&height=1024&seed=${seed}&nologo=true`;
    }
};

/**
 * FETCH FOOD IMAGE (Wrapper)
 */
export const fetchRealFoodImage = async (name, isRetry = false, description = '', type = 'product') => {
    if (type === 'category') {
        return await fetchBananaImage(name);
    }

    // Default product image logic
    const seed = isRetry ? Math.floor(Math.random() * 1000000) : 42;
    const professionalPrompt = `High quality 3D food icon of ${name}. ${description}. 8k resolution, isometric, modern clay style, vibrant colors, clean white background.`;

    return `https://image.pollinations.ai/prompt/${encodeURIComponent(professionalPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
};

// ── Generate REAL AI Content using Gemini ───────────────────────────────
export const generateAIDescription = async (name) => {
    if (!name.trim()) return "";
    try {
        const prompt = `Write a premium, mouth-watering marketing description for a food item named "${name}". Keep it appetizing, under 40 words. Focus on freshness and quality for a delivery app. No emojis.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini description error:", error);
        return `Delicious ${name} prepared with fresh ingredients and authentic flavors. Perfect for a satisfying meal. Order now!`;
    }
};

// ── Generate REAL AI Naming Suggestions using Gemini ───────────────────────
export const generateProductNames = async (keyword) => {
    if (!keyword || keyword.length < 3) return [];
    try {
        const prompt = `Suggest 3 creative, high-end names for a food product related to "${keyword}". Standard delivery app style. Return only the names separated by commas. No extra text. No numbering.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().split(",").map(n => n.trim()).filter(n => n);
    } catch (error) {
        console.error("Gemini naming error:", error);
        return [`Signature ${keyword}`, `${keyword} Delight`, `Grand ${keyword}`];
    }
};

