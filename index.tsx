import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// =================================================================
// 타입 (from types.ts)
// =================================================================
enum Tab {
  CoT = 'CoT',
  RAG = 'RAG'
}

interface RagDocument {
  id: number;
  content: string;
}

// =================================================================
// 아이콘 (from components/icons/*.tsx)
// =================================================================
const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
    />
  </svg>
);

const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
    />
  </svg>
);

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);

const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" 
    />
  </svg>
);

const ArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
    />
  </svg>
);


// =================================================================
// 상수 (from constants.ts)
// =================================================================
const RAG_KNOWLEDGE_BASE: RagDocument[] = [
  {
    id: 1,
    content: 'The Eiffel Tower, constructed from 1887 to 1889 as the centerpiece of the 1889 World\'s Fair, is located in Paris, France. It was designed by Gustave Eiffel and stands 330 meters tall.'
  },
  {
    id: 2,
    content: 'Photosynthesis is a critical biological process used by plants, algae, and some bacteria to convert light energy into chemical energy. This process transforms carbon dioxide and water into glucose (sugar) and releases oxygen as a byproduct.'
  },
  {
    id: 3,
    content: 'Neil Armstrong was the first human to walk on the Moon. This historic event occurred on July 20, 1969, during NASA\'s Apollo 11 mission. His first words on the lunar surface were, "That\'s one small step for [a] man, one giant leap for mankind."'
  },
  {
    id: 4,
    content: 'The Amazon River in South America is the largest river by discharge volume of water in the world, and by some definitions, it is the longest. It flows through Brazil, Colombia, Peru, and other countries.'
  }
];

// =================================================================
// 서비스 (from services/geminiService.ts)
// =================================================================
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function* streamGeminiResponse(prompt: string, useCoT: boolean) {
    const model = 'gemini-2.5-flash';
    let fullPrompt = prompt;

    if (useCoT) {
        fullPrompt = `Please think step by step before answering the following question. First, provide your detailed reasoning process. After your reasoning, clearly label the final answer with "Final Answer:".\n\nQuestion: ${prompt}`;
    }

    try {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: fullPrompt,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error in streamGeminiResponse:", error);
        yield "An error occurred while communicating with the Gemini API. Please check the console for details.";
    }
}


async function generateRAGResponse(prompt: string, context: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const fullPrompt = `Based on the following context, please answer the question. If the context does not contain the answer, say that you cannot answer based on the provided information.\n\nContext:\n---\n${context}\n---\n\nQuestion: ${prompt}`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating RAG response:", error);
        return "An error occurred while generating the response.";
    }
}

// =================================================================
// 컴포넌트 (from components/*.tsx)
// =================================================================
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

type AnimationState = 'idle' | 'indexing' | 'embedding_prompt' | 'searching' | 'retrieving' | 'generating' | 'done';

const ProcessBlock: React.FC<{
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, isActive, children, className }) => (
    <div className={`flex-1 w-full bg-[#F1ECE7] rounded-xl border-2 transition-all duration-500 flex flex-col min-h-[200px] ${isActive ? 'border-[#E60F1D] opacity-100 shadow-lg shadow-[#E60F1D]/20' : 'border-[#E5E5E5] opacity-70'} ${className}`}>
        <h3 className="font-bold text-[#E60F1D] p-3 border-b border-[#E5E5E5] flex items-center gap-2 text-sm">
            {icon}
            {title}
        </h3>
        <div className="p-4 text-sm text-[#222222] flex-grow">
            {children}
        </div>
    </div>
);

