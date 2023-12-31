import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { getRelevantDocs } from "./utils";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function queryAI(q: string) {
    let start = new Date()
    let result = ""
    const timestamps = []

    const context = await getRelevantDocs(q)

    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system", content: `Use the following pieces of context to answer the question at the end.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        ----------------
        ${context}
    `},
        { role: "user", content: q },
    ];

    const stream = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages,
    });

    for await (const chunk of stream) {
        const stop = new Date();
        const elapsedSeconds = (stop.getTime() - start.getTime()) / 1000;
        timestamps.push('Time to receive ' + elapsedSeconds.toFixed(2) + ' seconds');

        const { content } = chunk.choices[0].delta

        if (content) result += content;
    }

    console.log({ timestamp: timestamps[0] });


    return result
}