import React, { useState, useRef, useCallback, type DragEvent } from "react";
import { FileUploader } from "./file-upload-api";

// Typdefinitionen
interface UploadProgress {
  fileName: string;
  percentage: number;
  uploaded?: number;
  total?: number;
}

interface UploadResult {
  success: boolean;
  fileName: string;
  fileId: string;
  size: number;
}

interface FileUploaderProps {
  baseUrl?: string;
  bucketId?: string;
  token?: string | null;
  temporaryUrlToken?: string | null;
  chunkSize?: number;
  concurrentUploads?: number;
  maxFiles?: number;
  acceptedFileTypes?: string;
  maxFileSize?: number;
}

interface FileWithProgress extends File {
  id?: string;
}

// Farben-Konstante
const COLORS = {
  primary: "#3498db",
  success: "#2ecc71",
  error: "#e74c3c",
  background: "#f9f9f9",
  border: "#ddd",
  text: "#333",
  secondaryText: "#666",
};

const FileUploaderComponent: React.FC<FileUploaderProps> = ({
  baseUrl = "https://api.example.com",
  bucketId = "default-bucket",
  token = null,
  temporaryUrlToken = null,
  chunkSize = 5 * 1024 * 1024, // 5MB default
  concurrentUploads = 3,
  maxFiles = 10,
  acceptedFileTypes = "*",
  maxFileSize = 100 * 1024 * 1024, // 100MB
}) => {
  // Zustände mit Typen
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [uploads, setUploads] = useState<Record<string, UploadProgress>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [completedUploads, setCompletedUploads] = useState<UploadResult[]>([]);

  // Refs mit Typen
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploaderRef = useRef<FileUploader>(null);

  // Uploader-Initialisierung
  if (!uploaderRef.current) {
    uploaderRef.current = new FileUploader({
      baseUrl,
      token,
      temporaryUrlToken,
      chunkSize,
      concurrentUploads,
      onProgress: (progress: UploadProgress) => {
        setUploads((prev) => ({
          ...prev,
          [progress.fileName]: progress,
        }));
      },
    });
  }

  // Drag & Drop Handler
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Dateiverarbeitung
  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles = Array.from(fileList);
      const validFiles: File[] = [];
      const newErrors: Record<string, string> = {};

      newFiles.forEach((file) => {
        if (files.length + validFiles.length >= maxFiles) {
          newErrors[file.name] = `Maximale Anzahl von ${maxFiles} Dateien überschritten`;
          return;
        }

        if (file.size > maxFileSize) {
          newErrors[file.name] = `Datei ist zu groß (max. ${(maxFileSize / (1024 * 1024)).toFixed(0)} MB)`;
          return;
        }

        if (files.some((f) => f.name === file.name)) {
          newErrors[file.name] = "Datei bereits ausgewählt";
          return;
        }

        validFiles.push(file);
      });

      setErrors((prev) => ({ ...prev, ...newErrors }));
      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files, maxFiles, maxFileSize]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  // Datei-Input Handler
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
    },
    [processFiles]
  );

  // Upload-Logik
  const handleUpload = useCallback(async () => {
    if (!files.length || isUploading || !uploaderRef.current) return;

    setIsUploading(true);
    setErrors({});

    try {
      const results = await uploaderRef.current.uploadFiles(bucketId, files);
      const newErrors: Record<string, string> = {};
      const successfulUploads: UploadResult[] = [];

      results.forEach((result) => {
        if (!result.success) {
          newErrors[result.fileName] = "Upload fehlgeschlagen";
        } else {
          successfulUploads.push(result);
        }
      });

      setErrors(newErrors);
      setCompletedUploads((prev) => [...prev, ...successfulUploads]);
      setFiles((prev) => prev.filter((f) => !successfulUploads.some((u) => u.fileName === f.name)));
    } catch (error) {
      setErrors({ general: "Ein unerwarteter Fehler ist aufgetreten" });
    } finally {
      setIsUploading(false);
      window.location.reload();
    }
  }, [files, isUploading, bucketId]);

  // Hilfsfunktionen
  const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
  };

  // Render-Logik (identisch zur JS-Version, aber mit TypeScript-Typen)
  return (
    <div style={{ /* ... */ }}>
      {/* UI-Code unverändert */}
    </div>
  );
};

export default FileUploaderComponent;