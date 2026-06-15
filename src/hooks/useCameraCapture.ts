import { useState, useRef, useCallback } from 'react';
import { compressImage, autoCropImage } from '@/utils/image';

interface UseCameraCaptureOptions {
  autoCrop?: boolean;
  maxWidth?: number;
  quality?: number;
}

interface UseCameraCaptureReturn {
  isStreaming: boolean;
  capturedImage: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<string | null>;
  retakePhoto: () => void;
  error: string | null;
}

export const useCameraCapture = (
  options: UseCameraCaptureOptions = {}
): UseCameraCaptureReturn => {
  const { autoCrop = false, maxWidth = 1200, quality = 0.8 } = options;
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      setError('无法访问摄像头，请确保已授予权限');
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return null;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      let imageDataUrl = canvas.toDataURL('image/jpeg', quality);

      if (autoCrop) {
        try {
          imageDataUrl = await autoCropImage(imageDataUrl);
        } catch (cropErr) {
          console.warn('Auto crop failed, using original image:', cropErr);
        }
      }

      const compressedImage = await compressImage(
        dataURLtoFile(imageDataUrl, 'capture.jpg'),
        maxWidth,
        quality
      );

      setCapturedImage(compressedImage);
      stopCamera();
      return compressedImage;
    } catch (err) {
      setError('拍照失败，请重试');
      console.error('Capture error:', err);
      return null;
    }
  }, [autoCrop, maxWidth, quality, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  return {
    isStreaming,
    capturedImage,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    error,
  };
};

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
