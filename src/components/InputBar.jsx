import { useRef, useEffect, useState } from "react";

function InputBar({
  onSend,
  onStop,
  isGenerating,
  disabled,
  models,
  selectedModel,
  onSelectModel,
}) {
  const textareaRef = useRef(null);
  const [showModels, setShowModels] = useState(false);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = textareaRef.current?.value.trim();
    if (!text || isGenerating) return;
    onSend(text);
    textareaRef.current.value = "";
    autoResize();
  }

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  return (
    <footer className="input-area">
      <div className="input-bar">
        <textarea
          ref={textareaRef}
          className="input-field"
          placeholder={disabled ? "Loading model…" : "Reply…"}
          rows={1}
          maxLength={2000}
          disabled={disabled}
          onInput={autoResize}
          onKeyDown={handleKeyDown}
        />

        <div className="input-actions">
          <div className="model-picker-wrap">
            <button
              className="model-picker-btn"
              onClick={() => setShowModels((o) => !o)}
              disabled={isGenerating}
            >
              <span>{selectedModel.name}</span>
              <span className="chevron">{showModels ? "▲" : "▼"}</span>
            </button>

            {showModels && (
              <div className="model-dropdown">
                {models.map((model) => {
                  const isActive = model.id === selectedModel.id;
                  return (
                    <button
                      key={model.id}
                      className={`model-dropdown-item ${isActive ? "active" : ""} ${!model.available ? "upcoming" : ""}`}
                      onClick={() => {
                        if (!model.available) return;
                        onSelectModel(model);
                        setShowModels(false);
                      }}
                      disabled={!model.available}
                    >
                      <div className="model-dropdown-left">
                        <span className="model-dropdown-name">
                          {model.name}
                        </span>
                        <span className="model-dropdown-desc">
                          {model.description}
                        </span>
                      </div>
                      <div className="model-dropdown-right">
                        {!model.available ? (
                          <span className="tag upcoming-tag">Upcoming</span>
                        ) : isActive ? (
                          <span className="tag active-tag">✓ Active</span>
                        ) : (
                          <span className="model-size">{model.size}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            className={`send-btn ${isGenerating ? "stop" : ""}`}
            onClick={isGenerating ? onStop : handleSend}
            disabled={disabled}
          >
            {isGenerating ? "■" : "➤"}
          </button>
        </div>
      </div>
      <p className="input-footer">
        Praba v1.0.0 · Runs fully offline on your device
      </p>
    </footer>
  );
}

export default InputBar;
