function ModelSelector({ models, selectedModel, onSelect, disabled }) {
  return (
    <div className="model-selector">
      <p className="model-selector-label">Choose Model</p>

      <div className="model-list">
        {models.map((model) => {
          const isActive = model.id === selectedModel.id;

          return (
            <button
              key={model.id}
              className={`model-card ${isActive ? "active" : ""}`}
              onClick={() => onSelect(model)}
              disabled={disabled}
            >
              {/* Left side — name and size */}
              <div className="model-card-left">
                <span className="model-name">{model.name}</span>
                <span className="model-size">{model.size}</span>
              </div>

              {/* Right side — speed and smart dots */}
              <div className="model-card-right">
                <span className="model-speed">{model.speed}</span>
                <div className="model-smart">
                  {[1, 2, 3, 4].map((dot) => (
                    <div
                      key={dot}
                      className={`smart-dot ${dot <= model.smart ? "filled" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* Active indicator */}
              {isActive && <div className="model-active-badge">✓ Active</div>}
            </button>
          );
        })}
      </div>

      <p className="model-selector-hint">
        Switching model will reload — chat history is saved.
      </p>
    </div>
  );
}

export default ModelSelector;
