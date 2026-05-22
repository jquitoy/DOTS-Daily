import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Pill,
  Clock,
  Video,
  Circle
} from 'lucide-react';

interface Alarm {
  id: string;
  medicationName: string;
  time: string;
  dosage: string;
}

interface AlarmNotificationScreenProps {
  alarm: Alarm;
  onDismiss: () => void;
  onComplete: (photoUrl: string, videoUrl: string) => void;
}

export function AlarmNotificationScreen({ 
  alarm, 
  onDismiss, 
  onComplete 
}: AlarmNotificationScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'detected' | 'verified'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  // Simulate camera activation
  useEffect(() => {
    if (isCameraActive) {
      setDetectionStatus('idle');
    }
  }, [isCameraActive]);

  // Recording timer
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = () => {
    setIsCameraActive(true);
    // Simulate medicine detection after 2 seconds
    setTimeout(() => {
      setDetectionStatus('detecting');
    }, 2000);
    
    setTimeout(() => {
      setDetectionStatus('detected');
    }, 4000);
  };

  const startRecording = () => {
    if (detectionStatus !== 'detected') return;
    
    setIsRecording(true);
    // Take a photo immediately
    setCapturedPhoto(`photo_${Date.now()}`);
    
    // Auto-complete after 5 seconds of recording
    setTimeout(() => {
      stopRecording();
    }, 5000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    const videoUrl = `video_${Date.now()}`;
    setRecordedVideo(videoUrl);
    setDetectionStatus('verified');
  };

  const handleComplete = () => {
    if (capturedPhoto && recordedVideo) {
      onComplete(capturedPhoto, recordedVideo);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 animate-pulse">
            <Pill className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Time to Take Your Medication</h2>
          <p className="text-white/70 text-lg">{alarm.medicationName}</p>
          <p className="text-white/50 text-sm mt-1">{alarm.dosage} • {alarm.time}</p>
        </div>

        {/* Camera View */}
        {!isCameraActive ? (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm p-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Verify Your Dose
                </h3>
                <p className="text-white/70 text-sm">
                  Start the camera to detect your medication and record yourself taking it
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={startCamera}
                  className="w-full h-12 text-base"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Camera
                </Button>
                <Button 
                  onClick={onDismiss}
                  variant="outline"
                  className="w-full h-12 text-base bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5 mr-2" />
                  Skip for Now
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
              {/* Simulated camera feed */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full border-4 border-dashed border-primary/50 flex items-center justify-center mb-4">
                    <Pill className="w-16 h-16 text-primary/50" />
                  </div>
                  {detectionStatus === 'idle' && (
                    <p className="text-white/50">Position medication in view</p>
                  )}
                  {detectionStatus === 'detecting' && (
                    <p className="text-yellow-400 animate-pulse">Detecting medication...</p>
                  )}
                  {detectionStatus === 'detected' && (
                    <p className="text-green-400 font-semibold">✓ Medication Detected!</p>
                  )}
                  {detectionStatus === 'verified' && (
                    <p className="text-green-400 font-semibold">✓ Dose Verified!</p>
                  )}
                </div>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-2 rounded-full">
                  <Circle className="w-3 h-3 fill-white animate-pulse" />
                  <span className="text-white text-sm font-semibold">{formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Detection status indicator */}
              <div className="absolute top-4 right-4">
                {detectionStatus === 'detecting' && (
                  <div className="bg-yellow-500 px-3 py-2 rounded-full">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                {(detectionStatus === 'detected' || detectionStatus === 'verified') && (
                  <div className="bg-green-500 px-3 py-2 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Recording button */}
              {!isRecording && !recordedVideo && detectionStatus === 'detected' && (
                <div className="absolute bottom-6 inset-x-0 flex justify-center">
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-red-500 border-4 border-white shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <Video className="w-8 h-8 text-white" />
                  </button>
                </div>
              )}

              {/* Stop recording button */}
              {isRecording && (
                <div className="absolute bottom-6 inset-x-0 flex justify-center">
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 rounded-full bg-white border-4 border-red-500 shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {detectionStatus === 'verified' && recordedVideo && (
                <Button 
                  onClick={handleComplete}
                  className="w-full h-12 text-base bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Confirm Dose Taken
                </Button>
              )}
              
              <Button 
                onClick={onDismiss}
                variant="outline"
                className="w-full h-12 text-base bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
            </div>

            {/* Instructions */}
            {detectionStatus === 'detected' && !isRecording && !recordedVideo && (
              <Card className="bg-primary/20 border-primary/30 p-4">
                <p className="text-white text-sm text-center">
                  <strong>Ready!</strong> Tap the record button, take your medication on camera, then stop recording
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
