function ChatHistory({ chats, activeChatId, onLoad, onDelete, onNew }) {
  function formatDate(ts) {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  }

  return (
    <div className="history-wrap">
      <button className="new-chat-btn" onClick={onNew}>
        <span>+</span>
        New Chat
      </button>

      {chats.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-icon">💬</div>
          <p>No chats yet</p>
          <span>Start a conversation!</span>
        </div>
      )}

      <div className="history-list">
        {chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <div
              key={chat.id}
              className={`history-item ${isActive ? "active" : ""}`}
            >
              <button
                className="history-item-btn"
                onClick={() => onLoad(chat.id)}
              >
                <div className="history-item-icon">💬</div>
                <div className="history-item-text">
                  <span className="history-item-title">{chat.title}</span>
                  <span className="history-item-date">
                    {formatDate(chat.updatedAt)}
                  </span>
                </div>
              </button>
              <button
                className="history-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                }}
                title="Delete"
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatHistory;
