import React, { useState, useRef } from 'react';
import Header from './components/Header';
import EditorWindow from './components/EditorWindow';
import { translateCode } from './services/geminiService';
import { TranslateMode, SUPPORTED_LANGUAGES } from './types';
import { ArrowRight, Settings2, Sparkles, AlertCircle, Upload, Download } from 'lucide-react';

const INITIAL_CODE = `// 这是一个示例函数
// 它计算两个数字的和
function calculateSum(a, b) {
    console.log("开始计算..."); 
    
    // 如果输入无效，返回错误
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error("参数必须是数字");
    }

    const 结果 = a + b;
    return 结果;
}`;

// Helper to map file extensions to Monaco editor languages
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'mjs': return 'javascript';
    case 'ts': case 'tsx': return 'typescript';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'c': case 'h': return 'c';
    case 'cpp': case 'cc': case 'hpp': return 'cpp';
    case 'cs': return 'csharp';
    case 'go': return 'go';
    case 'rs': return 'rust';
    case 'php': return 'php';
    case 'rb': return 'ruby';
    case 'swift': return 'swift';
    case 'sql': return 'sql';
    case 'html': case 'htm': return 'html';
    case 'css': return 'css';
    case 'json': return 'json';
    default: return 'javascript'; // default
  }
};

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>(INITIAL_CODE);
  const [outputCode, setOutputCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [mode, setMode] = useState<TranslateMode>(TranslateMode.FULL);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('example.js');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async () => {
    if (!inputCode.trim()) return;

    setIsTranslating(true);
    setError(null);
    
    try {
      const translated = await translateCode(inputCode, language, mode);
      setOutputCode(translated);
    } catch (err: any) {
      setError(err.message || "Something went wrong during translation");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setInputCode(text);
        setFileName(file.name);
        
        // Auto-detect language
        const detectedLang = getLanguageFromExtension(file.name);
        if (SUPPORTED_LANGUAGES.includes(detectedLang)) {
          setLanguage(detectedLang);
        }
        
        // Clear output when new file is uploaded
        setOutputCode('');
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
    
    // Reset value so same file can be selected again
    event.target.value = '';
  };

  const handleDownload = () => {
    if (!outputCode) return;
    
    const blob = new Blob([outputCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <Header />

      <main className="flex-1 flex flex-col p-4 md:p-6 gap-4 max-w-[1920px] mx-auto w-full h-[calc(100vh-64px)]">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm">
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-400">Language:</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 min-w-[120px]"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-600">
               <button
                 onClick={() => setMode(TranslateMode.FULL)}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                   mode === TranslateMode.FULL 
                   ? 'bg-blue-600 text-white shadow-sm' 
                   : 'text-slate-400 hover:text-white'
                 }`}
               >
                 Everything
               </button>
               <button
                 onClick={() => setMode(TranslateMode.COMMENTS_ONLY)}
                 className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                   mode === TranslateMode.COMMENTS_ONLY 
                   ? 'bg-blue-600 text-white shadow-sm' 
                   : 'text-slate-400 hover:text-white'
                 }`}
               >
                 Comments Only
               </button>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
             {/* Info Tip */}
             <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
                <Settings2 className="w-3.5 h-3.5" />
                <span>Preserves strict logic & structure</span>
             </div>

             <button
              onClick={handleTranslate}
              disabled={isTranslating || !inputCode.trim()}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all
                ${isTranslating || !inputCode.trim() 
                  ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95'
                }
              `}
             >
               {isTranslating ? (
                 <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Translating...
                 </>
               ) : (
                 <>
                   <Sparkles className="w-4 h-4" />
                   Translate Code
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-200 bg-red-900/20 border border-red-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Editors Split View */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          
          <div className="flex-1 min-h-[300px]">
            <EditorWindow
              title={`Original: ${fileName}`}
              code={inputCode}
              onChange={(val) => setInputCode(val || '')}
              language={language}
              placeholder="Paste code or upload a file..."
              headerActions={
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-300 bg-blue-900/20 border border-blue-500/30 rounded-md hover:bg-blue-900/40 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              }
            />
          </div>

          <div className="hidden lg:flex flex-col justify-center items-center text-slate-600">
            <ArrowRight className="w-6 h-6" />
          </div>

          <div className="flex-1 min-h-[300px]">
            <EditorWindow
              title={outputCode ? `Translated: ${fileName}` : "Translated Code"}
              code={outputCode}
              language={language}
              readOnly
              loading={isTranslating}
              placeholder="Translation will appear here..."
              headerActions={
                outputCode && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-900/20 border border-emerald-500/30 rounded-md hover:bg-emerald-900/40 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                )
              }
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;