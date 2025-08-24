import React, { useState } from 'react';
import { streamGeminiResponse } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

const CoTView: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [standardResponse, setStandardResponse] = useState<string>('');
  const [cotResponse, setCotResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setHasGenerated(true);
    setStandardResponse('');
    setCotResponse('');

    const streamStandard = async () => {
      const stream = streamGeminiResponse(prompt, false);
      for await (const chunk of stream) {
        setStandardResponse((prev) => prev + chunk);
      }
    };

    const streamCoT = async () => {
      const stream = streamGeminiResponse(prompt, true);
      for await (const chunk of stream) {
        setCotResponse((prev) => prev + chunk);
      }
    };

    await Promise.all([streamStandard(), streamCoT()]);
    setIsLoading(false);
  };

  const ResponseCard: React.FC<{title: string; content: string; isLoading: boolean}> = ({ title, content, isLoading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] flex-1 flex flex-col min-w-0">
        <h3 className="text-lg font-bold p-4 border-b border-[#E5E5E5] text-[#E60F1D]">{title}</h3>
        <div className="p-4 overflow-y-auto h-full min-h-[300px]">
            <p className="text-[#222222] whitespace-pre-wrap font-mono text-sm">
                {content}
                {isLoading && !content && <span className="animate-pulse">Generating...</span>}
                {isLoading && content && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>}
            </p>
        </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white p-6 rounded-xl shadow-md border border-[#E5E5E5]">
        <h2 className="text-xl font-bold mb-4 text-[#222222]">Compare Standard vs. Chain of Thought Prompting</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g., Why is the sky blue?"
            className="flex-grow bg-[#F5F4F2] text-[#222222] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E60F1D] transition border border-[#E5E5E5]"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center gap-2 bg-[#E60F1D] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#CF0E1B] active:bg-[#B90C18] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E60F1D]/80"
          >
            <SparklesIcon className="w-5 h-5" />
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      
      {hasGenerated && (
        <div className="flex flex-col md:flex-row gap-8">
            <ResponseCard title="Standard Response" content={standardResponse} isLoading={isLoading} />
            <ResponseCard title="Chain of Thought Response" content={cotResponse} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default CoTView;