import api from '../services/api';

/**
 * MIGRATED TO BACKEND: Secure AI Image Generation
 * Now calls our Laravel API to avoid CORS and protect API keys.
 */
export const fetchRealFoodImage = async (name, isRetry = false, description = '', type = 'product') => {
    try {
        const response = await api.post('/admin/generate-image', {
            name: name,
            type: type
        });
        
        if (response.data.success) {
            return {
                url: response.data.image_url,
                fallback: response.data.fallback_url
            };
        }
        throw new Error("Backend failed to generate image");
    } catch (error) {
        console.error("AI Generation Error:", error);
        const seed = Math.floor(Math.random() * 1000000);
        const url = `https://image.pollinations.ai/prompt/Professional%20food%20photo%20of%20${encodeURIComponent(name)}?width=1024&height=1024&seed=${seed}&nologo=true`;
        return { url: url, fallback: url };
    }
};

/**
 * Legacy support for fetchBananaImage
 */
export const fetchBananaImage = async (name) => {
    const data = await fetchRealFoodImage(name, false, '', 'category');
    return data.url;
};

/**
 * AI CONTENT GENERATION (Descriptions, Naming)
 */
export const generateAIDescription = async (name) => {
    try {
        const response = await api.post('/admin/generate-image', {
            name: name,
            type: 'product'
        });
        return response.data.metadata.prompt || `Fresh and delicious ${name}.`;
    } catch (error) {
        return `Delicious ${name} prepared with fresh ingredients.`;
    }
};

export const generateProductNames = async (category) => {
    return ["Classic " + category, "Signature " + category, "Premium " + category, "Grand " + category, "Elite " + category];
};

/**
 * Placeholder for prompt expansion (handled server-side now)
 */
export const expandPromptWithAI = async (name) => name;
