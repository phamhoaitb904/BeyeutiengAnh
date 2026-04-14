import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Check, X, Volume2, Users, Award, Clock, 
  Settings, Edit, Trash2, Plus, ArrowLeft, Save, Trophy,
  Star, Heart, Music, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- BỘ CÂU HỎI ---
const INITIAL_QUESTIONS = [
  // MỨC 1 - EASY (10 điểm)
  { id: 1, level: 1, points: 10, image: '🍎', text: 'What is this?', options: ['Banana', 'Apple', 'Dog', 'Cat'], correct: 'Apple' },
  { id: 2, level: 1, points: 10, image: '🐶', text: 'What is this?', options: ['Cat', 'Dog', 'Fish', 'Bird'], correct: 'Dog' },
  { id: 3, level: 1, points: 10, image: '🐱', text: 'What is this?', options: ['Dog', 'Cat', 'Duck', 'Cow'], correct: 'Cat' },
  { id: 4, level: 1, points: 10, image: '🍌', text: 'What is this?', options: ['Apple', 'Banana', 'Orange', 'Mango'], correct: 'Banana' },
  { id: 5, level: 1, points: 10, image: '🔴', text: 'What color is it?', options: ['Blue', 'Yellow', 'Red', 'Green'], correct: 'Red' },
  { id: 6, level: 1, points: 10, image: '🔵', text: 'What color is it?', options: ['Red', 'Blue', 'Green', 'Yellow'], correct: 'Blue' },
  { id: 7, level: 1, points: 10, image: '2️⃣', text: 'What number is this?', options: ['One', 'Two', 'Three', 'Four'], correct: 'Two' },
  { id: 8, level: 1, points: 10, image: '⭕', text: 'What shape is it?', options: ['Square', 'Triangle', 'Circle', 'Star'], correct: 'Circle' },
  
  // MỨC 2 - MEDIUM (20 điểm)
  { id: 9, level: 2, points: 20, image: '🐶', text: 'This is a dog.', options: ['True', 'False'], correct: 'True' },
  { id: 10, level: 2, points: 20, image: '🍌', text: 'The banana is red.', options: ['True', 'False'], correct: 'False' },
  { id: 11, level: 2, points: 20, image: '🦅', text: 'A bird can fly.', options: ['True', 'False'], correct: 'True' },
  { id: 12, level: 2, points: 20, image: '🥛', text: 'This is water.', options: ['True', 'False'], correct: 'True' },
  { id: 13, level: 2, points: 20, image: '🪑', text: 'This is a table.', options: ['True', 'False'], correct: 'False' },
  { id: 14, level: 2, points: 20, image: '🐘', text: 'An elephant is big.', options: ['True', 'False'], correct: 'True' },
  { id: 15, level: 2, points: 20, image: '🧢', text: 'This is a hat.', options: ['True', 'False'], correct: 'True' },
  { id: 16, level: 2, points: 20, image: '🎁', text: 'We say "Thank you" when we get a gift.', options: ['True', 'False'], correct: 'True' },

  // MỨC 3 - HARD (30 điểm)
  { id: 17, level: 3, points: 30, image: '🐈', text: 'I have a cat.', options: ['True', 'False'], correct: 'True' },
  { id: 18, level: 3, points: 30, image: '🍎', text: 'This is a apple.', options: ['True', 'False'], correct: 'False' }, // Ngữ pháp sai (a apple) -> False
  { id: 19, level: 3, points: 30, image: '😄', text: 'I am happy.', options: ['True', 'False'], correct: 'True' },
  { id: 20, level: 3, points: 30, image: '🐭🐘', text: 'The mouse is big.', options: ['True', 'False'], correct: 'False' },
];

