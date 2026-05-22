import { useState } from 'react';
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
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Pill, Plus, Edit2, Trash2, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function MedicationsPage() {
  const { medications, addMedication, deleteMedication } = useMedications();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    prescribedBy: '',
    startDate: new Date().toISOString().split('T')[0],
    reminderTimes: ['08:00'],
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedication(formData);
    toast.success('Medication added successfully');
    setDialogOpen(false);
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      instructions: '',
      prescribedBy: '',
      startDate: new Date().toISOString().split('T')[0],
      reminderTimes: ['08:00'],
      color: '#3b82f6',
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMedication(id);
      toast.success('Medication deleted');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>My Medications</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medication list
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Enter the details of your medication
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    placeholder="e.g., 10mg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    placeholder="e.g., Twice daily"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="prescribedBy">Prescribed By</Label>
                  <Input
                    id="prescribedBy"
                    value={formData.prescribedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, prescribedBy: e.target.value })
                    }
                    placeholder="e.g., Dr. Smith"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    placeholder="e.g., Take with food"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit">Add Medication</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Pill className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="mb-2">No medications yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first medication
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medications.map((med) => (
            <Card key={med.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: med.color || '#3b82f6' }}
                    >
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{med.name}</CardTitle>
                      <CardDescription>{med.dosage}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDelete(med.id, med.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{med.frequency}</span>
                </div>
                {med.reminderTimes && med.reminderTimes.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {med.reminderTimes.map((time, index) => (
                        <Badge key={index} variant="secondary">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {med.instructions && (
                  <p className="text-sm text-muted-foreground border-t pt-3">
                    {med.instructions}
                  </p>
                )}
                {med.prescribedBy && (
                  <p className="text-xs text-muted-foreground">
                    Prescribed by {med.prescribedBy}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
