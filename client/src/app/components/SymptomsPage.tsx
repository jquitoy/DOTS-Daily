import { useState } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ThermometerSun,
  Eye,
  Wind,
  Droplet,
  Moon,
  Weight,
  Stethoscope,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface Symptom {
  id: string;
  name: string;
  category: 'mild' | 'moderate' | 'severe';
  icon: any;
  description?: string;
}

const symptoms: Symptom[] = [
  {
    id: 'cough',
    name: 'Persistent Cough (>2 weeks)',
    category: 'moderate',
    icon: Wind,
    description: 'Cough lasting more than 2-3 weeks',
  },
  {
    id: 'cough-blood',
    name: 'Coughing up Blood',
    category: 'severe',
    icon: Droplet,
    description: 'Blood in sputum or phlegm',
  },
  {
    id: 'fever',
    name: 'Fever',
    category: 'moderate',
    icon: ThermometerSun,
    description: 'Low-grade fever, especially in evenings',
  },
  {
    id: 'night-sweats',
    name: 'Night Sweats',
    category: 'moderate',
    icon: Moon,
    description: 'Excessive sweating during sleep',
  },
  {
    id: 'weight-loss',
    name: 'Unexplained Weight Loss',
    category: 'moderate',
    icon: Weight,
    description: 'Significant weight loss without trying',
  },
  {
    id: 'fatigue',
    name: 'Fatigue & Weakness',
    category: 'mild',
    icon: Activity,
    description: 'Persistent tiredness and lack of energy',
  },
  {
    id: 'chest-pain',
    name: 'Chest Pain',
    category: 'moderate',
    icon: Stethoscope,
    description: 'Pain in chest when breathing or coughing',
  },
  {
    id: 'breathing',
    name: 'Difficulty Breathing',
    category: 'severe',
    icon: Wind,
    description: 'Shortness of breath or difficulty breathing',
  },
  {
    id: 'loss-appetite',
    name: 'Loss of Appetite',
    category: 'mild',
    icon: Activity,
    description: 'Reduced desire to eat',
  },

  // TB Medication Side Effects
  {
    id: 'vision-changes',
    name: 'Vision Changes',
    category: 'severe',
    icon: Eye,
    description: 'Blurred vision or color blindness (Ethambutol side effect)',
  },
  {
    id: 'yellow-skin',
    name: 'Yellowing of Skin/Eyes',
    category: 'severe',
    icon: AlertTriangle,
    description: 'Jaundice - possible liver problem',
  },
  {
    id: 'joint-pain',
    name: 'Joint Pain',
    category: 'moderate',
    icon: Activity,
    description: 'Pain in joints (Pyrazinamide side effect)',
  },
  {
    id: 'numbness',
    name: 'Numbness/Tingling',
    category: 'moderate',
    icon: Activity,
    description: 'Peripheral neuropathy in hands/feet',
  },
  {
    id: 'nausea',
    name: 'Severe Nausea/Vomiting',
    category: 'moderate',
    icon: Activity,
    description: 'Persistent nausea or vomiting',
  },
  {
    id: 'rash',
    name: 'Severe Skin Rash',
    category: 'severe',
    icon: Activity,
    description: 'Allergic reaction to medication',
  },
];

