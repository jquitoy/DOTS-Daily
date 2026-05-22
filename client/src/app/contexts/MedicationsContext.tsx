import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy?: string;
  startDate: string;
  endDate?: string;
  reminderTimes: string[];
  color?: string;
}

export interface Alarm {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  enabled: boolean;
  days: string[];
  lastTaken?: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  timestamp: string;
  verified: boolean;
  photoUrl?: string;
  videoUrl?: string;
  notes?: string;
}

interface MedicationsContextType {
  medications: Medication[];
  alarms: Alarm[];
  doseLogs: DoseLog[];
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  toggleAlarm: (id: string) => void;
  addDoseLog: (log: Omit<DoseLog, 'id'>) => void;
  deleteDoseLog: (id: string) => void;
}

const MedicationsContext = createContext<MedicationsContextType | undefined>(undefined);

// Mock data
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Rifampicin',
    dosage: '600mg',
    frequency: 'Once daily',
    instructions: 'Take on empty stomach, 1 hour before breakfast. May cause orange/red discoloration of urine.',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2024-01-01',
    endDate: '2024-07-01',
    reminderTimes: ['07:00'],
    color: '#dc2626',
  },
  {
    id: '2',
    name: 'Isoniazid',
    dosage: '300mg',
    frequency: 'Once daily',
    instructions: 'Take on empty stomach with Rifampicin. Avoid alcohol.',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2024-01-01',
    endDate: '2024-07-01',
    reminderTimes: ['07:00'],
    color: '#2563eb',
  },
  {
    id: '3',
    name: 'Pyrazinamide',
    dosage: '1500mg',
    frequency: 'Once daily',
    instructions: 'Take with other TB medications. Monitor for joint pain.',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2024-01-01',
    endDate: '2024-03-01',
    reminderTimes: ['07:00'],
    color: '#16a34a',
  },
  {
    id: '4',
    name: 'Ethambutol',
    dosage: '1200mg',
    frequency: 'Once daily',
    instructions: 'Take with food. Report any vision changes immediately.',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2024-01-01',
    endDate: '2024-03-01',
    reminderTimes: ['07:00'],
    color: '#9333ea',
  },
  {
    id: '5',
    name: 'Pyridoxine (Vitamin B6)',
    dosage: '25mg',
    frequency: 'Once daily',
    instructions: 'Prevents nerve damage from Isoniazid. Take with TB medications.',
    prescribedBy: 'Dr. Sarah Johnson',
    startDate: '2024-01-01',
    endDate: '2024-07-01',
    reminderTimes: ['07:00'],
    color: '#f59e0b',
  },
];

export function MedicationsProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>(() => {
    const stored = localStorage.getItem('doti_medications');
    return stored ? JSON.parse(stored) : mockMedications;
  });

  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const stored = localStorage.getItem('doti_alarms');
    if (stored) return JSON.parse(stored);
    
    // Generate alarms from medications
    const generatedAlarms: Alarm[] = [];
    mockMedications.forEach(med => {
      med.reminderTimes.forEach(time => {
        generatedAlarms.push({
          id: `${med.id}-${time}`,
          medicationId: med.id,
          medicationName: `${med.name} ${med.dosage}`,
          time,
          enabled: true,
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        });
      });
    });
    return generatedAlarms;
  });

  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => {
    const stored = localStorage.getItem('doti_dose_logs');
    if (stored) return JSON.parse(stored);
    
    // Generate sample dose logs
    return [
      {
        id: '1',
        medicationId: '1',
        medicationName: 'Rifampicin 600mg',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        verified: true,
      },
      {
        id: '2',
        medicationId: '2',
        medicationName: 'Isoniazid 300mg',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        verified: true,
      },
      {
        id: '3',
        medicationId: '4',
        medicationName: 'Ethambutol 1200mg',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        verified: false,
        notes: 'Taken with breakfast',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('doti_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('doti_alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    localStorage.setItem('doti_dose_logs', JSON.stringify(doseLogs));
  }, [doseLogs]);

  const addMedication = (medication: Omit<Medication, 'id'>) => {
    const newMed: Medication = {
      ...medication,
      id: Math.random().toString(36).substr(2, 9),
    };
    setMedications([...medications, newMed]);

    // Create alarms for the new medication
    const newAlarms = medication.reminderTimes.map(time => ({
      id: `${newMed.id}-${time}`,
      medicationId: newMed.id,
      medicationName: `${medication.name} ${medication.dosage}`,
      time,
      enabled: true,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    }));
    setAlarms([...alarms, ...newAlarms]);
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, ...updates } : med
    ));
  };

  const deleteMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
    setAlarms(alarms.filter(alarm => alarm.medicationId !== id));
  };

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map(alarm =>
      alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
    ));
  };

  const addDoseLog = (log: Omit<DoseLog, 'id'>) => {
    const newLog: DoseLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
    };
    setDoseLogs([newLog, ...doseLogs]);
  };

  const deleteDoseLog = (id: string) => {
    setDoseLogs(doseLogs.filter(log => log.id !== id));
  };

  return (
    <MedicationsContext.Provider
      value={{
        medications,
        alarms,
        doseLogs,
        addMedication,
        updateMedication,
        deleteMedication,
        toggleAlarm,
        addDoseLog,
        deleteDoseLog,
      }}
    >
      {children}
    </MedicationsContext.Provider>
  );
}

export function useMedications() {
  const context = useContext(MedicationsContext);
  if (context === undefined) {
    throw new Error('useMedications must be used within a MedicationsProvider');
  }
  return context;
}