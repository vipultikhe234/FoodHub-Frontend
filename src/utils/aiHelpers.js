// ── Fetch a REAL food image ───────────────────────────────────────────────
// Smart Router: Foodish API (fast) -> TheMealDB -> Pollinations AI (Prompt based)
export const fetchRealFoodImage = async (name, randomize = false, description = '') => {
    if (!name.trim()) return '';
    const cleanName = name.trim().toLowerCase();

    // Deterministic random seed
    const seed = randomize ? Math.floor(Math.random() * 9999) + 1 : cleanName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;

    try {
        // If we have a description, use it for a HIGH QUALITY AI prompt
        if (description && description.length > 20) {
            const prompt = `Professional food photo of ${name}, ${description}, authentic Indian restaurant style, served on a plate, wooden background, 8k resolution, cinematic lighting, bokeh, appetizing, high detail`;
            return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&seed=${seed}&nologo=true`;
        }

        // 1️⃣ Fast generic food API with aliases
        const aliases = {
            'idli': 'idly',
            'dosa': 'dosa',
            'biryani': 'biryani',
            'burger': 'burger',
            'pizza': 'pizza',
            'pasta': 'pasta',
            'samosa': 'samosa'
        };

        const matchedAlias = Object.keys(aliases).find(key => cleanName.includes(key));
        if (matchedAlias) {
            const foodishCat = aliases[matchedAlias];
            const res = await fetch(`https://foodish-api.com/api/images/${foodishCat}`, { signal: AbortSignal.timeout(3000) });
            const data = await res.json();
            if (data.image) return data.image;
        }

        // 2️⃣ TheMealDB — high-quality recipe photos
        const resMeal = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(cleanName)}`, { signal: AbortSignal.timeout(3000) });
        const dataMeal = await resMeal.json();
        if (dataMeal.meals && dataMeal.meals.length > 0) {
            return dataMeal.meals[0].strMealThumb;
        }
    } catch (_) { }

    // 3️⃣ Final Prompt-based Fallback (Enhanced for accuracy)
    const fallbackPrompt = `High-quality professional food photography of ${name} dish, authentic Indian cuisine, close-up shot, appetizing presentation, 4k, gourmet style`;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=800&height=800&seed=${seed}&nologo=true`;
};

// ── Generate AI Composition Metadata (Text) ───────────────────────────────
export const generateAIDescription = (name) => {
    return new Promise(async (resolve) => {
        if (!name.trim()) return resolve('');

        const culinaryHooks = [
            `Infused with aromatic spices and crafted with precision, this ${name.toLowerCase()} delivers a masterclass in flavor.`,
            `A premium blend of fresh ingredients and traditional techniques, making every bite of this ${name.toLowerCase()} truly unforgettable.`,
            `Savor the rich, bold textures of our signature ${name.toLowerCase()}, designed for those who appreciate culinary excellence.`,
            `Crunchy, savory, and perfectly balanced—our ${name.toLowerCase()} is a high-end take on a classic favorite.`,
            `Experience the melted goodness and chef-curated zest that defines this exclusive ${name.toLowerCase()}.`
        ];

        // Pick a random template
        const template = culinaryHooks[Math.floor(Math.random() * culinaryHooks.length)];

        // Manual timeout for API attempt
        const timer = setTimeout(() => resolve(template), 4000);

        try {
            const res = await fetch(`https://baconipsum.com/api/?type=meat-and-filler&format=text&sentences=1`);
            clearTimeout(timer);

            if (!res.ok) return resolve(template);
            let text = (await res.text()).trim();

            if (text.length > 55) text = text.substring(0, 52) + '...';
            resolve(`${name}: ${text}`);
        } catch (_) {
            clearTimeout(timer);
            resolve(template);
        }
    });
};
// ── Generate AI Naming Suggestions ───────────────────────────────────────
export const generateProductNames = (keyword) => {
    if (!keyword || keyword.length < 3) return [];

    const prefixes = ['Signature', 'Royal', 'Chef\'s Special', 'Authentic', 'Gourmet', 'Classic', 'Zesty', 'Smoky', 'Crunchy', 'Melted'];
    const suffixes = ['Delight', 'Fusion', 'Symphony', 'Medley', 'Temptation', 'Supreme', 'Masterpiece', 'Bowl', 'Platter', 'Wrap'];

    // Create 3 unique suggestions
    const suggestions = [
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keyword}`,
        `${keyword} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`,
        `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${keyword} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`
    ];

    return [...new Set(suggestions)]; // Return unique values
};