export function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId],
    );
    setShowResults(false);
  };

  const handleCheck = () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }
    setShowResults(true);
    toast.success('Symptom analysis complete');
  };

  const getSeverityLevel = () => {
    const selectedSymptomDetails = symptoms.filter((s) =>
      selectedSymptoms.includes(s.id),
    );

    if (selectedSymptomDetails.some((s) => s.category === 'severe')) {
      return 'severe';
    } else if (selectedSymptomDetails.some((s) => s.category === 'moderate')) {
      return 'moderate';
    } else {
      return 'mild';
    }
  };

  const getRecommendation = () => {
    const severity = getSeverityLevel();
    const selectedSymptomDetails = symptoms.filter((s) =>
      selectedSymptoms.includes(s.id),
    );

    // Check for specific critical symptoms
    const hasCoughingBlood = selectedSymptoms.includes('cough-blood');
    const hasVisionChanges = selectedSymptoms.includes('vision-changes');
    const hasJaundice = selectedSymptoms.includes('yellow-skin');
    const hasSevereRash = selectedSymptoms.includes('rash');
    const hasDifficultyBreathing = selectedSymptoms.includes('breathing');

    if (
      hasCoughingBlood ||
      hasVisionChanges ||
      hasJaundice ||
      hasSevereRash ||
      hasDifficultyBreathing
    ) {
      return {
        level: 'URGENT - Contact Your TB Doctor Immediately',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        message:
          'You are experiencing serious symptoms that require immediate medical attention. These could indicate TB progression or severe medication side effects.',
        actions: [
          'Contact your TB treatment supervisor or doctor RIGHT NOW',
          hasCoughingBlood && 'Coughing blood requires urgent evaluation',
          hasVisionChanges &&
            'Vision changes may indicate Ethambutol toxicity - STOP medication and call doctor',
          hasJaundice &&
            'Yellowing skin/eyes may indicate liver damage - seek immediate care',
          hasSevereRash &&
            'Severe rash may be an allergic reaction - seek immediate care',
          'Do NOT stop your TB medications without doctor approval (except for vision changes)',
          'Go to emergency room if doctor is unavailable',
        ].filter(Boolean),
      };
    } else if (severity === 'moderate') {
      return {
        level: 'Contact Your Healthcare Provider',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        message:
          'Your symptoms should be evaluated by your TB treatment team. These may be normal side effects, but should be monitored.',
        actions: [
          'Schedule an appointment with your TB doctor within 24-48 hours',
          'Continue taking your medications as prescribed unless told otherwise',
          'Monitor symptoms - seek urgent care if they worsen',
          'Document when symptoms occur and their severity',
          'Ask about symptom management strategies',
        ],
      };
    } else {
      return {
        level: 'Monitor and Report',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Info,
        message:
          'These symptoms are common during TB treatment. Continue your medications and monitor for changes.',
        actions: [
          'Continue taking all TB medications as prescribed',
          'Mention symptoms at your next scheduled appointment',
          'Stay hydrated and get adequate rest',
          'Maintain good nutrition to support healing',
          'Contact your doctor if symptoms worsen or new symptoms appear',
        ],
      };
    }
  };

  const categoryGroups = {
    tbSymptoms: symptoms.slice(0, 9),
    medicationSideEffects: symptoms.slice(9),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      <div>
        <h1>TB Symptom Checker</h1>
        <p className="text-muted-foreground mt-1">
          Track TB symptoms and medication side effects for early intervention
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50/50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Important:</strong> This tool helps you monitor your TB
          treatment journey. It does NOT replace professional medical advice.
          Always contact your TB treatment supervisor or doctor with concerns.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Symptoms</CardTitle>
          <CardDescription>
            Choose all symptoms you're currently experiencing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* TB Disease Symptoms */}
          <div>
            <h3 className="mb-3 flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              TB Disease Symptoms
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {categoryGroups.tbSymptoms.map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptoms.includes(symptom.id);

                return (
                  <div
                    key={symptom.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => handleSymptomToggle(symptom.id)}
                  >
                    <Checkbox
                      id={symptom.id}
                      checked={isSelected}
                      onCheckedChange={() => handleSymptomToggle(symptom.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <Label htmlFor={symptom.id} className="cursor-pointer">
                          {symptom.name}
                        </Label>
                        <Badge
                          variant={
                            symptom.category === 'severe'
                              ? 'destructive'
                              : symptom.category === 'moderate'
                                ? 'default'
                                : 'secondary'
                          }
                          className="ml-auto text-xs"
                        >
                          {symptom.category}
                        </Badge>
                      </div>
                      {symptom.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {symptom.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Medication Side Effects */}
          <div>
            <h3 className="mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Medication Side Effects
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {categoryGroups.medicationSideEffects.map((symptom) => {
                const Icon = symptom.icon;
                const isSelected = selectedSymptoms.includes(symptom.id);

                return (
                  <div
                    key={symptom.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent'
                    }`}
                    onClick={() => handleSymptomToggle(symptom.id)}
                  >
                    <Checkbox
                      id={symptom.id}
                      checked={isSelected}
                      onCheckedChange={() => handleSymptomToggle(symptom.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <Label htmlFor={symptom.id} className="cursor-pointer">
                          {symptom.name}
                        </Label>
                        <Badge
                          variant={
                            symptom.category === 'severe'
                              ? 'destructive'
                              : symptom.category === 'moderate'
                                ? 'default'
                                : 'secondary'
                          }
                          className="ml-auto text-xs"
                        >
                          {symptom.category}
                        </Badge>
                      </div>
                      {symptom.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {symptom.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe any other symptoms or details about when they occur..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={handleCheck}
            className="w-full"
            disabled={selectedSymptoms.length === 0}
          >
            Analyze Symptoms
          </Button>
        </CardContent>
      </Card>

      {showResults && (
        <Card
          className={`${getRecommendation().bgColor} border-2 ${getRecommendation().borderColor}`}
        >
          <CardHeader>
            <div className="flex items-start gap-4">
              {(() => {
                const Icon = getRecommendation().icon;
                return (
                  <Icon className={`w-8 h-8 ${getRecommendation().color}`} />
                );
              })()}
              <div className="flex-1">
                <CardTitle className={getRecommendation().color}>
                  {getRecommendation().level}
                </CardTitle>
                <CardDescription className="mt-2 text-foreground">
                  {getRecommendation().message}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recommended Actions:</h4>
              <ul className="space-y-2">
                {getRecommendation().actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2
                      className={`w-5 h-5 ${getRecommendation().color} flex-shrink-0 mt-0.5`}
                    />
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Your Selected Symptoms:</h4>
              <div className="flex flex-wrap gap-2">
                {symptoms
                  .filter((s) => selectedSymptoms.includes(s.id))
                  .map((symptom) => (
                    <Badge key={symptom.id} variant="outline">
                      {symptom.name}
                    </Badge>
                  ))}
              </div>
              {additionalNotes && (
                <div className="mt-3">
                  <h4 className="font-medium mb-1">Additional Notes:</h4>
                  <p className="text-sm text-muted-foreground">
                    {additionalNotes}
                  </p>
                </div>
              )}
            </div>

            <Alert className="bg-white/50">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Remember:</strong> Never stop your TB medications
                without consulting your doctor, even if you feel better or
                experience side effects. Stopping treatment early can lead to
                drug-resistant TB.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
