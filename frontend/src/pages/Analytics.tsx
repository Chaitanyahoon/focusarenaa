import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale,
    ArcElement,
    BarElement
} from 'chart.js'
import { Line, Radar, Doughnut, Bar } from 'react-chartjs-2'
import { useEffect, useState } from 'react'
import { analyticsAPI } from '../services/api'
import StreakHeatmap from '../components/charts/StreakHeatmap'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale,
    ArcElement,
    BarElement
)

// System Theme Colors
const COLORS = {
    grid: 'rgba(56, 189, 248, 0.1)', // Blue-400 equivalent
    text: '#94a3b8',
    primary: '#3b82f6',
    accent: '#22c55e',
    danger: '#ef4444'
}

// Common Options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#e2e8f0',
                font: { family: "'Exo 2', sans-serif" }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(5, 9, 20, 0.9)',
            titleColor: '#38bdf8',
            bodyColor: '#e2e8f0',
            borderColor: '#38bdf8',
            borderWidth: 1,
            displayColors: false,
            padding: 10,
            cornerRadius: 0
        }
    },
    scales: {
        x: {
            grid: { color: COLORS.grid },
            ticks: { color: COLORS.text }
        },
        y: {
            grid: { color: COLORS.grid },
            ticks: { color: COLORS.text }
        }
    }
}

export default function Analytics() {
    const [xpHistory, setXpHistory] = useState<any>(null)
    const [categoryDist, setCategoryDist] = useState<any>(null)
    const [weeklyProd, setWeeklyProd] = useState<any>(null)
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [xpRes, catRes, statsRes, weeklyRes] = await Promise.all([
                    analyticsAPI.getXPHistory(7),
                    analyticsAPI.getCategoryDistribution(),
                    analyticsAPI.getDashboardStats(),
                    analyticsAPI.getWeeklyProductivity()
                ])

                // Process XP Data
                setXpHistory({
                    labels: xpRes.data.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
                    datasets: [{
                        label: 'XP Gained',
                        data: xpRes.data.map(d => d.xpEarned),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#00EAFF',
                        pointBorderColor: '#fff'
                    }]
                })

                // Process Category Data
                setCategoryDist({
                    labels: catRes.map(c => c.category),
                    datasets: [{
                        data: catRes.map(c => c.count),
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(168, 85, 247, 0.6)',
                            'rgba(34, 197, 94, 0.6)',
                            'rgba(239, 68, 68, 0.6)',
                            'rgba(245, 158, 11, 0.6)'
                        ],
                        borderColor: '#0f172a',
                        borderWidth: 2
                    }]
                })

                // Process Weekly Data
                setWeeklyProd({
                    labels: weeklyRes.weeks.map(w => `Week ${w.weekNumber}`),
                    datasets: [{
                        label: 'Productivity Score',
                        data: weeklyRes.weeks.map(w => w.productivityScore),
                        backgroundColor: 'rgba(249, 115, 22, 0.6)', // Orange
                        borderColor: '#ea580c',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                })

                setStats(statsRes)
            } catch (error) {
                console.error("Failed to load analytics", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-blue-500 font-display animate-pulse text-xl">
                    ANALYZING COMBAT DATA...
                </div>
            </div>
        )
    }

    // Default empty state for Radar (Attributes not yet in backend)
    const skillsData = {
        labels: ['Strength', 'Focus', 'Intelligence', 'Endurance', 'Agility'],
        datasets: [{
            label: 'Hunter Attributes',
            data: [stats?.level || 1, stats?.completedTasks % 10 + 1, stats?.totalXP % 20 + 1, stats?.currentStreak + 1, 5],
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            borderColor: '#22c55e',
            borderWidth: 2,
            pointBackgroundColor: '#22c55e',
        }]
    }

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-widest uppercase">
                    Battle Analytics
                </h1>
                <div className="h-1 w-32 bg-purple-500 mx-auto mb-4 shadow-[0_0_10px_#a855f7]"></div>
                <div className="flex justify-center gap-8 text-sm font-mono text-gray-400">
                    <div>TOTAL XP: <span className="text-white">{stats?.totalXP}</span></div>
                    <div>TASKS CLEARED: <span className="text-white">{stats?.completedTasks}</span></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {/* XP Growth Chart */}
                <div className="lg:col-span-2 system-panel p-6 min-h-[400px]">
                    <h3 className="text-xl font-display font-bold text-blue-400 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        XP GROWTH TRAJECTORY (7 DAYS)
                    </h3>
                    <div className="h-[300px]">
                        {xpHistory && <Line data={xpHistory} options={commonOptions} />}
                    </div>
                </div>

                {/* Focus Distribution */}
                <div className="system-panel p-6 min-h-[400px]">
                    <h3 className="text-xl font-display font-bold text-purple-400 mb-6">FOCUS DISTRIBUTION</h3>
                    <div className="h-[300px] flex items-center justify-center">
                        {categoryDist ? (
                            <Doughnut
                                data={categoryDist}
                                options={{
                                    ...commonOptions,
                                    scales: {},
                                    plugins: {
                                        ...commonOptions.plugins,
                                        legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { family: "'Exo 2'" } } }
                                    }
                                }}
                            />
                        ) : (
                            <div className="text-gray-500 text-sm">NO COMBAT DATA AVAILABLE</div>
                        )}
                    </div>
                </div>

                {/* Attribute Radar */}
                <div className="system-panel p-6 min-h-[400px]">
                    <h3 className="text-xl font-display font-bold text-green-400 mb-6">ATTRIBUTE RADAR (ESTIMATED)</h3>
                    <div className="h-[300px]">
                        <Radar
                            data={skillsData}
                            options={{
                                ...commonOptions,
                                scales: {
                                    r: {
                                        angleLines: { color: COLORS.grid },
                                        grid: { color: COLORS.grid },
                                        pointLabels: { color: '#e2e8f0', font: { family: "'Rajdhani', sans-serif" } },
                                        ticks: { display: false }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Weekly Productivity */}
                <div className="system-panel p-6 min-h-[400px]">
                    <h3 className="text-xl font-display font-bold text-orange-400 mb-6">WEEKLY PRODUCTIVITY</h3>
                    <div className="h-[300px]">
                        {weeklyProd ? (
                            <Bar
                                data={weeklyProd}
                                options={{
                                    ...commonOptions,
                                    plugins: {
                                        ...commonOptions.plugins,
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: {
                                            ...commonOptions.scales.y,
                                            beginAtZero: true,
                                            grid: { color: COLORS.grid }
                                        },
                                        x: {
                                            ...commonOptions.scales.x,
                                            grid: { display: false }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 font-mono text-sm">
                                NO DATA
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div className="lg:col-span-2">
                    <StreakHeatmap />
                </div>

            </div>
        </div>
    )
}
