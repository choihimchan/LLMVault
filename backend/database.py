import sqlite3

DB_FILE = "chat_history.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # 대화 기록을 저장할 테이블 생성
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            role TEXT,           -- 'user'(나) 또는 'assistant'(AI)
            content TEXT,        -- 대화 내용
            model_used TEXT      -- 사용한 AI 모델
        )
    ''')
    conn.commit()
    conn.close()

def save_message(session_id, role, content, model_used):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (session_id, role, content, model_used)
        VALUES (?, ?, ?, ?)
    ''', (session_id, role, content, model_used))
    conn.commit()
    conn.close()

def get_all_messages():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # 데이터를 딕셔너리(JSON) 형태로 예쁘게 뽑기 위한 마법
    cursor = conn.cursor()
    
    # 최신 대화가 맨 위에 오도록 역순(DESC)으로 가져옵니다
    cursor.execute('SELECT * FROM messages ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]    