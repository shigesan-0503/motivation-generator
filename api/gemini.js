
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { mood } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'APIキーが設定されていません。' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const prompt = `${mood}`;
    console.log("prompt:" + prompt);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`APIエラーが発生しました (Status: ${response.status})`);
        }

        const data = await response.json();

        // Geminiのレスポンス構造からテキストを抽出
        let jsonText = data.candidates[0].content.parts[0].text;
        console.log("jsonText:" + jsonText);

        // 万が一マークダウンブロックが含まれていた場合のトリミング
        jsonText = jsonText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        
        if (response.ok) {
            return res.status(200).json({ reply: jsonText });
        } else {
            return res.status(500).json({ error: result.error.message });
        }
    } catch (error) {
        console.log("error:" + error);
        return res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
}
