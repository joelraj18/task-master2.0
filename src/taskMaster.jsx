import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
    Brain, TrendingUp, Activity, Terminal, Zap,
    CheckCircle2, AlertCircle, Download, Upload, ChevronRight, Clock,
    Lock, User, Mail, LogOut, Lightbulb, Moon, Sun, Coffee, ArrowRight, FileJson, List, Plus
} from 'lucide-react';

// --- 1. UTILITY FUNCTIONS (Simplified) ---

// These original utility functions are kept but not strictly needed for the new, simpler task manager logic.
// They are commented out or kept minimized to respect the prompt's request to "change main component".
// const calculateNeuroProbability = (targetHour, duration, history, dailyLog) => { /* ... */ };
// const parseTimeToken = (token) => { /* ... */ };
// const formatDecimalTime = (decimalTime) => { /* ... */ };

// Placeholder for SCIENCE_TIPS to prevent errors, though the tips view is removed.
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
            // In the original, the user object stored the name, email, and password.
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-emerald-600 p-3 rounded-xl shadow-lg">
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
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition shadow-md">
                            {isRegistering ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-sm text-emerald-600 font-medium hover:text-emerald-700 transition"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. NEW MAIN APP COMPONENT (Task Manager) ---

// Maps category names to Tailwind CSS classes
const categoryMap = {
    Fitness: 'text-rose-600 bg-rose-100',
    Health: 'text-cyan-600 bg-cyan-100',
    Study: 'text-blue-600 bg-blue-100',
    Career: 'text-amber-600 bg-amber-100',
};

// Maps status names to Tailwind CSS classes
const statusMap = {
    'To Do': 'text-slate-600 bg-slate-100',
    'In Progress': 'text-yellow-600 bg-yellow-100',
    'Completed': 'text-emerald-600 bg-emerald-100',
};


const TaskMaster = () => {
    // Auth State (kept from original)
    const [user, setUser] = useState(null);

    // New Task Manager State
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState({
        name: '',
        duration: 15,
        category: 'Fitness',
        status: 'To Do',
        points: 10,
    });
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', msg: string }
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

        // Chart Data (Mocking reChart format, though we won't render Chart.js)
        const categoryCounts = tasks.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
        }, {});

        const statusCounts = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});

        const chartData = [
            { name: 'To Do', count: statusCounts['To Do'] || 0, color: '#64748b' },
            { name: 'In Progress', count: statusCounts['In Progress'] || 0, color: '#f59e0b' },
            { name: 'Completed', count: statusCounts['Completed'] || 0, color: '#10b981' },
        ];

        return { totalTasks, totalCompleted, totalPoints, totalMinutes, categoryCounts, chartData };
    }, [tasks]);

    // --- RENDER IF NOT LOGGED IN ---
    if (!user) return <AuthScreen onLogin={handleLogin} />;

    // --- MAIN DASHBOARD RENDER ---
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100">

            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="bg-emerald-600 p-2 rounded-lg shadow-md">
                                <List className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">Task Master</h1>
                                <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                        <div className={`mt-3 p-3 text-sm rounded-lg flex items-center gap-2 transition-all duration-300 ${statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                            {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {statusMessage.msg}
                        </div>
                    )}

                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* SUMMARY METRICS (Code B adaptation) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Tasks</p>
                        <div className="text-3xl font-bold text-slate-800">{analysis.totalTasks}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Completed</p>
                        <div className="text-3xl font-bold text-slate-800">{analysis.totalCompleted}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Points</p>
                        <div className="text-3xl font-bold text-slate-800">{analysis.totalPoints}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Minutes Invested</p>
                        <div className="text-3xl font-bold text-slate-800">{analysis.totalMinutes}</div>
                    </div>
                </div>

                {/* TASK INPUT FORM (Code B adaptation) */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-600" /> Add New Task</h2>
                    <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                            <input
                                type="text"
                                name="name"
                                value={taskInput.name}
                                onChange={handleTaskChange}
                                placeholder="e.g., 10 minute meditation"
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                ref={taskInputRef}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                            <select
                                name="duration"
                                value={taskInput.duration}
                                onChange={handleTaskChange}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="md:col-span-6 lg:col-span-1 mt-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition shadow-md"
                        >
                            <Plus className="w-5 h-5 inline-block mr-1" /> Add Task
                        </button>
                    </form>
                </div>

                {/* TASK LIST TABLE (Code B adaptation) */}
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
                                            <td className="px-6 py-4 font-bold text-emerald-600">{task.points}</td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                {task.status !== 'Completed' && (
                                                    <button
                                                        onClick={() => completeTask(task.id)}
                                                        className="text-white bg-green-500 hover:bg-green-600 p-1 rounded-md transition"
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
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Tasks by Category</h3>
                        <div className="h-64 flex items-center justify-center">
                            {/* Recharts PieChart or RadarChart would be complex to set up here without a full library re-import */}
                            {/* We use a simple list mock for visual simplicity, simulating a Pie/Doughnut result */}
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

// The AuthScreen component remains the same for sign in/register functionality,
// and TaskMasterApp is now the main component, replacing the original, complex taskMaster.