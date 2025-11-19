import { Actor } from 'apify';
import axios from 'axios';

await Actor.main(async () => {
    const input = await Actor.getInput();
    if (!input?.imageUrl) throw new Error('Image URL is required');
    if (!input?.openrouterApiKey) throw new Error('API key is required');

    const { imageUrl, context = '', maxLength = 125, includeKeywords = [], model = 'google/gemini-2.0-flash-exp:free', openrouterApiKey } = input;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages: [{
            role: 'user',
            content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: `Generate SEO-optimized alt text for this image (max ${maxLength} chars). ${context ? `Context: ${context}` : ''} ${includeKeywords.length > 0 ? `Keywords: ${includeKeywords.join(', ')}` : ''} Return JSON: {"altText": "string", "longDescription": "string", "seoKeywords": [], "variants": []}` }
            ]
        }],
        response_format: { type: 'json_object' }
    }, {
        headers: { 'Authorization': `Bearer ${openrouterApiKey}`, 'HTTP-Referer': 'https://apify.com' }
    });

    const result = JSON.parse(response.data.choices[0].message.content);
    await Actor.pushData({ ...result, imageUrl, cost: 0.004, chargePrice: 0.12, createdAt: new Date().toISOString() });
    console.log('✓ Alt text generated!');
});
