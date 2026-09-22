import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileName(url) {
  if (!url) return "";
  try {
    const parts = url.split("/");
    return parts[parts.length - 1] || "Current image";
  } catch {
    return "Current image";
  }
}

export default function FileUpload({
  id,
  field = {},
  currentUrl = null,
  file = null,
  onChange,
  disabled = false,
  accept = "image/*",
  hint,
}) {
  const inputRef = useRef(null);
  const inputId = id || (field?.name ? `cms-upload-${field.name}` : undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(currentUrl || null);
    }
  }, [file, currentUrl]);

  const helperText =
    hint || field?.hint || "PNG, JPG, GIF, SVG or WebP, up to 8MB";

  function handleFileSelect(selectedFile) {
    if (disabled || !selectedFile) return;
    onChange(selectedFile);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      if (accept.includes("image") && !droppedFile.type.startsWith("image/")) {
        return;
      }
      handleFileSelect(droppedFile);
    }
  }

  function handleBrowseClick(e) {
    e.preventDefault();
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleRemove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onChange(null);
  }

  const hasImage = Boolean(previewUrl);

  return (
    <div
      className={`cms-upload-box ${isDragging ? "is-dragging" : ""} ${
        hasImage ? "has-image" : ""
      } ${disabled ? "is-disabled" : ""}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="cms-upload-input"
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          handleFileSelect(f);
        }}
      />

      {!hasImage ? (
        <div
          className="cms-upload-dropzone"
          onClick={handleBrowseClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleBrowseClick(e);
            }
          }}
        >
          <div className="cms-upload-icon-wrap">
            <svg
              className="cms-upload-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="cms-upload-text">
            <p className="cms-upload-prompt">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="cms-upload-helper">{helperText}</p>
          </div>
        </div>
      ) : (
        <div className="cms-upload-preview-card">
          <div className="cms-upload-thumb-wrap">
            <img
              src={previewUrl}
              alt="Preview"
              className="cms-upload-thumb"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {file && <span className="cms-upload-badge new">New</span>}
            {!file && currentUrl && (
              <span className="cms-upload-badge current">Current</span>
            )}
          </div>

          <div className="cms-upload-details">
            <div className="cms-upload-info">
              <strong className="cms-upload-filename" title={file?.name || getFileName(currentUrl)}>
                {file ? file.name : getFileName(currentUrl)}
              </strong>
              <div className="cms-upload-meta">
                {file ? (
                  <span>
                    {formatFileSize(file.size)} • {file.type || "Image"}
                  </span>
                ) : (
                  <span>Saved on server</span>
                )}
              </div>
            </div>

            <div className="cms-upload-actions">
              <button
                type="button"
                className="cms-upload-btn-replace"
                onClick={handleBrowseClick}
                disabled={disabled}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Change
              </button>

              {file && (
                <button
                  type="button"
                  className="cms-upload-btn-remove"
                  onClick={handleRemove}
                  disabled={disabled}
                  title="Remove newly selected file"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  id: PropTypes.string,
  field: PropTypes.object,
  currentUrl: PropTypes.string,
  file: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  accept: PropTypes.string,
  hint: PropTypes.string,
};

