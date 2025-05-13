import React, { useState, useRef, useCallback } from "react";
import { FileUploader } from "./file-upload-api";

// Farben für die Gestaltung
const COLORS = {
  primary: "#3498db",
  success: "#2ecc71",
  error: "#e74c3c",
  background: "#f9f9f9",
  border: "#ddd",
  text: "#333",
  secondaryText: "#666",
};

const FileUploaderComponent = ({
  baseUrl = "https://api.example.com",
  bucketId = "default-bucket",
  token = null,
  temporaryUrlToken = null,
  chunkSize,
  concurrentUploads,
  maxFiles = 10,
  acceptedFileTypes = "*",
  maxFileSize = 100 * 1024 * 1024, // 100MB default
}) => {
  // Zustände
  const [files, setFiles] = useState([]);
  const [uploads, setUploads] = useState({});
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [completedUploads, setCompletedUploads] = useState([]);

  // Refs
  const fileInputRef = useRef(null);
  const uploaderRef = useRef(null);

  // Uploader-Instanz initialisieren
  if (!uploaderRef.current) {
    uploaderRef.current = new FileUploader({
      baseUrl,
      token,
      temporaryUrlToken,
      chunkSize,
      concurrentUploads,
      onProgress: (progress) => {
        setUploads((prev) => ({
          ...prev,
          [progress.fileName]: progress,
        }));
      },
    });
  }

  // Handler für Drag & Drop Events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Dateiverarbeitung
  const processFiles = useCallback(
    (fileList) => {
      const newFiles = Array.from(fileList);
      const validFiles = [];
      const newErrors = {};

      // Dateien validieren
      newFiles.forEach((file) => {
        // Prüfen ob zu viele Dateien
        if (files.length + validFiles.length >= maxFiles) {
          newErrors[file.name] =
            `Maximale Anzahl von ${maxFiles} Dateien überschritten`;
          return;
        }

        // Prüfen ob Datei zu groß
        if (file.size > maxFileSize) {
          newErrors[file.name] =
            `Datei ist zu groß (max. ${(maxFileSize / (1024 * 1024)).toFixed(0)} MB)`;
          return;
        }

        // Prüfen auf Dubletten
        if (files.some((f) => f.name === file.name)) {
          newErrors[file.name] = "Datei bereits ausgewählt";
          return;
        }

        validFiles.push(file);
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [files, maxFiles, maxFileSize],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleFileInputChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles],
  );

  const handleSelectFilesClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Datei entfernen
  const handleRemoveFile = useCallback((fileName) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
  }, []);

  // Dateien hochladen
  const handleUpload = useCallback(async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setErrors({});

    try {
      const results = await uploaderRef.current.uploadFiles(bucketId, files);

      // Erfolgreiche und fehlgeschlagene Uploads verarbeiten
      const newErrors = {};
      const successfulUploads = [];

      results.forEach((result) => {
        if (!result.success) {
          newErrors[result.fileName] = "Upload fehlgeschlagen";
        } else {
          successfulUploads.push(result);
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...newErrors }));
      }

      if (successfulUploads.length > 0) {
        setCompletedUploads((prev) => [...prev, ...successfulUploads]);
        setFiles((prev) =>
          prev.filter(
            (file) =>
              !successfulUploads.some(
                (upload) => upload.fileName === file.name,
              ),
          ),
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Ein unerwarteter Fehler ist aufgetreten beim Upload",
      }));
    } finally {
      setIsUploading(false);
    }
  }, [files, isUploading, bucketId]);

  // Alles zurücksetzen
  const handleReset = useCallback(() => {
    setFiles([]);
    setUploads({});
    setErrors({});
    setCompletedUploads([]);
  }, []);

  // Formatierung der Dateigröße
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: COLORS.text,
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2 style={{ color: COLORS.primary, marginBottom: "20px" }}>
        Dateien hochladen
      </h2>

      {/* Drag & Drop Bereich */}
      <div
        style={{
          border: `2px dashed ${isDragging ? COLORS.primary : COLORS.border}`,
          borderRadius: "8px",
          padding: "40px 20px",
          textAlign: "center",
          backgroundColor: COLORS.background,
          marginBottom: "20px",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onClick={handleSelectFilesClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />

        <div>
          <svg
            style={{
              width: "64px",
              height: "64px",
              marginBottom: "16px",
              fill: COLORS.primary,
            }}
            viewBox="0 0 24 24"
          >
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
          </svg>

          <div style={{ fontSize: "18px", marginBottom: "8px" }}>
            Dateien hier ablegen oder klicken zum Auswählen
          </div>

          <div style={{ color: COLORS.secondaryText, fontSize: "14px" }}>
            Maximale Dateigröße: {formatFileSize(maxFileSize)} • Maximale
            Anzahl: {maxFiles} Dateien
          </div>
        </div>
      </div>

      {/* Allgemeine Fehleranzeige */}
      {errors.general && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#ffebee",
            color: COLORS.error,
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {errors.general}
        </div>
      )}

      {/* Dateiliste */}
      {files.length > 0 && (
        <>
          <h3 style={{ margin: "20px 0 10px" }}>Ausgewählte Dateien</h3>
          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            {files.map((file) => {
              const progress = uploads[file.name] || { percentage: 0 };
              const error = errors[file.name];

              return (
                <div
                  key={file.name}
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: error ? "#fff8f8" : "#fff",
                  }}
                >
                  {/* File Icon */}
                  <div
                    style={{
                      marginRight: "12px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#f1f1f1",
                      borderRadius: "4px",
                    }}
                  >
                    <svg
                      style={{
                        width: "24px",
                        height: "24px",
                        fill: COLORS.secondaryText,
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z" />
                    </svg>
                  </div>

                  {/* File Details */}
                  <div style={{ flexGrow: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "16px",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: COLORS.secondaryText,
                      }}
                    >
                      {formatFileSize(file.size)}
                    </div>

                    {/* Progress Bar */}
                    {isUploading && progress && (
                      <div
                        style={{
                          height: "4px",
                          width: "100%",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "2px",
                          marginTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${progress.percentage}%`,
                            backgroundColor: COLORS.primary,
                            borderRadius: "2px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div
                        style={{
                          color: COLORS.error,
                          fontSize: "13px",
                          marginTop: "4px",
                        }}
                      >
                        {error}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.name);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: COLORS.secondaryText,
                        display: "flex",
                        padding: "8px",
                      }}
                    >
                      <svg
                        style={{ width: "20px", height: "20px" }}
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Erfolgreich hochgeladene Dateien */}
      {completedUploads.length > 0 && (
        <>
          <h3 style={{ margin: "20px 0 10px" }}>Erfolgreich hochgeladen</h3>
          <div
            style={{
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            {completedUploads.map((upload) => (
              <div
                key={upload.fileId}
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#f9fff9",
                }}
              >
                {/* Success Icon */}
                <div
                  style={{
                    marginRight: "12px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: COLORS.success,
                    borderRadius: "50%",
                    color: "white",
                  }}
                >
                  <svg
                    style={{ width: "24px", height: "24px" }}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    />
                  </svg>
                </div>

                {/* File Details */}
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>
                    {upload.fileName}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: COLORS.secondaryText,
                    }}
                  >
                    {formatFileSize(upload.size)} • ID:{" "}
                    {upload.fileId.slice(0, 8)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Aktionsbuttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <button
          onClick={handleReset}
          style={{
            padding: "10px 16px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "4px",
            backgroundColor: "white",
            color: COLORS.text,
            cursor: "pointer",
            fontSize: "14px",
            display:
              files.length > 0 || completedUploads.length > 0
                ? "block"
                : "none",
          }}
        >
          Zurücksetzen
        </button>

        <button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          style={{
            padding: "10px 24px",
            borderRadius: "4px",
            backgroundColor: files.length === 0 ? "#ccc" : COLORS.primary,
            color: "white",
            border: "none",
            cursor: files.length === 0 ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isUploading ? (
            <>
              <svg
                style={{
                  width: "18px",
                  height: "18px",
                  marginRight: "8px",
                  animation: "spin 1s linear infinite",
                }}
                viewBox="0 0 24 24"
              >
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <path
                  fill="currentColor"
                  d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8z"
                />
              </svg>
              Wird hochgeladen...
            </>
          ) : (
            <>
              <svg
                style={{ width: "18px", height: "18px", marginRight: "8px" }}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"
                />
              </svg>
              Hochladen
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploaderComponent;
