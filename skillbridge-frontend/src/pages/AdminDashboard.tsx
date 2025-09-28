import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Users,
  Briefcase,
  TrendingUp,
  Building2,
  CheckCircle,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  Eye,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import axios from 'axios';

interface Analytics {
  overview: {
    totalStudents: number;
    totalEmployers: number;
    totalJobs: number;
    totalApplications: number;
    placedStudents: number;
    placementRate: string;
  };
  applicationStats: Array<{
    name: string;
    value: number;
  }>;
  jobTypeStats: Array<{
    name: string;
    value: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    applications: number;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  topCompanies: Array<{
    name: string;
    job_count: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');

  useEffect(() => {
    Promise.all([
      fetchAnalytics(),
      fetchPendingJobs()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics/overview');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for demo
      setAnalytics({
        overview: {
          totalStudents: 1250,
          totalEmployers: 89,
          totalJobs: 324,
          totalApplications: 2847,
          placedStudents: 186,
          placementRate: '14.9'
        },
        applicationStats: [
          { name: 'Applied', value: 1450 },
          { name: 'Shortlisted', value: 420 },
          { name: 'Interviewed', value: 186 },
          { name: 'Selected', value: 89 },
          { name: 'Rejected', value: 702 }
        ],
        jobTypeStats: [
          { name: 'Internship', value: 180 },
          { name: 'Full-time', value: 95 },
          { name: 'Part-time', value: 32 },
          { name: 'Contract', value: 17 }
        ],
        monthlyTrends: [
          { month: '2025-04', applications: 245 },
          { month: '2025-05', applications: 298 },
          { month: '2025-06', applications: 387 },
          { month: '2025-07', applications: 445 },
          { month: '2025-08', applications: 523 },
          { month: '2025-09', applications: 567 }
        ],
        topSkills: [
          { skill: 'JavaScript', count: 145 },
          { skill: 'React', count: 132 },
          { skill: 'Python', count: 118 },
          { skill: 'Node.js', count: 97 },
          { skill: 'Java', count: 89 }
        ],
        topCompanies: [
          { name: 'TechCorp Solutions', job_count: 12 },
          { name: 'InnovateTech', job_count: 8 },
          { name: 'DataDriven Inc', job_count: 6 },
          { name: 'CloudFirst', job_count: 5 }
        ]
      });
    }
  };

  const fetchPendingJobs = async () => {
    try {
      // Mock pending jobs data
      setPendingJobs([
        {
          id: 1,
          title: 'Backend Developer Intern',
          company_name: 'StartupX',
          created_at: '2025-09-26T10:00:00Z'
        },
        {
          id: 2,
          title: 'UI/UX Designer',
          company_name: 'DesignCorp',
          created_at: '2025-09-25T15:30:00Z'
        }
      ] as any);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
    }
  };

  const mainStats = [
    {
      label: 'Total Students',
      value: analytics?.overview.totalStudents || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Total Employers',
      value: analytics?.overview.totalEmployers || 0,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Active Jobs',
      value: analytics?.overview.totalJobs || 0,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      label: 'Placement Rate',
      value: analytics?.overview.placementRate || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      suffix: '%'
    }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Placement Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor platform performance and student success
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="input-field text-sm"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="btn-secondary flex items-center space-x-2">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}{stat.suffix || ''}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Application trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Application Trends
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Application status distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Application Status Distribution
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analytics?.applicationStats || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(analytics?.applicationStats || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {analytics?.applicationStats.map((stat, index) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Job type distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Job Type Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.jobTypeStats || []}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending approvals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pending Approvals
                </h3>
                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                  {pendingJobs.length}
                </span>
              </div>

              {pendingJobs.length > 0 ? (
                <div className="space-y-3">
                  {pendingJobs.slice(0, 5).map((job: any, index) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {job.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {job.company_name}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded">
                          <CheckCircle size={16} />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All jobs approved!
                  </p>
                </div>
              )}
            </motion.div>

            {/* Top skills in demand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Skills in Demand
              </h3>
              <div className="space-y-3">
                {analytics?.topSkills.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {skill.skill}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${(skill.count / Math.max(...(analytics?.topSkills.map(s => s.count) || [1]))) * 100}%` 
                          }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className="bg-primary-500 h-2 rounded-full"
                        ></motion.div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-right">
                        {skill.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top companies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Most Active Companies
              </h3>
              <div className="space-y-3">
                {analytics?.topCompanies.map((company, index) => (
                  <div key={company.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {company.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {company.job_count} jobs
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Review Applications
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Generate Reports
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Manage Users
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;