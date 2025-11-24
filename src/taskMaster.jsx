import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    Brain, TrendingUp, Activity, Terminal, Zap,
    CheckCircle2, AlertCircle, Download, Upload, ChevronRight, Clock,
    Lock, User, Mail, LogOut, List, Plus,
    ClipboardList, Award, Clock3, CalendarCheck, FileText, ArrowLeft, XCircle, FileJson, DownloadCloud 
} from 'lucide-react';

// --- 1. UTILITY FUNCTIONS (Simplified) ---

const SCIENCE_TIPS = [];


// --- 2. AUTH COMPONENT (RETAINED) ---

const AuthScreen = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const users = JSON.parse(localStorage.getItem('rhythm_users') || '{}');

        if (isRegistering) {
            if (users[formData.email]) {
                setError('User already exists.');
                return;
            }
            users[formData.email] = { ...formData };
            localStorage.setItem('rhythm_users', JSON.stringify(users));
            onLogin(users[formData.email]);
        } else {
            const user = users[formData.email];
            if (user && user.password === formData.password) {
                onLogin(user);
            } else {
                setError('Invalid credentials.');
            }
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        // CHANGE: Auth background gradient end color to Indigo
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        {/* CHANGE: Icon background color to Indigo */}
                        <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Task Master</h2>
                    <p className="text-center text-slate-500 mb-8">10-15 Minute Task Tracker</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        // CHANGE: Focus ring color to Indigo
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    // CHANGE: Focus ring color to Indigo
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    // CHANGE: Focus ring color to Indigo
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        {/* CHANGE: Button background color to Indigo */}
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                            {isRegistering ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                    {/* CHANGE: Link color to Indigo */}
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. KNOWLEDGE TEST COMPONENT (NEW) ---

const KnowledgeTestScreen = ({ onBack }) => {
    // Papa is now guaranteed to be available globally due to the change in index.html
    const Papa = typeof window !== 'undefined' ? window.Papa : null;

    const [questions, setQuestions] = useState([]);
    const [timerMinutes, setTimerMinutes] = useState(5);
    const [fileStatus, setFileStatus] = useState('Ready to load file or paste data.');
    // UPDATED: Added 'review' state
    const [testState, setTestState] = useState('setup'); // 'setup', 'running', 'results', 'review' 
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    // UPDATED: Store detailed report
    const [report, setReport] = useState(null); 
    const timerRef = useRef(null);

    // --- REPORT DOWNLOAD FUNCTION (NEW) ---
    const downloadReportCard = useCallback(() => {
        if (!report || !Papa) return;

        // 1. Prepare data for CSV export
        // Note: PapaParse is used to format the data correctly into CSV, which opens easily in Excel.
        const exportData = report.answers.map((item, index) => ({
            'Q #': index + 1,
            'Question': item.question,
            'Correct Answer': item.correctAnswer,
            'Your Response': item.userAnswer || 'N/A',
            'Result': item.isCorrect ? 'Correct' : 'Incorrect',
            'All Options': item.options.join('|')
        }));

        // 2. Generate CSV
        const csv = Papa.unparse(exportData);

        // 3. Create Blob and trigger download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const filename = `Knowledge_Test_Report_${new Date().toISOString().split('T')[0]}.csv`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [report, Papa]);


    // Run PapaParse logic inside React's effect/callback
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setFileStatus('No file selected.');
            setQuestions([]);
            return;
        }

        setFileStatus(`File selected: ${file.name}. Reading...`);
        
        if (!Papa) {
            setFileStatus('Error: PapaParse library not detected. Check console for loading errors.');
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            delimiter: '|',
            complete: function(results) {
                const parsedQuestions = results.data.map(row => ({
                    question: row.Question || row.question || '',
                    correctAnswer: row.CorrectAnswer || row.correctanswer || '',
                    options: [row.OptionA, row.OptionB, row.OptionC, row.OptionD].filter(o => o && o.trim() !== '')
                })).filter(q => q.question.trim() !== '' && q.correctAnswer.trim() !== '' && q.options.length >= 2);

                if (parsedQuestions.length > 0) {
                    setQuestions(parsedQuestions);
                    setFileStatus(`Successfully loaded ${parsedQuestions.length} questions. Ready to start.`);
                } else {
                    setQuestions([]);
                    setFileStatus('Error: Could not find valid questions. Check file format (Question, CorrectAnswer, OptionA, ...).');
                }
            },
            error: function(err) {
                setFileStatus(`Error reading file: ${err.message}`);
                setQuestions([]);
            }
        });
    };
    
    const handlePaste = (event) => {
        const text = event.target.value;
        if (!text) {
             setFileStatus('Paste box is empty.');
             setQuestions([]);
             return;
        }
        
        if (!Papa) {
            setFileStatus('Error: PapaParse library not detected. Check console for loading errors.');
            return;
        }
        
        setFileStatus('Parsing pasted text...');


        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            delimiter: '|',
            complete: function(results) {
                const parsedQuestions = results.data.map(row => ({
                    question: row.Question || row.question || '',
                    correctAnswer: row.CorrectAnswer || row.correctanswer || '',
                    options: [row.OptionA, row.OptionB, row.OptionC, row.OptionD].filter(o => o && o.trim() !== '')
                })).filter(q => q.question.trim() !== '' && q.correctAnswer.trim() !== '' && q.options.length >= 2);

                if (parsedQuestions.length > 0) {
                    setQuestions(parsedQuestions);
                    setFileStatus(`Successfully loaded ${parsedQuestions.length} questions from paste. Ready to start.`);
                } else {
                    setQuestions([]);
                    setFileStatus('Error: Could not find valid questions in pasted text. Check format.');
                }
            },
            error: function(err) {
                setFileStatus(`Error parsing pasted text: ${err.message}`);
                setQuestions([]);
            }
        });
    };

    // --- SUBMIT AND ANALYZE TEST (MOVED UP) ---
    const submitTest = useCallback(() => {
        clearInterval(timerRef.current);
        let currentScore = 0;
        const totalQuestions = questions.length;
        const reportAnswers = [];

        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer && userAnswer.trim() === q.correctAnswer.trim();
            
            if (isCorrect) {
                currentScore++;
            }

            reportAnswers.push({
                ...q,
                userAnswer: userAnswer || 'N/A (Unanswered)',
                isCorrect: isCorrect,
            });
        });

        // Store the detailed report
        setReport({
            total: totalQuestions,
            score: currentScore,
            percentage: ((currentScore / totalQuestions) * 100).toFixed(1),
            answers: reportAnswers
        });

        setTestState('results');
    }, [questions, userAnswers]);


    // --- TIMER LOGIC (MOVED DOWN) ---
    const startTimer = useCallback((duration) => {
        clearInterval(timerRef.current);
        setTimeRemaining(duration * 60);
        setReport(null); // Reset report on start

        timerRef.current = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current);
                    submitTest(); // This function is now defined above
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    }, [submitTest]); // Dependency is now properly initialized


    const startTest = () => {
        if (questions.length === 0) {
            setFileStatus('Error: Cannot start. No valid questions loaded.');
            return;
        }
        setUserAnswers({});
        setTestState('running');
        startTimer(timerMinutes);
    };

    const handleAnswerChange = (qIndex, answer) => {
        setUserAnswers(prevAnswers => ({
            ...prevAnswers,
            [qIndex]: answer
        }));
    };

    // Timer display formatting
    const timerDisplay = useMemo(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [timeRemaining]);

    const isReadyToStart = questions.length > 0 && Papa !== null;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <button
                onClick={onBack}
                className="flex items-center gap-2 mb-6 text-indigo-600 hover:text-indigo-800 transition font-medium"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <h1 className="text-3xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-indigo-600" /> Test Your Knowledge
                </h1>

                {/* Setup Area */}
                {testState === 'setup' && (
                    <section>
                        <h2 className="text-xl font-semibold text-slate-700 mb-4">Test Setup</h2>
                        
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mb-6">
                            <p className="font-semibold text-indigo-800 mb-2">Instructions:</p>
                            <p className="text-sm text-indigo-700">The input data requires specific column headers: Question, CorrectAnswer, OptionA, OptionB, OptionC, OptionD.</p>
                            <p className="text-sm text-indigo-700">Please upload a .csv file or copy-paste the data below. NOTE: Use the Pipe symbol (|) as the column separator to avoid issues with commas in questions.</p>
                        </div>
                        
                        {/* Timer Input */}
                        <div className="mb-4">
                            <label htmlFor="timerInput" className="block text-sm font-medium text-slate-700 mb-1">Set Test Timer (minutes):</label>
                            <input 
                                type="number" 
                                id="timerInput" 
                                value={timerMinutes} 
                                onChange={(e) => setTimerMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                                min="1"
                                className="w-full md:w-1/3 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* File Upload */}
                        <div className="mb-6">
                            <label htmlFor="fileInput" className="block text-sm font-medium text-slate-700 mb-1">Upload Test File (.csv):</label>
                            <input 
                                type="file" 
                                id="fileInput" 
                                accept=".csv"
                                onChange={handleFileChange}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            />
                        </div>

                        {/* Paste Area */}
                        <div className="mb-6">
                            <label htmlFor="pasteArea" className="block text-sm font-medium text-slate-700 mb-1">Or Paste your data here using the pipe:</label>
                            <textarea
                                id="pasteArea"
                                rows="5"
                                placeholder="Paste your CSV text here (e.g., Question,CorrectAnswer,OptionA,..."
                                onChange={handlePaste}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            ></textarea>
                        </div>

                        {/* Status and Start Button */}
                        <p id="fileStatus" className="text-sm mb-4 text-slate-600 font-medium">{fileStatus}</p>

                        <button 
                            onClick={startTest} 
                            disabled={!isReadyToStart}
                            className={`px-6 py-3 rounded-xl font-bold text-white transition shadow-lg 
                                ${isReadyToStart ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-400 cursor-not-allowed'}`}
                        >
                            Start Test ({questions.length} Questions)
                        </button>

                         <div style={{ height: 100 }}></div> 

                        <div className="p-4 bg-yellow-50 border border-black-200 rounded-lg mb-6">
                        
                        <p className="font-semibold text-black-800 mb-2">Try with this Pipe-Separated format!</p>
                        <p className="text-sm text-black-700">Question|CorrectAnswer|OptionA|OptionB|OptionC|OptionD</p>
                        <p className="text-sm text-black-700">What is the primary difference between correlation and causation?|Causation implies correlation|Correlation implies causation|Causation implies correlation|They mean the same thing|Correlation is measured in time series</p>
                        <p className="text-sm text-black-700">In SQL, which join returns only the rows that have matching values in both tables?|INNER JOIN|LEFT JOIN|OUTER JOIN|FULL JOIN|INNER JOIN</p>
                        <p className="text-sm text-black-700">What is P-value in hypothesis testing?|The probability of observing the data given the null hypothesis is true|The probability of the null hypothesis being true|The confidence level of the test|The minimum acceptable significance level|The probability of observing the data given the null hypothesis is true</p>
                        <p className="text-sm text-black-700">Which technique is used to reduce the dimensionality of a dataset while preserving its variance?|Principal Component Analysis (PCA)|Linear Regression|K-Means Clustering|ANOVA|Principal Component Analysis (PCA)</p>
                        <p className="text-sm text-black-700">What is the main purpose of A/B testing?|To compare two versions (A and B) of a variable to determine which performs better|To perform multivariate regression|To analyze unstructured data|To calculate the average of two samples|To compare two versions (A and B) of a variable to determine which performs better</p>
                        <p className="text-sm text-black-700">What is data normalization primarily used for?|Scaling data into a common range|Filtering out null values|Converting text data to numeric format|Performing feature engineering|Scaling data into a common range</p>
                        <p className="text-sm text-black-700">In statistics, what does the term 'Outlier' refer to?|A data point significantly distant from other observations|The mean value of the dataset|The data point that occurs most frequently|The central tendency of the data|A data point significantly distant from other observations</p>
                        <p className="text-sm text-black-700">Which chart type is best for visualizing the distribution of a single numerical variable?|Histogram|Scatter Plot|Line Chart|Bar Chart|Histogram</p>
                        <p className="text-sm text-black-700">What is the risk of having a very high R-squared value in a regression model?|Overfitting the model to the training data|Underfitting the model to the training data|Low bias|High variance|Overfitting the model to the training data</p>
                        <p className="text-sm text-black-700">What is the most effective way to handle missing values (NaN) in a column with high cardinality (many unique values)?|Imputation using the Mode|Deleting the column|Imputation using the Mean|One-Hot Encoding|Imputation using the Mode</p>
                        </div>

                        <div style={{ height: 100 }}></div> 

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                            <p className="font-semibold text-black-800 mb-2">Prompt</p>
                            <p>Act as an expert quiz creator. Generate exactly 10 multiple-choice questions suitable for a interview quiz on the topic of Data Analysis Interview Concepts.</p> 
                            <p>The output MUST be a single block of text formatted strictly using the Pipe symbol (|) as the separator.</p> 
                            <p>The output MUST contain the exact following header row and column order:</p> 
                            <p>Question|CorrectAnswer|OptionA|OptionB|OptionC|OptionD</p> 
                            <p>Ensure that:</p>
                            <p>1. The answer given in the 'CorrectAnswer' column matches one of the options (OptionA, OptionB, OptionC, or OptionD).</p> 
                            <p>2. All fields (Question, Answer, Options) are concise and accurate.</p> 
                            <p>Example Row Format:</p>
                            <p>What is the process of generating synthetic data to protect user privacy?|Data Anonymization|Data Augmentation|Data Imputation|Data Anonymization|Data Segmentation</p>
                        </div>
                    </section>
                )}

                {/* Running Test Area */}
                {testState === 'running' && (
                    <section>
                        {/* FIXED TIMER: Uses fixed position to stay visible on scroll */}
                        <div className={`fixed top-4 right-4 z-50 w-40 p-4 rounded-xl font-mono text-center transition shadow-2xl border 
                            ${timeRemaining <= 60 ? 'bg-red-50 text-red-700 border-red-300' : 'bg-indigo-50 text-indigo-700 border-indigo-300'}`}>
                            <p className="text-sm font-medium">Time Remaining</p>
                            <div className="text-4xl font-extrabold" id="timer-display">{timerDisplay}</div>
                        </div>

                        {/* SPACER: Takes up the space where the timer used to be in the document flow */}
                        <div className="h-32 mb-6"></div> 

                        <form id="quizForm" className="space-y-6">
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="question-item p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-sm">
                                    <p className="text-md font-semibold text-slate-800 mb-3">{qIndex + 1}. {q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map((option, optIndex) => (
                                            <label key={optIndex} className="flex items-center space-x-3 text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-indigo-100 transition">
                                                <input 
                                                    type="radio" 
                                                    name={`question-${qIndex}`} 
                                                    value={option}
                                                    checked={userAnswers[qIndex] === option}
                                                    onChange={() => handleAnswerChange(qIndex, option)}
                                                    className="form-radio text-indigo-600 w-4 h-4 focus:ring-indigo-500"
                                                />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </form>

                        <button 
                            onClick={submitTest}
                            className="w-full mt-8 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg"
                        >
                            Submit Test
                        </button>
                    </section>
                )}

                {/* Results Area (UPDATED) */}
                {testState === 'results' && report && (
                    <section>
                        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Test Results & Analysis</h2>
                        <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200 text-center mb-6">
                            <p className="text-lg text-slate-600 mb-2">Total Questions: <span className="font-bold text-indigo-900">{report.total}</span></p>
                            <p className="text-lg text-slate-600 mb-4">Correct Answers: <span className="font-bold text-green-600">{report.score}</span></p>
                            <p className="text-4xl font-extrabold text-indigo-800" id="score-display">
                                {report.percentage}%
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <p className="text-sm text-slate-600">Incorrect: <span className="font-bold text-red-600">{report.total - report.score}</span></p>
                                <p className="text-sm text-slate-600">Unanswered: <span className="font-bold text-slate-800">{report.answers.filter(a => a.userAnswer === 'N/A (Unanswered)').length}</span></p>
                            </div>
                        </div>

                        {/* POST-EXAM ACTIONS (NEW) */}
                        <div className="space-y-4">
                            <button 
                                onClick={() => setTestState('review')}
                                className="w-full px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-md flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Review Answers & Feedback
                            </button>
                            <button 
                                onClick={downloadReportCard}
                                className="w-full px-6 py-3 rounded-xl font-bold text-indigo-600 border border-indigo-600 hover:bg-indigo-100 transition shadow-md flex items-center justify-center gap-2"
                            >
                                <DownloadCloud className="w-5 h-5" /> Download Report Card (.csv)
                            </button>
                            <button 
                                onClick={() => setTestState('setup')}
                                className="w-full px-6 py-3 rounded-xl font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 transition"
                            >
                                Start Another Test
                            </button>
                        </div>
                    </section>
                )}

                {/* Review Area (NEW SECTION) */}
                {testState === 'review' && report && (
                    <section>
                        <h2 className="text-2xl font-bold text-purple-700 mb-6">Answer Sheet & Review</h2>
                        <div className="space-y-6">
                            {report.answers.map((item, index) => (
                                <div 
                                    key={index} 
                                    className={`p-4 rounded-xl border-2 transition shadow-md 
                                        ${item.isCorrect 
                                            ? 'bg-green-50 border-green-300' 
                                            : 'bg-red-50 border-red-300'}`
                                    }
                                >
                                    <p className="text-lg font-semibold text-slate-900 mb-3">
                                        {index + 1}. {item.question}
                                    </p>
                                    
                                    <div className="space-y-2 text-sm">
                                        {/* Display User's Answer */}
                                        <p className="flex items-center gap-2 font-medium">
                                            <span className={`w-2 h-2 rounded-full ${item.isCorrect ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                            Your Response: 
                                            <span className={`font-bold ${item.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                                {item.userAnswer}
                                            </span>
                                        </p>

                                        {/* Display Correct Answer */}
                                        <p className="flex items-center gap-2 text-slate-700">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            Correct Answer: 
                                            <span className="font-bold text-green-800">{item.correctAnswer}</span>
                                        </p>

                                        {/* Feedback */}
                                        {!item.isCorrect && (
                                            <p className="text-xs text-red-700 mt-2 p-2 bg-red-100 rounded-lg">
                                                Feedback: Your answer was incorrect. Review the correct concept.
                                            </p>
                                        )}
                                        
                                        {item.userAnswer === 'N/A (Unanswered)' && (
                                            <p className="text-xs text-slate-700 mt-2 p-2 bg-slate-100 rounded-lg">
                                                Note: This question was left unanswered.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setTestState('results')}
                            className="w-full mt-8 px-6 py-3 rounded-xl font-bold text-indigo-600 border border-indigo-600 hover:bg-indigo-100 transition shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Results Summary
                        </button>
                    </section>
                )}

            </div>
        </div>
    );
};
// --- 4. TASK MASTER COMPONENT (UPDATED WITH ROUTING) ---

// Maps category names to Tailwind CSS classes
const categoryMap = {
    // UPDATED Category colors for better distinction and vibrancy
    Fitness: 'text-rose-600 bg-rose-100',
    Health: 'text-teal-600 bg-teal-100', // Changed Health to Teal
    Study: 'text-blue-600 bg-blue-100',
    Career: 'text-orange-600 bg-orange-100', // Changed Career to Orange
};

// Maps status names to use Indigo/Purple palette
const statusMap = {
    'To Do': 'text-slate-600 bg-slate-100',
    'In Progress': 'text-indigo-600 bg-indigo-100',
    'Completed': 'text-purple-600 bg-purple-100',
};

// New mapping for professional metric colors
const metricMap = [
    { name: 'Total Tasks', icon: ClipboardList, color: 'text-rose-600', bg: 'bg-rose-50', accessor: 'totalTasks' },
    { name: 'Completed', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50', accessor: 'totalCompleted' },
    { name: 'Total Points', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50', accessor: 'totalPoints' },
    { name: 'Minutes Invested', icon: Clock3, color: 'text-sky-600', bg: 'bg-sky-50', accessor: 'totalMinutes' },
];


const TaskMaster = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'test'
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState({
        name: '',
        duration: 15,
        category: 'Fitness',
        status: 'To Do',
        points: 10,
    });
    const [statusMessage, setStatusMessage] = useState(null); 
    const taskInputRef = useRef(null);

    // IndexedDB/LocalStorage Simulation for Tasks
    const loadTasks = useCallback((email) => {
        const data = localStorage.getItem(`task_master_data_${email}`);
        if (data) setTasks(JSON.parse(data));
        else setTasks([]);
    }, []);

    const saveTasks = useCallback((email, updatedTasks) => {
        localStorage.setItem(`task_master_data_${email}`, JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
    }, []);

    // Load User Session (kept from original)
    useEffect(() => {
        const storedUser = localStorage.getItem('rhythm_current_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            loadTasks(parsedUser.email);
        }
    }, [loadTasks]);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('rhythm_current_user', JSON.stringify(userData));
        loadTasks(userData.email);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('rhythm_current_user');
        setTasks([]);
    };

    // --- CORE LOGIC: TASK MANAGEMENT ---

    const handleTaskChange = (e) => {
        const { name, value, type } = e.target;
        setTaskInput(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value,
        }));
    };

    const addTask = (e) => {
        e.preventDefault();
        if (!taskInput.name.trim() || !user) {
            setStatusMessage({ type: 'error', msg: 'Task name cannot be empty.' });
            return;
        }

        const newTask = {
            ...taskInput,
            id: Date.now(),
            createdAt: new Date().toISOString(),
        };

        const updatedTasks = [...tasks, newTask];
        saveTasks(user.email, updatedTasks);

        setStatusMessage({ type: 'success', msg: `Task "${newTask.name}" added!` });
        setTaskInput({ name: '', duration: 15, category: 'Fitness', status: 'To Do', points: 10 });
        taskInputRef.current?.focus();
    };

    const deleteTask = (taskId) => {
        if (!user) return;
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        saveTasks(user.email, updatedTasks);
        setStatusMessage({ type: 'error', msg: `Task deleted.` });
    };

    const completeTask = (taskId) => {
        if (!user) return;
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, status: 'Completed' } : task
        );
        saveTasks(user.email, updatedTasks);
        setStatusMessage({ type: 'success', msg: `Task completed!` });
    };

    const exportToJSON = () => {
        const dataStr = JSON.stringify(tasks, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `task_master_backup_${user.email}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        setStatusMessage({ type: 'success', msg: 'Data exported successfully.' });
    };


    // --- ANALYTICS ENGINE (Adapted from Code B) ---
    const analysis = useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === 'Completed');

        const totalTasks = tasks.length;
        const totalCompleted = completedTasks.length;
        const totalPoints = completedTasks.reduce((sum, t) => sum + t.points, 0);
        const totalMinutes = completedTasks.reduce((sum, t) => sum + t.duration, 0);

        const statusCounts = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});

        const chartData = [
            { name: 'To Do', count: statusCounts['To Do'] || 0, color: '#64748b' },
            { name: 'In Progress', count: statusCounts['In Progress'] || 0, color: '#818cf8' }, // Indigo-400
            { name: 'Completed', count: statusCounts['Completed'] || 0, color: '#7c3aed' }, // Violet-600 (Primary)
        ];

        return { totalTasks, totalCompleted, totalPoints, totalMinutes, categoryCounts: statusCounts, chartData };
    }, [tasks]);

    // --- RENDER IF NOT LOGGED IN ---
    if (!user) return <AuthScreen onLogin={handleLogin} />;
    
    // --- RENDER TEST SCREEN ---
    if (view === 'test') {
        return (
            <div className="min-h-screen bg-indigo-50 text-slate-800 font-sans selection:bg-indigo-200">
                <KnowledgeTestScreen onBack={() => setView('dashboard')} />
                {/* Ensure PapaParse is loaded for the Test Screen to function */}
                <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
            </div>
        );
    }


    // --- MAIN DASHBOARD RENDER ---
    return (
        // Main background color to light Indigo for depth
        <div className="min-h-screen bg-indigo-50 text-slate-800 font-sans selection:bg-indigo-200">

            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer">
                            {/* Icon background color to Indigo */}
                            <div className="bg-indigo-600 p-2 rounded-lg shadow-md">
                                <List className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Task Master</h1>
                                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* NEW BUTTON: Test Your Knowledge */}
                            <button
                                onClick={() => setView('test')}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                                title="Test Knowledge"
                            >
                                <Brain className="w-4 h-4" /> Test
                            </button>
                            
                            <button
                                onClick={exportToJSON}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition bg-slate-100 text-slate-600 hover:bg-slate-200"
                                title="Export Data"
                            >
                                <FileJson className="w-4 h-4" /> Export
                            </button>

                            <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-full text-red-500" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* STATUS MESSAGE BAR */}
                    {statusMessage && (
                        // Success message colors to Indigo
                        <div className={`mt-3 p-3 text-sm rounded-lg flex items-center gap-2 transition-all duration-300 ${statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'}`}>
                            {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {statusMessage.msg}
                        </div>
                    )}

                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* SUMMARY METRICS (UPDATED: Added colorful icons and background) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                    {metricMap.map((metric, index) => {
                        const value = analysis[metric.accessor];
                        const Icon = metric.icon;

                        return (
                            // Applying dynamic color class for background and text/icon
                            <div key={metric.name} className={`p-5 rounded-2xl shadow-xl border border-slate-200 ${metric.bg} `}>
                                <div className='flex items-start justify-between'>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{metric.name}</p>
                                    <Icon className={`w-6 h-6 ${metric.color}`} />
                                </div>
                                <div className="text-3xl font-bold text-slate-900">{value}</div>
                            </div>
                        );
                    })}
                </div>

                {/* TASK INPUT FORM */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                    {/* Icon color to Indigo */}
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" /> Add New Task</h2>
                    <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                            <input
                                type="text"
                                name="name"
                                value={taskInput.name}
                                onChange={handleTaskChange}
                                placeholder="e.g., 10 minute meditation"
                                // Focus ring color to Indigo
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                ref={taskInputRef}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                            <select
                                name="duration"
                                value={taskInput.duration}
                                onChange={handleTaskChange}
                                // Focus ring color to Indigo
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={taskInput.category}
                                onChange={handleTaskChange}
                                // Focus ring color to Indigo
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="Fitness">Fitness</option>
                                <option value="Health">Health</option>
                                <option value="Study">Study</option>
                                <option value="Career">Career</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={taskInput.status}
                                onChange={handleTaskChange}
                                // Focus ring color to Indigo
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Points</label>
                            <input
                                type="number"
                                name="points"
                                value={taskInput.points}
                                onChange={handleTaskChange}
                                min="1"
                                // Focus ring color to Indigo
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            // Button background color to Indigo
                            className="md:col-span-6 lg:col-span-1 mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition shadow-md"
                        >
                            <Plus className="w-5 h-5 inline-block mr-1" /> Add Task
                        </button>
                    </form>
                </div>

                {/* TASK LIST TABLE */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" /> Current Tasks
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Task Name</th>
                                    <th scope="col" className="px-6 py-3">Duration</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Points</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-slate-400 italic">No tasks yet. Add your first task to get started! 🚀</td>
                                    </tr>
                                ) : (
                                    tasks.map(task => (
                                        <tr key={task.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{task.name}</td>
                                            <td className="px-6 py-4">{task.duration} min</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryMap[task.category]}`}>
                                                    {task.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMap[task.status]}`}>
                                                    {task.status}
                                                </span>
                                            </td>
                                            {/* Points text color to Indigo */}
                                            <td className="px-6 py-4 font-bold text-indigo-600">{task.points}</td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                {task.status !== 'Completed' && (
                                                    <button
                                                        onClick={() => completeTask(task.id)}
                                                        // Complete button color to Purple
                                                        className="text-white bg-purple-500 hover:bg-purple-600 p-1 rounded-md transition"
                                                        title="Complete"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-white bg-red-500 hover:bg-red-600 p-1 rounded-md transition"
                                                    title="Delete"
                                                >
                                                    <Terminal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CHARTS (Simplified Mock) */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Tasks by Status</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analysis.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis domain={[0, 'auto']} hide />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    {/* Bar color to a Violet shade (#7c3aed is your primary color) */}
                                    <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Tasks by Category</h3>
                        <div className="h-64 flex items-center justify-center">
                            {/* FIX 2: Correctly accessing categoryCounts from the analysis object */}
                            <div className="space-y-3 w-full">
                                {Object.entries(analysis.categoryCounts).map(([category, count]) => (
                                    <div key={category} className="flex justify-between items-center p-3 rounded-lg border border-slate-100">
                                        <div className={`flex items-center gap-3 text-sm font-medium ${categoryMap[category]}`}>
                                            <span className={`w-3 h-3 rounded-full ${categoryMap[category].split(' ')[1].replace('100', '600')}`} />
                                            {category}
                                        </div>
                                        <span className="font-bold text-slate-800">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default TaskMaster;