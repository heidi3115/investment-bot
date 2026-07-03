export async function getPriceTrend(stockCode: string, tradeDate: string) {
    // tradeDate: 'YYYY-MM-DD'
    const endDate = tradeDate.replace(/-/g, '');
    const start = new Date(tradeDate);
    start.setDate(start.getDate() - 10); // 매매일 기준 10일 전부터
    const startDate = start.toISOString().slice(0, 10).replace(/-/g, '');

    try {
        const res = await fetch(
            `https://api.finance.naver.com/siseJson.naver?symbol=${stockCode}&requestType=1&startTime=${startDate}&endTime=${endDate}&timeframe=day`
        );
        const raw = await res.text();

        // 이 엔드포인트는 순수 JSON이 아니라 JS 배열 형태 문자열이라 파싱 필요
        const cleaned = raw.replace(/'/g, '"');
        const rows: string[][] = JSON.parse(cleaned);

        // rows[0]은 헤더: ["날짜","시가","고가","저가","종가","거래량"]
        const dataRows = rows.slice(1).filter((r) => r.length > 1);
        if (dataRows.length < 2) return null;

        const first = dataRows[0];
        const last = dataRows[dataRows.length - 1];
        const startPrice = Number(first[4]); // 종가
        const endPrice = Number(last[4]);
        const changeRate = (((endPrice - startPrice) / startPrice) * 100).toFixed(1);

        return {
            기간: `${first[0]} ~ ${last[0]}`,
            시작가: startPrice,
            종료가: endPrice,
            변동률: `${changeRate}%`,
        };
    } catch (err) {
        return null;
    }
}