export default function App() {
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'finished', 'managing'
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [timeLimit, setTimeLimit] = useState(10);
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  const [questionsList, setQuestionsList] = useState(INITIAL_QUESTIONS);
  const [editingQ, setEditingQ] = useState(null);
  
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const [showFeedback, setShowFeedback] = useState(null); // 'correct', 'wrong'
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const timerRef = useRef(null);

  // Khởi tạo trò chơi
  const startGame = () => {
    let filtered = [...questionsList];
    if (selectedLevel !== 'all') {
      filtered = questionsList.filter(q => q.level === parseInt(selectedLevel));
    }
    if (filtered.length === 0) return;
    
    // Shuffle questions for variety
    filtered = filtered.sort(() => Math.random() - 0.5);
    
    setCurrentQuestions(filtered);
    setCurrentQIndex(0);
    setTeamAScore(0);
    setTeamBScore(0);
    setGameState('playing');
    setTimeLeft(timeLimit);
    setWrongAnswers([]);
    setShowFeedback(null);
    setShowAwardModal(false);
    
    // Delay speech slightly to allow screen transition
    setTimeout(() => readText(filtered[0].text), 500);
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !showAwardModal && !showFeedback) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing' && !showAwardModal && !showFeedback) {
      handleWrong();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState, showAwardModal, showFeedback]);

  const handleWrong = () => {
    playAudio('Try again!');
    setShowFeedback('wrong');
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // AI Đọc giọng nói tiếng Anh
  const readText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Slightly slower for kids
      window.speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = text.includes('Great') ? 1.2 : 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const playTingSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch(e) { console.log("Audio not supported"); }
  };

  // Xử lý khi chọn đáp án
  const handleAnswer = (option) => {
    const question = currentQuestions[currentQIndex];
    if (option === question.correct) {
      playTingSound();
      playAudio('Great job!');
      setShowFeedback('correct');
      setTimeout(() => {
        setShowAwardModal(true);
      }, 1200);
    } else {
      playAudio('Try again!');
      setWrongAnswers([...wrongAnswers, option]);
    }
  };

  // Trao điểm cho đội
  const awardPoints = (team) => {
    const points = currentQuestions[currentQIndex].points;
    if (team === 'A') setTeamAScore(prev => prev + points);
    if (team === 'B') setTeamBScore(prev => prev + points);
    if (team === 'Both') {
      setTeamAScore(prev => prev + points);
      setTeamBScore(prev => prev + points);
    }
    
    setShowAwardModal(false);
    nextQuestion();
  };

  const nextQuestion = () => {
    setShowFeedback(null);
    setWrongAnswers([]);
    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setTimeLeft(timeLimit);
      readText(currentQuestions[currentQIndex + 1].text);
    } else {
      setGameState('finished');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] relative font-sans text-slate-800 overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10 text-teal-500"
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              rotate: 0 
            }}
            animate={{ 
              y: [null, '-10%', '110%'],
              rotate: 360
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            {i % 3 === 0 ? <Star size={40 + i * 5} /> : i % 3 === 1 ? <Heart size={30 + i * 5} /> : <Music size={35 + i * 5} />}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-8 border-white p-6 md:p-10">
        
        <AnimatePresence mode="wait">
          {/* === MÀN HÌNH BẮT ĐẦU === */}
          {gameState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-4"
              >
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 mb-2 tracking-tight">
                  AI NHANH HƠN
                </h1>
              </motion.div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-6 flex items-center gap-2">
                <Sparkles className="text-yellow-400" /> Ngày hội "Bé yêu tiếng Anh" <Sparkles className="text-yellow-400" />
              </h2>
              
              <div className="bg-teal-50 rounded-2xl p-4 mb-8 border-2 border-teal-100">
                <p className="text-teal-800 font-bold">Trường Mầm non Than Uyên</p>
                <p className="text-slate-500 text-sm">Sân chơi bổ ích dành cho các bé Mầm non</p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl mb-10">
                <div className="flex-1 bg-gradient-to-br from-rose-400 to-rose-500 rounded-3xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                  <h3 className="text-xl font-black mb-1 opacity-90">LỚP LỚN A2</h3>
                  <div className="text-4xl font-black">READY!</div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                  <h3 className="text-xl font-black mb-1 opacity-90">LỚP LỚN A3</h3>
                  <div className="text-4xl font-black">READY!</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 w-full max-w-lg">
                <div className="flex flex-col items-start gap-1">
                  <label className="text-sm font-bold text-slate-400 ml-2">THỜI GIAN</label>
                  <select 
                    className="w-full bg-slate-100 border-2 border-transparent focus:border-teal-400 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                  >
                    <option value={10}>10 Giây / Câu</option>
                    <option value={15}>15 Giây / Câu</option>
                    <option value={20}>20 Giây / Câu</option>
                    <option value={30}>30 Giây / Câu</option>
                  </select>
                </div>

                <div className="flex flex-col items-start gap-1">
                  <label className="text-sm font-bold text-slate-400 ml-2">MỨC ĐỘ</label>
                  <select 
                    className="w-full bg-slate-100 border-2 border-transparent focus:border-teal-400 rounded-2xl px-4 py-3 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    <option value="all">Tất cả câu hỏi</option>
                    <option value="1">Mức 1 (Dễ)</option>
                    <option value="2">Mức 2 (Vừa)</option>
                    <option value="3">Mức 3 (Khó)</option>
                  </select>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="group relative bg-orange-500 text-white text-3xl font-black py-5 px-16 rounded-full shadow-[0_8px_0_#c2410c] hover:shadow-[0_4px_0_#c2410c] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all flex items-center gap-4"
              >
                <Play fill="currentColor" size={32} />
                BẮT ĐẦU CHƠI
              </motion.button>

              <button 
                onClick={() => setGameState('managing')}
                className="mt-8 flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold transition-colors"
              >
                <Settings size={18} /> Quản lý câu hỏi
              </button>
            </motion.div>
          )}

          {/* === MÀN HÌNH CHƠI === */}
          {gameState === 'playing' && currentQuestions.length > 0 && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Header: Điểm số & Bộ đếm */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col items-center">
                  <div className="bg-rose-500 text-white px-5 py-2 rounded-2xl font-black shadow-lg flex items-center gap-2 mb-1">
                    <Users size={18}/> A2
                  </div>
                  <div className="text-2xl font-black text-rose-600">{teamAScore}</div>
                </div>
                
                <div className="flex flex-col items-center flex-1 px-4">
                  <div className="text-slate-400 font-bold text-xs mb-2 uppercase tracking-widest">
                    Câu {currentQIndex + 1} / {currentQuestions.length} 
                    <span className="mx-2 text-orange-500">•</span>
                    Mức {currentQuestions[currentQIndex].level}
                  </div>
                  
                  {/* Progress Timer Bar */}
                  <div className="w-full max-w-xs h-3 bg-slate-100 rounded-full overflow-hidden mb-2 border border-slate-200">
                    <motion.div 
                      className={`h-full ${timeLeft <= 3 ? 'bg-red-500' : 'bg-teal-500'}`}
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                  
                  <div className={`text-4xl font-black ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-teal-600'} flex items-center gap-2`}>
                    <Clock size={24} /> {timeLeft}s
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-blue-500 text-white px-5 py-2 rounded-2xl font-black shadow-lg flex items-center gap-2 mb-1">
                    A3 <Users size={18}/>
                  </div>
                  <div className="text-2xl font-black text-blue-600">{teamBScore}</div>
                </div>
              </div>

              {/* Nội dung câu hỏi */}
              <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[2rem] p-6 md:p-10 border-2 border-slate-100 shadow-inner relative overflow-hidden">
                
                <AnimatePresence>
                  {showFeedback === 'correct' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 rounded-[2rem]"
                    >
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: 2 }}
                        className="text-9xl mb-4"
                      >
                        🌟
                      </motion.div>
                      <h2 className="text-5xl font-black text-green-500 tracking-tight">XUẤT SẮC!</h2>
                      <p className="text-slate-500 font-bold mt-2 italic">Great job!</p>
                    </motion.div>
                  )}
                  {showFeedback === 'wrong' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 rounded-[2rem]"
                    >
                      <div className="text-9xl mb-4">⏰</div>
                      <h2 className="text-5xl font-black text-rose-500 tracking-tight">HẾT GIỜ!</h2>
                      <p className="text-slate-500 font-bold mt-2 italic">Time's up!</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hình ảnh/Emoji */}
                <motion.div 
                  key={currentQIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[140px] leading-none mb-8 drop-shadow-2xl select-none"
                >
                  {currentQuestions[currentQIndex].image}
                </motion.div>

                {/* Câu hỏi chữ */}
                <div className="flex items-center gap-4 mb-10">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                    {currentQuestions[currentQIndex].text}
                  </h2>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => readText(currentQuestions[currentQIndex].text)}
                    className="bg-teal-500 text-white p-3 rounded-2xl shadow-lg hover:bg-teal-600 transition-colors"
                  >
                    <Volume2 size={32} />
                  </motion.button>
                </div>

                {/* Các nút Đáp án */}
                <div className={`grid w-full gap-4 max-w-2xl ${currentQuestions[currentQIndex].options.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                  {currentQuestions[currentQIndex].options.map((option, idx) => {
                    const isWrong = wrongAnswers.includes(option);
                    const isTrueFalse = currentQuestions[currentQIndex].options.length === 2;
                    
                    let btnStyle = "bg-white text-slate-700 border-b-4 border-slate-200 hover:border-teal-400 hover:bg-teal-50";
                    if (isTrueFalse) {
                      if (option === 'True') btnStyle = "bg-green-50 text-green-700 border-b-4 border-green-400 hover:bg-green-100";
                      if (option === 'False') btnStyle = "bg-rose-50 text-rose-700 border-b-4 border-rose-400 hover:bg-rose-100";
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={!isWrong && showFeedback === null ? { y: -4 } : {}}
                        whileTap={!isWrong && showFeedback === null ? { y: 0 } : {}}
                        disabled={isWrong || showFeedback !== null}
                        onClick={() => handleAnswer(option)}
                        className={`
                          ${btnStyle}
                          text-2xl font-black py-6 px-4 rounded-3xl shadow-sm transition-all
                          ${isWrong ? 'opacity-20 scale-95 grayscale cursor-not-allowed border-none' : ''}
                          flex ${isTrueFalse ? 'flex-col' : 'flex-row'} items-center justify-center gap-3
                        `}
                      >
                        {isTrueFalse && option === 'True' && <Check size={36} className="text-green-600"/>}
                        {isTrueFalse && option === 'False' && <X size={36} className="text-rose-600"/>}
                        {!isTrueFalse && (
                          <span className="bg-teal-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-md">
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                        )}
                        <span>{option}</span>
                      </motion.button>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          )}

          {/* === MÀN HÌNH KẾT QUẢ CUỐI CÙNG === */}
          {gameState === 'finished' && (
            <motion.div 
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-6"
            >
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-6 drop-shadow-2xl"
              >
                🏆
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-10 uppercase tracking-tighter">
                KẾT QUẢ CHUNG CUỘC
              </h1>
              
              <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl mb-12">
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`flex-1 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-8 relative overflow-hidden
                    ${teamAScore >= teamBScore ? 'bg-gradient-to-br from-rose-500 to-rose-600 border-rose-800 scale-110 z-10' : 'bg-rose-400 border-rose-500 opacity-60'}`}
                >
                  {teamAScore >= teamBScore && teamAScore !== teamBScore && <div className="absolute -top-2 -right-2 text-6xl rotate-12">👑</div>}
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-wider">LỚP LỚN A2</h3>
                  <div className="text-8xl font-black">{teamAScore}</div>
                  <div className="mt-2 text-sm font-bold opacity-80 uppercase">POINTS</div>
                </motion.div>
                
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`flex-1 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-8 relative overflow-hidden
                    ${teamBScore >= teamAScore ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-800 scale-110 z-10' : 'bg-blue-400 border-blue-500 opacity-60'}`}
                >
                  {teamBScore >= teamAScore && teamAScore !== teamBScore && <div className="absolute -top-2 -right-2 text-6xl rotate-12">👑</div>}
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-wider">LỚP LỚN A3</h3>
                  <div className="text-8xl font-black">{teamBScore}</div>
                  <div className="mt-2 text-sm font-bold opacity-80 uppercase">POINTS</div>
                </motion.div>
              </div>

              {teamAScore === teamBScore ? (
                <h2 className="text-3xl font-black text-teal-600 mb-10">CẢ HAI ĐỘI ĐỀU CHIẾN THẮNG! 🥳</h2>
              ) : (
                <h2 className="text-3xl font-black text-teal-600 mb-10">
                  CHÚC MỪNG {teamAScore > teamBScore ? 'LỚP LỚN A2' : 'LỚP LỚN A3'}! 🎉
                </h2>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGameState('start')}
                className="flex items-center gap-3 bg-teal-500 text-white text-2xl font-black py-5 px-12 rounded-full shadow-[0_8px_0_#0f766e] hover:shadow-[0_4px_0_#0f766e] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all"
              >
                <RotateCcw size={28} /> CHƠI LẠI
              </motion.button>
            </motion.div>
          )}

          {/* === MÀN HÌNH QUẢN LÝ CÂU HỎI === */}
          {gameState === 'managing' && !editingQ && (
            <motion.div 
              key="managing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-[75vh] w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <button onClick={() => setGameState('start')} className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold transition-colors">
                  <ArrowLeft size={24} /> Quay lại
                </button>
                <h2 className="text-3xl font-black text-teal-600 tracking-tight">NGÂN HÀNG CÂU HỎI</h2>
                <button 
                  onClick={() => setEditingQ({ level: 1, points: 10, image: '🌟', text: '', options: ['A', 'B', 'C', 'D'], correct: 'A' })} 
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-3 rounded-2xl font-black transition-all shadow-lg"
                >
                  <Plus size={20} /> Thêm mới
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar">
                {questionsList.map((q, idx) => (
                  <div key={q.id} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:border-teal-300 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="text-5xl w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">{q.image}</div>
                      <div>
                        <div className="font-black text-slate-800 text-xl mb-1">{q.text}</div>
                        <div className="flex items-center gap-3 text-sm font-bold">
                          <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-lg">Mức {q.level}</span>
                          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg">{q.points}đ</span>
                          <span className="text-slate-400">Đáp án: <span className="text-teal-600">{q.correct}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingQ({...q})} className="p-3 text-blue-500 hover:bg-blue-100 rounded-xl transition-colors"><Edit size={22}/></button>
                      <button onClick={() => setQuestionsList(questionsList.filter(item => item.id !== q.id))} className="p-3 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors"><Trash2 size={22}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Form Sửa / Thêm Câu Hỏi */}
          {gameState === 'managing' && editingQ && (
            <motion.div 
              key="editing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col w-full max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-black text-teal-600 mb-8">{editingQ.id ? 'SỬA CÂU HỎI' : 'THÊM CÂU HỎI MỚI'}</h2>
              
              <div className="flex flex-col gap-6 bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 text-left shadow-inner">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Mức độ</label>
                    <select 
                      value={editingQ.level} 
                      onChange={e => setEditingQ({...editingQ, level: Number(e.target.value), points: Number(e.target.value) * 10})} 
                      className="w-full bg-white border-2 border-slate-200 p-3 rounded-2xl font-bold outline-none focus:border-teal-400 transition-colors"
                    >
                      <option value={1}>Mức 1 (10đ)</option>
                      <option value={2}>Mức 2 (20đ)</option>
                      <option value={3}>Mức 3 (30đ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Điểm số</label>
                    <input 
                      type="number" 
                      value={editingQ.points} 
                      onChange={e => setEditingQ({...editingQ, points: Number(e.target.value)})} 
                      className="w-full bg-white border-2 border-slate-200 p-3 rounded-2xl font-bold outline-none focus:border-teal-400 transition-colors" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Emoji/Hình</label>
                    <input 
                      type="text" 
                      value={editingQ.image} 
                      onChange={e => setEditingQ({...editingQ, image: e.target.value})} 
                      className="w-full bg-white border-2 border-slate-200 p-3 rounded-2xl text-3xl text-center outline-none focus:border-teal-400 transition-colors" 
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nội dung câu hỏi</label>
                    <input 
                      type="text" 
                      value={editingQ.text} 
                      onChange={e => setEditingQ({...editingQ, text: e.target.value})} 
                      className="w-full bg-white border-2 border-slate-200 p-3 rounded-2xl font-bold outline-none focus:border-teal-400 transition-colors" 
                      placeholder="VD: What is this?" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Các đáp án (Cách nhau bởi dấu phẩy)</label>
                  <input 
                    type="text" 
                    value={editingQ.options.join(',')} 
                    onChange={e => setEditingQ({...editingQ, options: e.target.value.split(',').map(s=>s.trim())})} 
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-2xl font-bold outline-none focus:border-teal-400 transition-colors" 
                    placeholder="VD: Apple,Banana,Cat,Dog hoặc True,False" 
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Đáp án ĐÚNG</label>
                  <select 
                    value={editingQ.correct} 
                    onChange={e => setEditingQ({...editingQ, correct: e.target.value})} 
                    className="w-full bg-white border-2 border-slate-200 p-3 rounded-2xl font-bold text-teal-600 outline-none focus:border-teal-400 transition-colors"
                  >
                    {editingQ.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt || '(Trống)'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button onClick={() => setEditingQ(null)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">HỦY BỎ</button>
                <button 
                  onClick={() => {
                    if(editingQ.id) {
                      setQuestionsList(questionsList.map(q => q.id === editingQ.id ? editingQ : q));
                    } else {
                      setQuestionsList([...questionsList, { ...editingQ, id: Date.now() }]);
                    }
                    setEditingQ(null);
                  }} 
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl transition-all"
                >
                  <Save size={20} /> LƯU CÂU HỎI
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Chọn Đội nhận điểm */}
        <AnimatePresence>
          {showAwardModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-[2.5rem]"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center border-4 border-teal-100"
              >
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={56} className="text-yellow-500" />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-2">ĐỘI NÀO NHANH NHẤT?</h3>
                <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-sm">Cộng {currentQuestions[currentQIndex].points} điểm cho:</p>
                
                <div className="flex flex-col gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => awardPoints('A')} 
                    className="bg-rose-500 text-white font-black py-5 rounded-2xl text-xl shadow-lg border-b-4 border-rose-700"
                  >
                    LỚP LỚN A2
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => awardPoints('B')} 
                    className="bg-blue-500 text-white font-black py-5 rounded-2xl text-xl shadow-lg border-b-4 border-blue-700"
                  >
                    LỚP LỚN A3
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => awardPoints('Both')} 
                    className="bg-teal-500 text-white font-black py-5 rounded-2xl text-xl shadow-lg border-b-4 border-teal-700"
                  >
                    CẢ HAI ĐỘI
                  </motion.button>
                  <button 
                    onClick={() => awardPoints('None')} 
                    className="text-slate-400 font-black py-3 mt-2 hover:text-slate-600 transition-colors"
                  >
                    BỎ QUA
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
