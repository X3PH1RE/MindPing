import { OPENAI_API_KEY, OPENAI_BASE_URL } from "../config.js";

export async function handleTextRequest(prompt) {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4.1-nano",
            messages: [
                {
                    "role": "system",
                    "content": "You are a freelance assistant. You will craft oneline responses for users by understanding their input and providing helpful, professional assistance."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "No response";
}

