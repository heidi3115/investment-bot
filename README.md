# Investment-bot

주식 초보자를 위한 매매 판단 설명 API. [매매일지 앱(afterschool_investment_club)](https://github.com/heidi3115/afterschool_investment_club)에서 호출하는 백엔드 전용 프로젝트입니다.

- 초보자의 입장에서는 매매일지에 남긴 짧은 메모(예: 하락하길래 일부 차익실현)만으로는 왜 그런 판단을 했는지 이해하기가 어렵습니다.
- 매매기록(종목, 가격, 수량, 날짜, 메모)과 그 시점 전후의 실제 가격 흐름을 함께 AI(groq)에게 전달하고, 초보자의 눈높이로 풀어서 설명합니다.


## 기술 스택

- **Next.js** (App Router) - API Route만 사용, 화면(UI) 없음
- **Groq API**(openai/gpt-oss-120b) - OpenAI SDK 호환 방식으로 호출
- **네이버 금융 비공식 엔드포인트** - 특정 기간 가격 흐름 조회


## API

### `POST /api/explain-trade`

**Request Body**
| 필드 | 타입 | 설명 |
|---|---|---|
| `stockName` | string | 종목명 (예: "이수페타시스") |
| `stockCode` | string | 6자리 종목코드 (예: "007660") |
| `action` | string | `"매수"` 또는 `"매도"` |
| `price` | number | 거래 가격 |
| `quantity` | number | 거래 수량 |
| `date` | string | 거래일 (`YYYY-MM-DD`) |
| `memo` | string | 매매 시 남긴 메모 |

**요청 예시**

```bash
curl -X POST https://investment-bot-eight.vercel.app/api/explain-trade \
  -H "Content-Type: application/json" \
  -d '{
    "stockName": "이수페타시스",
    "stockCode": "007660",
    "action": "매도",
    "price": 123000,
    "quantity": 5,
    "date": "2026-07-03",
    "memo": "하락하길래 일부 차익실현"
  }'
```

**Response**

```json
{
  "explanation": "주가가 전반적으로 소폭 상승했지만, 매도 시점 직전엔 하락 흐름이 보여 더 떨어지기 전에 차익을 실현한 것으로 보여요."
}
```

## 로컬 실행
 
```bash
npm install
```
 
프로젝트 루트에 `.env.local` 생성:
 
```
GROQ_API_KEY=발급받은_Groq_API_키
```
 
Groq API 키는 [console.groq.com/keys](https://console.groq.com/keys)에서 무료 발급이 가능합니다.
 
```bash
npm run dev
```
 
`http://localhost:3000/api/explain-trade`로 테스트 요청 가능
 
## 배포
 
Vercel에 연결되어 있으며, `main` 브랜치에 push하면 자동 배포됩니다.
 
배포 시 **Vercel 프로젝트 Settings → Environment Variables**에 `GROQ_API_KEY`를 반드시 등록해야 합니다. 등록하지 않으면 배포는 되지만 API 호출 시 500 에러가 발생합니다.
 
- 배포 주소: `https://investment-bot-eight.vercel.app`
## 참고사항
 
- **CORS**: 모든 origin을 허용(`Access-Control-Allow-Origin: *`)하고 있습니다. (실서비스로 전환 시에는 실제 도메인으로 한정하는 것이 좋음)
- **가격 데이터 출처**: 네이버 금융의 비공식 엔드포인트를 사용합니다. 공식 API가 아니므로 예고 없이 응답 형식이 바뀌거나 접근이 막힐 수 있습니다!
- **Groq 무료 티어 한도**: `openai/gpt-oss-120b` 기준 분당 30회, 일일 1,000회 요청까지 무료입니다. (한도 초과 시 429 에러 반환)
