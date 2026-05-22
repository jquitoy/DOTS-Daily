import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MedicationsPage } from './MedicationsPage';
import { AlarmsPage } from './AlarmsPage';
import { DoseLogPage } from './DoseLogPage';
import { Pill, Bell, Camera } from 'lucide-react';

export function MedicationsHub() {
  const [activeTab, setActiveTab] = useState('medications');

  return (
    <div className="pb-20">
      {/* Tabs Navigation */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-center h-auto bg-transparent p-0 border-0">
              <TabsTrigger 
                value="medications" 
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 px-6"
              >
                <Pill className="w-4 h-4" />
                <span>Medications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alarms"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 px-6"
              >
                <Bell className="w-4 h-4" />
                <span>Alarms</span>
              </TabsTrigger>
              <TabsTrigger 
                value="dose-log"
                className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-14 px-6"
              >
                <Camera className="w-4 h-4" />
                <span>Dose Log</span>
              </TabsTrigger>
            </TabsList>
          
            <TabsContent value="medications" className="mt-0">
              <MedicationsPage />
            </TabsContent>

            <TabsContent value="alarms" className="mt-0">
              <AlarmsPage />
            </TabsContent>

            <TabsContent value="dose-log" className="mt-0">
              <DoseLogPage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}