const RagView: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [relevantDoc, setRelevantDoc] = useState<RagDocument | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [docVectors, setDocVectors] = useState<Record<number, string>>({});
  const [promptVector, setPromptVector] = useState<string>('');

  const generateMockVector = (seed: string, length = 32) => {
      let hash = 0;
      if (seed.length === 0) return ''.padStart(length, '0');
      for (let i = 0; i < seed.length; i++) {
          const char = seed.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash |= 0; // Convert to 32bit integer
      }

      let vector = '';
      for (let i = 0; i < length; i++) {
          hash = (hash << 1) | (hash >> 31); // Rotate left
          vector += (hash & 1);
      }
      return vector;
  };

  useEffect(() => {
    const vectors: Record<number, string> = {};
    RAG_KNOWLEDGE_BASE.forEach(doc => {
      vectors[doc.id] = generateMockVector(doc.content);
    });
    setDocVectors(vectors);
  }, []);

  const resetState = () => {
    setAnimationState('idle');
    setRelevantDoc(null);
    setFinalAnswer('');
    setIsLoading(false);
    setPromptVector('');
  };
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoading) {
        const timeouts: Record<AnimationState, {next: AnimationState, duration: number}> = {
            idle: { next: 'indexing', duration: 0},
            indexing: { next: 'embedding_prompt', duration: 1500},
            embedding_prompt: { next: 'searching', duration: 1000},
            searching: { next: 'retrieving', duration: 1500},
            retrieving: { next: 'generating', duration: 1500},
            generating: { next: 'done', duration: 0}, // API call duration is separate
            done: { next: 'done', duration: 0},
        };
        
        const currentState = timeouts[animationState];
        if (currentState.next !== 'done') {
            timer = setTimeout(() => {
                if(animationState === 'embedding_prompt') {
                    setPromptVector(generateMockVector(prompt));
                }
                if(animationState === 'searching') {
                    const foundDoc = findRelevantChunk(prompt);
                    setRelevantDoc(foundDoc);
                }
                setAnimationState(currentState.next);
            }, currentState.duration);
        } else if (animationState === 'generating' && relevantDoc) {
             generateRAGResponse(prompt, relevantDoc.content).then(answer => {
                setFinalAnswer(answer);
                setAnimationState('done');
                setIsLoading(false);
             });
        }
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationState, isLoading]);

  const findRelevantChunk = (query: string): RagDocument => {
    const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    if (queryWords.size === 0) return RAG_KNOWLEDGE_BASE[0];
    
    let bestDoc = RAG_KNOWLEDGE_BASE[0];
    let maxScore = -1;

    RAG_KNOWLEDGE_BASE.forEach(doc => {
      const contentWords = new Set(doc.content.toLowerCase().split(/\s+/));
      let score = 0;
      queryWords.forEach(word => {
        if (contentWords.has(word)) score++;
      });
      if (score > maxScore) {
        maxScore = score;
        bestDoc = doc;
      }
    });
    return bestDoc;
  };

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;
    resetState();
    setIsLoading(true);
    setAnimationState('indexing');
  };
  
  const isStateActive = (...states: AnimationState[]) => {
    return states.includes(animationState) || (animationState === 'done' && states.includes('generating'));
  }

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md border border-[#E5E5E5]">
        <h2 className="text-xl font-bold mb-4 text-center text-[#222222]">RAG Process Visualization</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g., Who walked on the moon first?"
            className="flex-grow bg-[#F5F4F2] text-[#222222] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E60F1D] transition border border-[#E5E5E5]"
            disabled={isLoading}
          />
          <button
            onClick={isLoading ? resetState : handleGenerate}
            disabled={!prompt.trim() && !isLoading}
            className={`flex items-center justify-center gap-2 font-semibold px-6 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E60F1D]/80 ${
                isLoading ? 'bg-gray-500 hover:bg-gray-600 text-white' : 'bg-[#E60F1D] hover:bg-[#CF0E1B] active:bg-[#B90C18] disabled:opacity-40 disabled:cursor-not-allowed text-white'
            }`}
          >
            {isLoading ? 'Reset' : <><SearchIcon className="w-5 h-5"/> Simulate RAG</>}
          </button>
        </div>
      </div>
      
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-x-8 gap-y-4">
        {/* Indexing Pipeline */}
        <div className="flex-1 flex flex-col items-center gap-4">
            <ProcessBlock title="1. Knowledge Base" icon={<DocumentIcon className="w-5 h-5" />} isActive={isStateActive('indexing', 'searching', 'retrieving')}>
                 <p className="text-xs text-[#6B6B6B] mb-2">Original documents stored for retrieval.</p>
                 <div className="space-y-2">
                    {RAG_KNOWLEDGE_BASE.map(doc => (
                        <div key={doc.id} className={`p-2 rounded text-xs transition-all duration-300 ${isStateActive('retrieving') && relevantDoc?.id === doc.id ? 'bg-green-100 border border-green-300' : 'bg-[#F5F4F2]'}`}>
                           <span className="font-bold text-gray-600">Doc {doc.id}:</span> {doc.content.substring(0, 40)}...
                        </div>
                    ))}
                 </div>
            </ProcessBlock>
            <ArrowDownIcon className={`w-8 h-8 transition-opacity duration-500 ${isStateActive('indexing') ? 'text-[#E60F1D] animate-pulse' : 'text-gray-400'}`} />
            <ProcessBlock title="2. Vector Database" icon={<DatabaseIcon className="w-5 h-5" />} isActive={isStateActive('indexing', 'searching', 'retrieving')}>
                <p className="text-xs text-[#6B6B6B] mb-2">Documents are converted to numeric vectors (embeddings) for semantic search.</p>
                
                <div className="space-y-1 font-mono text-[10px] sm:text-xs break-all">
                    {RAG_KNOWLEDGE_BASE.map(doc => (
                        <div key={doc.id} className={`p-1.5 rounded transition-all duration-500 ${isStateActive('retrieving') && relevantDoc?.id === doc.id ? 'bg-green-100 ring-2 ring-green-400' : 'bg-white'}`}>
                            <span className="text-gray-500 mr-2">Doc {doc.id}:</span>
                            <span className={isStateActive('indexing', 'searching', 'retrieving', 'generating') ? 'text-sky-700' : 'text-gray-400'}>
                                {isStateActive('indexing', 'searching', 'retrieving', 'generating') ? docVectors[doc.id] : '...'}
                            </span>
                        </div>
                    ))}

                    {isStateActive('searching', 'retrieving', 'generating') && (
                        <>
                            <div className="border-t border-dashed border-gray-300 my-2"></div>
                            <div className={`p-1.5 rounded transition-all duration-500 bg-red-100 ring-2 ring-[#E60F1D]`}>
                                <span className="text-gray-500 mr-2">Prompt:</span>
                                <span className="text-[#E60F1D] font-medium">{promptVector}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-2 text-xs">
                    {animationState === 'indexing' && <p className="text-[#E60F1D] animate-pulse">Embedding documents...</p>}
                    {animationState === 'searching' && <p className="text-[#E60F1D] animate-pulse">Calculating vector similarity...</p>}
                    {animationState === 'retrieving' && <p className="text-green-600 font-semibold">✓ Closest vector match found for Doc #{relevantDoc?.id}</p>}
                </div>
            </ProcessBlock>
        </div>
        
        {/* Inference Pipeline */}
        <div className="flex-1 flex flex-col items-center gap-4">
            <ProcessBlock title="3. User Prompt & Context" icon={<SearchIcon className="w-5 h-5" />} isActive={isStateActive('embedding_prompt', 'searching', 'retrieving', 'generating')}>
                <div className="space-y-3">
                    <div>
                        <p className="font-semibold text-blue-700 text-xs mb-1">User Question:</p>
                        <p className="p-2 rounded bg-white text-xs break-words">{prompt || '...'}</p>
                    </div>
                    {isStateActive('embedding_prompt', 'searching', 'retrieving', 'generating') && (
                        <div>
                            <p className="font-semibold text-sky-700 text-xs mb-1">Prompt Vector:</p>
                            <p className="p-2 rounded bg-white font-mono text-[10px] sm:text-xs break-words text-sky-600">
                                {promptVector || <span className="animate-pulse">...generating vector...</span>}
                            </p>
                        </div>
                    )}
                     {isStateActive('retrieving', 'generating') && relevantDoc && (
                         <div>
                            <p className="font-semibold text-green-700 text-xs mb-1">Retrieved Context (from Doc #{relevantDoc.id}):</p>
                            <p className="p-2 rounded bg-white text-xs max-h-24 overflow-y-auto">{relevantDoc.content}</p>
                         </div>
                     )}
                </div>
            </ProcessBlock>
             <ArrowDownIcon className={`w-8 h-8 transition-opacity duration-500 ${isStateActive('generating') ? 'text-[#E60F1D] animate-pulse' : 'text-gray-400'}`} />
            <ProcessBlock title="4. LLM Generation" icon={<SparklesIcon className="w-5 h-5" />} isActive={isStateActive('generating')}>
                {animationState === 'generating' && <p className="text-[#E60F1D] animate-pulse">Generating final answer...</p>}
                {animationState === 'done' && (
                    <div>
                        <p className="whitespace-pre-wrap font-mono text-sm text-[#222222]">{finalAnswer}</p>
                        {relevantDoc && (
                            <div className="mt-4 pt-3 border-t border-[#E5E5E5]">
                                <h4 className="text-xs font-semibold text-[#6B6B6B] mb-2 flex items-center gap-1.5">
                                    <DocumentIcon className="w-4 h-4" />
                                    Source Document
                                </h4>
                                <div className="p-3 rounded bg-white text-xs text-[#222222] space-y-1">
                                    <p className="font-bold text-[#E60F1D]">Doc #{relevantDoc.id}</p>
                                    <p className="leading-relaxed">{relevantDoc.content}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ProcessBlock>
        </div>
      </div>
    </div>
  );
};


// =================================================================
// 메인 앱 컴포넌트 (from App.tsx)
// =================================================================
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


// =================================================================
// 앱 렌더링
// =================================================================
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
