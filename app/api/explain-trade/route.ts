import OpenAI from 'openai';
import { getPriceTrend } from '@/lib/marketContext';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});


export async function POST(req: Request) {
    const { stockName, stockCode, action, price, quantity, date, memo } = await req.json();

    const trend = await getPriceTrend(stockCode, date);
    console.log('trend 결과:', trend);   // ← 추가

    const trendText = trend
        ? `${trend.기간} 동안 주가가 ${trend.시작가}원 → ${trend.종료가}원 (${trend.변동률}) 흘러갔음`
        : '가격 흐름 데이터를 가져오지 못함';

    const prompt = `사용자가 ${date}에 ${stockName}(${quantity}주, ${price}원)을 ${action}했고,
        직접 남긴 메모는 "${memo}"야.
        참고 데이터: ${trendText}
        
        이 메모와 데이터를 바탕으로, 왜 이런 판단을 했을지 주식 초보자도 이해할 수 있게
        2문장 이내로 짧고 쉽게 설명해줘. 전문용어 쓰면 바로 풀어서 설명하고,
        없는 이유를 지어내지 말고 메모와 데이터에 있는 내용만 근거로 삼아.
        
        만약 메모 내용과 참고 데이터가 서로 안 맞아 보이면, 억지로 끼워맞추지 말고
        "기간 전체로는 이랬지만 매매 시점 직전엔 다른 흐름이었을 수 있다" 정도로
        자연스럽게 설명해. 데이터가 10일 평균이라 그날의 정확한 순간 흐름과는 다를 수 있다는 것도 감안해.`;

    const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        reasoning_effort: 'low',
    });

    console.log('completion 전체:', JSON.stringify(completion, null, 2));   // ← 추가

    return Response.json({
        explanation: completion.choices[0].message.content,
    });
}