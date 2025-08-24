import React, { useState } from 'react';
import { Tab } from './types';
import CoTView from './components/CoTView';
import RagView from './components/RagView';
import { BrainIcon } from './components/icons/BrainIcon';
import { DocumentIcon } from './components/icons/DocumentIcon';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CoT);

  const renderTabContent = () => {
    switch (activeTab) {
      case Tab.CoT:
        return <CoTView />;
      case Tab.RAG:
        return <RagView />;
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{tab: Tab; label: string; icon: React.ReactNode}> = ({tab, label, icon}) => {
    const isActive = activeTab === tab;
    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E60F1D]/50 ${
            isActive
                ? 'bg-[#E60F1D] text-white shadow-md'
                : 'bg-white text-[#6B6B6B] hover:bg-[#F5F4F2] border border-transparent hover:border-[#E5E5E5]'
            }`}
        >
            {icon}
            {label}
        </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#EFE5DA] text-[#222222] font-sans flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#E60F1D]">
            컨텍스트 엔지니어링 실습 1
          </h1>
          <p className="mt-2 text-lg text-[#6B6B6B]">
            Chain of Thought와 RAG 프로세스를 시각적으로 탐색합니다.
          </p>
        </header>

        <nav className="flex justify-center mb-8 bg-white/60 backdrop-blur-sm p-2 rounded-xl shadow-sm max-w-md mx-auto sticky top-4 z-10">
          <div className="flex space-x-2">
             <TabButton tab={Tab.CoT} label="Chain of Thought (CoT)" icon={<BrainIcon className="w-5 h-5" />} />
             <TabButton tab={Tab.RAG} label="RAG Visualization" icon={<DocumentIcon className="w-5 h-5" />} />
          </div>
        </nav>

        <main>
          {renderTabContent()}
        </main>
      </div>
      <footer className="text-center py-4 text-xs text-[#6B6B6B] border-t border-[#E5E5E5]">
        만든사람 단국대학교 리모델링연구소 허석재 박사 (mill@dankook.ac.kr)
      </footer>
    </div>
  );
};

export default App;