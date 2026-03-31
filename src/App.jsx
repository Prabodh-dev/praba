import { useState, useEffect, useRef } from "react";
import { useEngine } from "./hooks/useEngine";
import { useChatHistory } from "./hooks/useChatHistory";
import MessageBubble from "./components/MessageBubble";
import InputBar from "./components/InputBar";
import InfoModal from "./components/InfoModal";
import ChatHistory from "./components/ChatHistory";

function App() {
  const {
    loadEngine,
    loadStatus,
    loadProgress,
    loadText,
    isGenerating,
    generate,
    stop,
    selectedModel,
    models,
  } = useEngine();
  const { chats, activeChatId, saveChat, loadChat, deleteChat, newChat } =
    useChatHistory();

  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadEngine();
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (messages.length > 0) saveChat(messages);
  }, [messages]);

  async function handleSend(text) {
    setShowWelcome(false);
    const userMsg = {
      role: "user",
      content: text,
      timestamp: Date.now(),
      streaming: false,
    };
    const aiMsg = {
      role: "ai",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    };
    const next = [...messages, userMsg, aiMsg];
    setMessages(next);
    const aiIndex = next.length - 1;

    await generate(
      [...messages, userMsg].map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content,
      })),
      (token) =>
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === aiIndex ? { ...msg, content: msg.content + token } : msg,
          ),
        ),
    );

    setMessages((prev) =>
      prev.map((msg, i) =>
        i === aiIndex
          ? { ...msg, streaming: false, timestamp: Date.now() }
          : msg,
      ),
    );
  }

  function handleLoadChat(id) {
    const loaded = loadChat(id);
    if (!loaded) return;
    setMessages(loaded);
    setShowWelcome(false);
    setSidebarOpen(false);
  }

  function handleNewChat() {
    stop();
    newChat();
    setMessages([]);
    setShowWelcome(true);
    setSidebarOpen(false);
  }

  function handleDeleteChat(id) {
    deleteChat(id);
    if (activeChatId === id) handleNewChat();
  }

  function handleSelectModel(model) {
    stop();
    setMessages([]);
    setShowWelcome(true);
    loadEngine(model);
  }

  if (loadStatus === "idle" || loadStatus === "loading") {
    return (
      <div className="loading-screen">
        <div className="loader-content">
          <div className="logo-circle">
            <span className="logo-letter">P</span>
          </div>
          <h2 className="loader-title">Praba</h2>
          <p className="loader-sub">{loadText || "Initialising…"}</p>
          <div className="progress-bar-wrap">
            <div
              className="progress-bar"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="loader-hint">
            {loadProgress > 5
              ? `${loadProgress}% — cached after this`
              : "First load downloads model. Cached after that."}
          </p>
        </div>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="loading-screen">
        <div className="loader-content">
          <div className="logo-circle">
            <span className="logo-letter">!</span>
          </div>
          <h2 className="loader-title">Failed to load</h2>
          <p className="loader-sub">{loadText}</p>
          <button
            className="retry-btn"
            onClick={() => loadEngine(selectedModel)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {sidebarOpen && (
        <>
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <div className="header-avatar">P</div>
                <span className="sidebar-brand">Praba</span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setSidebarOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="sidebar-content">
              <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                onLoad={handleLoadChat}
                onDelete={handleDeleteChat}
                onNew={handleNewChat}
              />
            </div>
          </aside>

          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        </>
      )}

      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button
              className="icon-btn"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              ☰
            </button>
            <div className="header-avatar">P</div>
            <div>
              <div className="header-title">Praba</div>
              <div
                className={`header-status ${isGenerating ? "thinking" : ""}`}
              >
                {isGenerating ? "Thinking…" : "Ready"}
              </div>
            </div>
          </div>
          <div className="header-right">
            <button className="icon-btn" onClick={() => setShowInfo(true)}>
              ℹ
            </button>
          </div>
        </header>

        <main className="messages">
          {showWelcome && (
            <div className="welcome">
              <div className="welcome-logo">P</div>
              <h1 className="welcome-title">Hi, I'm Praba</h1>
              <p className="welcome-sub">
                Your offline AI assistant.
                <br />
                Ask me anything.
              </p>
              <div className="suggestions">
                <button
                  className="suggestion-chip"
                  onClick={() => handleSend("What can you help me with?")}
                >
                  What can you help me with?
                </button>
                <button
                  className="suggestion-chip"
                  onClick={() => handleSend("Explain recursion simply")}
                >
                  Explain recursion simply
                </button>
                <button
                  className="suggestion-chip"
                  onClick={() => handleSend("Write a Python hello world")}
                >
                  Write a Python hello world
                </button>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </main>

        <InputBar
          onSend={handleSend}
          onStop={stop}
          isGenerating={isGenerating}
          disabled={loadStatus !== "ready"}
          models={models}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
        />
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
}

export default App;
