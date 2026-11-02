
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

    //const promptText = `私は今【${mood}】という気分です。この気分にぴったりな、元気が出る一言メッセージか、おすすめの過ごし方を50文字程度で優しく提案してください。`;
    const promptText = `私は今【たのしい】という気分です。この気分にぴったりな、元気が出る一言メッセージか、おすすめの過ごし方を50文字程度で優しく提案してください。`;
    console.log("Text:" + promptText);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`APIエラーが発生しました (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log("Text:" + data);
            
        // Geminiのレスポンス構造からテキストを抽出
        let jsonText = data.candidates[0].content.parts[0].text;
            
        // 万が一マークダウンブロックが含まれていた場合のトリミング
        jsonText = jsonText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            
        const result = JSON.parse(jsonText);
        console.log("result:" + result);
        if (response.ok) {
            const reply = data.candidates.content.parts.text;
            return res.status(200).json({ reply: result });
        } else {
            return res.status(500).json({ error: result.error.message });
        }
    } catch (error) {
        return res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
}
