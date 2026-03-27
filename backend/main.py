from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import database
from litellm import completion
import os
import httpx
from dotenv import load_dotenv
from typing import Optional

# .env 파일에서 API 키를 불러오긴 하지만, 이제 유저 키를 우선시합니다.
load_dotenv()

app = FastAPI()

# React(프론트엔드)와 통신하기 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서버가 켜질 때 DB(chat_history.db) 준비
database.init_db()

# 🟢 데이터 모델: 프론트에서 api_key도 받아오도록 구조 변경
class ChatRequest(BaseModel):
    message: str
    model: str
    api_key: Optional[str] = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    session_id = "test_session_01"
    
    # 1. 내가 보낸 질문을 DB에 저장
    database.save_message(session_id, "user", request.message, request.model)
    
    try:
        # 🟢 방어 로직: 로컬 모드가 아닌데 API 키가 없다면 통신 차단! (내 지갑 방어)
        if request.model != "local" and not request.api_key:
            return {"reply": "🚨 [SYSTEM] API Key가 필요합니다. 해커뉴스 데모 버전에서는 본인의 API 키를 입력하셔야 합니다."}

        # 🟢 로컬 모델(오프라인) 선택 시
        if request.model == "local":
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://127.0.0.1:8080/v1/chat/completions",
                    json={"messages": [{"role": "user", "content": request.message}], "temperature": 0.7},
                    timeout=300.0 
                )
                data = response.json()
                ai_reply = data["choices"][0]["message"]["content"]

        # 🔵 클라우드 모델(Gemini, GPT, Claude) 선택 시
        else:
            if request.model == "gemini":
                actual_model = "gemini/gemini-2.5-pro"  
            elif request.model == "gpt":
                actual_model = "gpt-4-turbo"
            elif request.model == "claude":
                actual_model = "claude-3-opus-20240229"
            else:
                actual_model = "gemini/gemini-2.5-pro"
                
            # 🟢 유저가 입력한 API 키(request.api_key)를 강제로 꽂아 넣음!
            response = completion(
                model=actual_model, 
                messages=[{"role": "user", "content": request.message}],
                api_key=request.api_key 
            )
            ai_reply = response.choices[0].message.content
            
    except Exception as e:
        ai_reply = f"🚨 API 통신 에러: 유효하지 않은 키이거나 네트워크 문제입니다. ({str(e)})"
    
    # AI의 답변을 DB에 저장
    database.save_message(session_id, "assistant", ai_reply, request.model)
    return {"reply": ai_reply}

@app.get("/api/history")
async def get_history():
    records = database.get_all_messages()
    return {"data": records}