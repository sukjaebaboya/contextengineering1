import React, { useState, useEffect } from 'react';
import { RAG_KNOWLEDGE_BASE } from '../constants';
import { generateRAGResponse } from '../services/geminiService';
import { RagDocument } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { DatabaseIcon } from './icons/DatabaseIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

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

export default RagView;