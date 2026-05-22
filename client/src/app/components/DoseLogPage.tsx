import { useState, useRef } from 'react';
import { useMedications } from '../contexts/MedicationsContext';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Camera,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export function DoseLogPage() {
  const { medications, doseLogs, addDoseLog, deleteDoseLog } = useMedications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState('');
  const [notes, setNotes] = useState('');
  const [captureType, setCaptureType] = useState<'photo' | 'video' | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileCapture = (type: 'photo' | 'video') => {
    setCaptureType(type);
    // In a real app, this would open the camera
    // For prototype, we'll just simulate file selection
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success(`${captureType === 'photo' ? 'Photo' : 'Video'} captured`);
    }
  };

  const handleSubmit = () => {
    if (!selectedMedication) {
      toast.error('Please select a medication');
      return;
    }

    const medication = medications.find((m) => m.id === selectedMedication);
    if (!medication) return;

    addDoseLog({
      medicationId: medication.id,
      medicationName: `${medication.name} ${medication.dosage}`,
      timestamp: new Date().toISOString(),
      verified: !!previewUrl,
      photoUrl: captureType === 'photo' ? previewUrl || undefined : undefined,
      videoUrl: captureType === 'video' ? previewUrl || undefined : undefined,
      notes: notes || undefined,
    });

    toast.success('Dose logged successfully');
    setDialogOpen(false);
    setSelectedMedication('');
    setNotes('');
    setCaptureType(null);
    setPreviewUrl(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dose log?')) {
      deleteDoseLog(id);
      toast.success('Dose log deleted');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Dose Log</h1>
          <p className="text-muted-foreground mt-1">
            Document your medication intake with photo or video verification
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Camera className="w-4 h-4" />
              Log Dose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log a Dose</DialogTitle>
              <DialogDescription>
                Record your medication intake with optional photo or video
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication *</Label>
                <Select
                  value={selectedMedication}
                  onValueChange={setSelectedMedication}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name} {med.dosage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Capture Evidence (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={captureType === 'photo' ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => handleFileCapture('photo')}
                  >
                    <Camera className="w-4 h-4" />
                    Photo
                  </Button>
                  <Button
                    type="button"
                    variant={captureType === 'video' ? 'default' : 'outline'}
                    className="gap-2"
                    onClick={() => handleFileCapture('video')}
                  >
                    <Video className="w-4 h-4" />
                    Video
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={captureType === 'photo' ? 'image/*' : 'video/*'}
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl && (
                  <div className="mt-2 p-3 border rounded-lg bg-accent flex items-center gap-2">
                    {captureType === 'photo' ? (
                      <ImageIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <Video className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-sm">
                      {captureType === 'photo' ? 'Photo' : 'Video'} captured
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this dose..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSubmit}>Log Dose</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {doseLogs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">No doses logged yet</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting your medication intake
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Camera className="w-4 h-4 mr-2" />
              Log Your First Dose
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Your dose logging summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center">
                  <p className="text-3xl font-semibold">{doseLogs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold">
                    {doseLogs.filter((log) => log.verified).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold">
                    {Math.round(
                      (doseLogs.filter((log) => log.verified).length /
                        doseLogs.length) *
                        100,
                    )}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verification Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
              <CardDescription>Your medication intake history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          log.verified ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        {log.photoUrl ? (
                          <ImageIcon
                            className={`w-5 h-5 ${log.verified ? 'text-green-600' : 'text-gray-400'}`}
                          />
                        ) : log.videoUrl ? (
                          <Video
                            className={`w-5 h-5 ${log.verified ? 'text-green-600' : 'text-gray-400'}`}
                          />
                        ) : log.notes ? (
                          <FileText
                            className={`w-5 h-5 ${log.verified ? 'text-green-600' : 'text-gray-400'}`}
                          />
                        ) : (
                          <Camera
                            className={`w-5 h-5 ${log.verified ? 'text-green-600' : 'text-gray-400'}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{log.medicationName}</p>
                          {log.verified && (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </p>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive h-8 w-8 p-0"
                      onClick={() => handleDelete(log.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
