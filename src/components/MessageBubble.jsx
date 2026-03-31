function MessageBubble({ message }) {
  const isUser = message.role === "user";

  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message-row ${isUser ? "user" : "ai"}`}>
      {!isUser && <div className="avatar">P</div>}

      <div className="bubble-wrap">
        <div className={`bubble ${message.streaming ? "streaming" : ""}`}>
          {message.content}
        </div>

        {!message.streaming && <span className="timestamp">{time}</span>}
      </div>
    </div>
  );
}

export default MessageBubble;
