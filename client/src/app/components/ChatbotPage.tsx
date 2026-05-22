import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your DOTS Daily TB Treatment assistant. I can help answer questions about your TB medications, side effects, treatment adherence, and DOTS therapy. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Why is completing TB treatment important?",
    "What are TB medication side effects?",
    "Can I drink alcohol during treatment?",
    "What is DOTS therapy?",
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // TB-specific questions
    if (lowerMessage.includes('dots') || lowerMessage.includes('directly observed')) {
      return "DOTS stands for 'Directly Observed Treatment, Short-course':\n\n✓ A healthcare worker or trained volunteer observes you taking your TB medication\n✓ Ensures you take the correct dose at the right time\n✓ Helps prevent treatment failure and drug resistance\n✓ Provides support and monitors for side effects\n\nDOTS is the most effective strategy for curing TB. Your treatment observer is your partner in getting well!";
    } else if (lowerMessage.includes('complete') || lowerMessage.includes('finish') || lowerMessage.includes('important') || lowerMessage.includes('why')) {
      return "Completing your FULL TB treatment is critical:\n\n⚠️ Stopping early can:\n• Allow TB bacteria to become drug-resistant\n• Make you contagious again\n• Require longer, more complex treatment\n• Lead to treatment failure\n\n✓ Full treatment course (6-9 months):\n• Kills all TB bacteria\n• Prevents relapse\n• Protects your family and community\n• Ensures you're completely cured\n\nNEVER stop treatment early, even if you feel better!";
    } else if (lowerMessage.includes('side effect') || lowerMessage.includes('rifampicin') || lowerMessage.includes('isoniazid') || lowerMessage.includes('pyrazinamide') || lowerMessage.includes('ethambutol')) {
      return "Common TB medication side effects:\n\n💊 Rifampicin:\n• Orange/red urine, tears, sweat (normal, harmless)\n• Nausea, loss of appetite\n\n💊 Isoniazid:\n• Numbness/tingling in hands/feet\n• Mild nausea\n\n💊 Pyrazinamide:\n• Joint pain\n• Increased uric acid\n\n💊 Ethambutol:\n• Vision changes (REPORT IMMEDIATELY)\n\n⚠️ URGENT - Contact doctor if you have:\n• Vision changes\n• Yellow skin/eyes\n• Severe nausea/vomiting\n• Severe skin rash";
    } else if (lowerMessage.includes('alcohol') || lowerMessage.includes('drink')) {
      return "❌ Alcohol and TB Treatment DON'T MIX:\n\n• Alcohol damages your liver\n• TB medications (especially Rifampicin and Isoniazid) stress the liver\n• Combined liver damage can be severe\n• Increases risk of treatment failure\n\n✓ Best practice:\n• Avoid alcohol completely during TB treatment\n• Protects your liver\n• Improves treatment success\n• Speeds recovery\n\nYour liver needs to stay healthy to process medications effectively!";
    } else if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('empty stomach')) {
      return "TB Medication and Food:\n\n🌅 Morning medications (Rifampicin, Isoniazid):\n• Take on EMPTY stomach\n• 1 hour before breakfast OR 2 hours after\n• Maximizes absorption\n\n🍽️ Ethambutol:\n• Can be taken with food\n• Helps reduce stomach upset\n\n✓ General tips:\n• Take all medications at same time daily\n• Don't skip meals - nutrition helps healing\n• Drink plenty of water\n• Avoid fatty foods if nauseous";
    } else if (lowerMessage.includes('miss') || lowerMessage.includes('forgot') || lowerMessage.includes('skip')) {
      return "If you miss a TB medication dose:\n\n1️⃣ CONTACT your treatment supervisor or doctor immediately\n2️⃣ Don't panic - one missed dose isn't catastrophic\n3️⃣ NEVER double the dose\n4️⃣ Your doctor may need to extend your treatment\n\n✓ Prevention:\n• Set daily alarms using DOTS Daily\n• Take medications same time every day\n• Keep medications visible\n• Tell your DOTS observer if you'll miss appointment\n\n⚠️ Missing doses regularly can lead to drug-resistant TB!";
    } else if (lowerMessage.includes('contagious') || lowerMessage.includes('spread') || lowerMessage.includes('family')) {
      return "TB Contagion and Your Family:\n\n✓ Good news:\n• After 2-3 weeks of treatment, most people are no longer contagious\n• TB is spread through air when coughing/sneezing\n• Not spread by touching, sharing food, or kissing\n\n🛡️ Protect others:\n• Cover mouth when coughing\n• Open windows for ventilation\n• Complete your full treatment\n• Family members may need TB testing\n\n✓ Once you're non-contagious (doctor will confirm), normal activities can resume!";
    } else if (lowerMessage.includes('how long') || lowerMessage.includes('duration') || lowerMessage.includes('6 month') || lowerMessage.includes('treatment length')) {
      return "TB Treatment Duration:\n\n📅 Standard treatment: 6 months\n• Intensive phase: 2 months (4 drugs)\n  - Rifampicin, Isoniazid, Pyrazinamide, Ethambutol\n• Continuation phase: 4 months (2 drugs)\n  - Rifampicin, Isoniazid\n\n⏱️ Drug-resistant TB: 18-24 months\n\n✓ Your doctor determines exact duration based on:\n• Type of TB\n• Treatment response\n• Test results\n\nComplete the FULL course for cure!";
    } else if (lowerMessage.includes('orange') || lowerMessage.includes('red') || lowerMessage.includes('urine') || lowerMessage.includes('color')) {
      return "Orange/Red Body Fluids During TB Treatment:\n\n✅ This is NORMAL and HARMLESS!\n\n💊 Rifampicin causes:\n• Orange/red urine\n• Orange tears\n• Orange sweat\n• Orange saliva\n\n📝 Important notes:\n• NOT a sign of bleeding\n• Stains contact lenses (use glasses)\n• May stain clothing\n• Will return to normal after treatment ends\n\nDon't worry - it means the medication is working!";
    } else if (lowerMessage.includes('vitamin') || lowerMessage.includes('b6') || lowerMessage.includes('pyridoxine')) {
      return "Vitamin B6 (Pyridoxine) in TB Treatment:\n\n✓ Why you need it:\n• Prevents nerve damage from Isoniazid\n• Reduces numbness/tingling in hands/feet\n• Usually 25mg daily\n\n💊 Take it:\n• Same time as other TB medications\n• Throughout entire treatment\n• Even if you feel fine\n\n⚠️ Report to doctor:\n• Numbness or tingling\n• Burning sensations\n• Weakness in limbs\n\nB6 is your nerve protection!";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to support your TB treatment journey. What would you like to know about DOTS therapy, medications, or managing TB?";
    } else if (lowerMessage.includes('thank')) {
      return "You're welcome! Remember, completing your TB treatment is one of the most important things you can do for your health. Stay strong! 💙";
    } else {
      return "I understand you're asking about " + userMessage + ".\n\nI can help with TB-specific questions about:\n\n• DOTS therapy and treatment adherence\n• TB medications (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol)\n• Side effects and when to seek help\n• Treatment duration and phases\n• Living with TB during treatment\n\nWhat specific aspect would you like to know more about? Or consult your TB treatment supervisor for personalized advice.";
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-120px)]">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h1>Ask DOTS Daily</h1>
          <p className="text-muted-foreground mt-1">
            Your AI-powered health assistant for instant answers
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>DOTS Assistant</CardTitle>
                <CardDescription>Powered by AI • Private & Secure</CardDescription>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="border-t p-4">
            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your health..."
                disabled={isTyping}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              DOTS Daily provides general information. Always consult healthcare professionals for medical advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}