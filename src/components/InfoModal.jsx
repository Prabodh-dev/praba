function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Model Info</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="info-row">
            <span>Version</span>
            <strong>praba-1 (v1.0.0)</strong>
          </div>
          <div className="info-row">
            <span>Model</span>
            <strong>Praba Base Model</strong>
          </div>
          <div className="info-row">
            <span>Parameters</span>
            <strong>1.1 Billion</strong>
          </div>
          <div className="info-row">
            <span>Size</span>
            <strong>~600MB</strong>
          </div>
          <div className="info-row">
            <span>Runs on</span>
            <strong>Your device</strong>
          </div>
          <div className="info-row">
            <span>Internet</span>
            <strong>Not needed after first load</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoModal;
