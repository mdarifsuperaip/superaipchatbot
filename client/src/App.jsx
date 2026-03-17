import React from 'react';
import Chatbot from './components/Chatbot';
import { Sparkles } from 'lucide-react';

const App = () => {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-[#050505] overflow-hidden font-sans">
      




      {/* The Chatbot remains the primary interaction point */}
      <Chatbot />
    </div>
  );
};

export default App;
