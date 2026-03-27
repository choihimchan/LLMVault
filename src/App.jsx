import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedModel, setSelectedModel] = useState('local'); 
  const [apiKey, setApiKey] = useState(''); 
  const [showDB, setShowDB] = useState(false);
  const [dbRecords, setDbRecords] = useState([]);
  
  const chatEndRef = useRef(null);

  const fetchDB = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/history');
      const result = await response.json();
      setDbRecords(result.data);
    } catch (error) {
      console.error("Failed to load DB:", error);
    }
  };

  useEffect(() => {
    if (showDB) fetchDB();
  }, [showDB]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput(''); 

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, model: selectedModel, api_key: apiKey }),
      });
      
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      
      if (showDB) fetchDB();
      
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "🚨 Server connection failed!" }]);
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden select-none">
      
      {/* 🟢 Left Sidebar: EXPLORER */}
      <div className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col shrink-0">
        <div className="text-[11px] text-[#cccccc] px-4 py-2 font-semibold tracking-widest mt-2">
          EXPLORER
        </div>
        
        <div className="px-2 mt-2 text-sm text-[#cccccc] flex flex-col gap-1">
          <div className="flex items-center gap-2 hover:bg-[#37373d] px-2 py-1 cursor-pointer rounded">
            <span>📁</span> <span className="font-bold text-white">WORKSPACE</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-[#37373d] px-2 py-1 cursor-pointer pl-6">
            <span className="text-[#519aba]">🐍</span> <span>backend_api.py</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-[#37373d] px-2 py-1 cursor-pointer pl-6 text-[#cbcb41]">
            <span>⚡</span> <span>app.jsx</span>
          </div>
          <div className="flex items-center gap-2 hover:bg-[#37373d] px-2 py-1 cursor-pointer pl-6">
            <span className="text-gray-400">🗄️</span> <span>chat_history.db</span>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mt-auto border-t border-[#3c3c3c] p-4 flex flex-col">
          <div className="text-xs text-gray-400 mb-1">AI ENGINE SETTINGS</div>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-[#3c3c3c] border border-[#3c3c3c] text-white p-2 text-sm outline-none focus:border-[#007acc] rounded cursor-pointer mb-3"
          >
            <option value="local">Local Mode (Llama.cpp)</option>
            <option value="gemini">Gemini 2.5 Pro</option>
            <option value="gpt">OpenAI (GPT-4)</option>
            <option value="claude">Claude 3</option>
          </select>

          {/* API KEY Input */}
          <div className="text-xs text-gray-400 mb-1">API KEY (Cloud Only)</div>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={selectedModel === 'local'}
            placeholder={selectedModel === 'local' ? "No API key needed for Local mode 🚀" : "sk-..."}
            className="w-full bg-[#1e1e1e] border border-[#3c3c3c] text-white p-2 text-sm outline-none focus:border-[#007acc] rounded disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          />

          <button 
            onClick={() => setShowDB(!showDB)}
            className={`w-full py-2 text-sm font-bold rounded transition-colors border ${showDB ? 'bg-[#3c3c3c] text-[#f48771] border-[#f48771]' : 'bg-[#007acc] text-white border-[#007acc] hover:bg-[#005f9e]'}`}
          >
            {showDB ? '■ CLOSE TERMINAL' : '▶ OPEN DB MONITOR'}
          </button>
        </div>
      </div>

      {/* 🟢 Center: Main Editor (Chat Area) */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0">
        <div className="flex bg-[#252526] overflow-x-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border-t-2 border-[#007acc] text-white text-sm min-w-max cursor-pointer">
            <span className="text-[#cbcb41]">⚡</span> app.jsx
          </div>
          <div className="flex items-center gap-2 px-4 py-2 text-[#969696] hover:bg-[#2b2b2c] text-sm min-w-max cursor-pointer border-r border-[#3c3c3c]">
            <span className="text-[#519aba]">🐍</span> main.py
          </div>
        </div>

        <div className="text-xs text-[#969696] px-4 py-1 border-b border-[#3c3c3c] flex items-center gap-2">
          <span>WORKSPACE</span> <span className="text-gray-600">{'>'}</span> <span>src</span> <span className="text-gray-600">{'>'}</span> <span className="text-[#cbcb41]">app.jsx</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 font-code text-sm select-text">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <span className="text-6xl opacity-20">🚀</span>
              <p>print("Workspace initialized. Awaiting user input...")</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`whitespace-pre-wrap leading-relaxed max-w-[85%] p-4 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-[#0e639c] text-white' : 'bg-[#2d2d2d] text-[#d4d4d4] border border-[#3c3c3c]'}`}>
                    <div className="text-[11px] opacity-60 mb-2 font-sans font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? '// USER_INPUT' : `// AI_RESPONSE (${selectedModel})`}
                    </div>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1e1e1e] border-t border-[#3c3c3c]">
          <div className="max-w-4xl mx-auto flex items-center gap-3 bg-[#2d2d2d] border border-[#3c3c3c] focus-within:border-[#007acc] rounded px-4 py-1 transition-colors">
            <span className="text-[#4af626] font-code font-bold">~</span>
            <span className="text-[#007acc] font-code font-bold">$</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="> Awaiting user input... (Press Enter to execute)"
              className="flex-1 bg-transparent p-2 text-[#cccccc] font-code outline-none placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* 🟢 Right: Terminal (DB Monitor) */}
      {showDB && (
        <div className="w-[400px] bg-[#1e1e1e] border-l border-[#3c3c3c] flex flex-col shrink-0">
          <div className="flex text-xs text-[#cccccc] border-b border-[#3c3c3c]">
            <div className="px-4 py-2 border-b-2 border-transparent hover:text-white cursor-pointer uppercase">Problems</div>
            <div className="px-4 py-2 border-b-2 border-transparent hover:text-white cursor-pointer uppercase">Output</div>
            <div className="px-4 py-2 border-b-2 border-[#007acc] text-white cursor-pointer uppercase font-bold">Terminal</div>
          </div>
          
          <div className="p-2 text-xs text-gray-500 font-code border-b border-[#3c3c3c] bg-[#252526]">
            C:\WORKSPACE\SQLite_DB_Monitor &gt; tail -f chat_history.db
          </div>

          <div className="flex-1 overflow-y-auto p-4 font-code text-sm select-text flex flex-col gap-2">
            {dbRecords.map((record) => (
              <div key={record.id} className="text-gray-400 break-words leading-relaxed border-l-2 border-[#3c3c3c] pl-3 py-1 hover:bg-[#2a2d2e]">
                <span className="text-gray-500">[{record.date?.split(' ')[1] || 'TIME'}]</span>{' '}
                <span className="text-[#569cd6]">INFO</span>:{' '}
                <span className="text-[#ce9178]">&lt;{record.model_used}&gt;</span>{' '}
                <span className={record.role === 'user' ? 'text-[#4af626]' : 'text-[#c586c0]'}>
                  [{record.role.toUpperCase()}]
                </span>{' '}
                <span className="text-[#d4d4d4] whitespace-pre-wrap">
                  {record.content.length > 50 ? record.content.substring(0, 50) + '...' : record.content}
                </span>
              </div>
            ))}
            <div className="text-[#4af626] animate-pulse">_</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;