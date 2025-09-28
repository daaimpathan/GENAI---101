import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  UserCheck,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Edit3,
  MoreVertical,
  X
} from 'lucide-react';
import axios from 'axios';

interface Job {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string;
  remote: boolean;
  salary_min?: number;
  salary_max?: number;
  stipend?: number;
  status: string;
  approved: boolean;
  created_at: string;
  application_count?: number;
}

interface Application {
  id: number;
  job_title: string;
  applicant_name: string;
  applicant_skills: string[];
  status: string;
  applied_at: string;
}

interface Analytics {
  jobStats: {
    totalJobs: number;
    approvedJobs: number;
    activeJobs: number;
  };
  applicationStats: Array<{
    name: string;
    value: number;
  }>;
  recentApplications: Application[];
}

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchJobs(),
      fetchAnalytics()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchJobs = async () => {
    try {
      // Note: This would need to be implemented in the backend
      // For now, we'll use mock data
      setJobs([
        {
          id: 1,
          title: 'Full Stack Developer Intern',
          description: 'Join our dynamic team...',
          type: 'internship',
          location: 'San Francisco, CA',
          remote: true,
          stipend: 5000,
          status: 'active',
          approved: true,
          created_at: '2025-09-20T10:00:00Z',
          application_count: 15
        },
        {
          id: 2,
          title: 'Data Science Intern',
          description: 'Work with our data science team...',
          type: 'internship',
          location: 'San Francisco, CA',
          remote: true,
          stipend: 6000,
          status: 'active',
          approved: false,
          created_at: '2025-09-25T14:30:00Z',
          application_count: 8
        }
      ]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/analytics/employer');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for demo
      setAnalytics({
        jobStats: {
          totalJobs: 5,
          approvedJobs: 4,
          activeJobs: 3
        },
        applicationStats: [
          { name: 'Applied', value: 25 },
          { name: 'Shortlisted', value: 8 },
          { name: 'Interviewed', value: 3 },
          { name: 'Selected', value: 1 }
        ],
        recentApplications: []
      });
    }
  };

  const stats = [
    {
      label: 'Total Jobs Posted',
      value: analytics?.jobStats.totalJobs || 0,
      icon: Briefcase,
      color: 'text-blue-600'
    },
    {
      label: 'Active Jobs',
      value: analytics?.jobStats.activeJobs || 0,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Total Applications',
      value: analytics?.applicationStats.reduce((sum, stat) => sum + stat.value, 0) || 0,
      icon: Users,
      color: 'text-purple-600'
    },
    {
      label: 'Candidates Hired',
      value: analytics?.applicationStats.find(stat => stat.name === 'Selected')?.value || 0,
      icon: UserCheck,
      color: 'text-orange-600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getApprovalStatus = (approved: boolean) => {
    return approved ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
        Approved
      </span>
    ) : (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium">
        Pending Review
      </span>
    );
  };

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
                  <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
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
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Employer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your job postings and track applications
            </p>
          </div>
          <button
            onClick={() => setShowJobForm(true)}
            className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
          >
            <Plus size={20} />
            <span>Post New Job</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
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
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job listings */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Job Postings
                </h2>
                <button className="btn-secondary text-sm">
                  View All
                </button>
              </div>

              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <MapPin size={14} />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{new Date(job.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                          {getApprovalStatus(job.approved)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {job.application_count || 0} applications
                          </span>
                          <button className="text-primary-600 hover:text-primary-500 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Jobs Posted Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start by posting your first job opening
                  </p>
                  <button
                    onClick={() => setShowJobForm(true)}
                    className="btn-primary"
                  >
                    Post Your First Job
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowJobForm(true)}
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <Plus className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Post New Job
                  </span>
                </button>
                <Link
                  to="/employer/candidates"
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Browse Candidates
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Edit Company Profile
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Recent applications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Applications
              </h3>
              {analytics?.recentApplications && analytics.recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentApplications.slice(0, 5).map((app, index) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {app.applicant_name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Applied to {app.job_title}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No applications yet
                  </p>
                </div>
              )}
            </motion.div>

            {/* Application stats */}
            {analytics?.applicationStats && analytics.applicationStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Application Pipeline
                </h3>
                <div className="space-y-3">
                  {analytics.applicationStats.map((stat, index) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${(stat.value / Math.max(...analytics.applicationStats.map(s => s.value))) * 100}%` 
                            }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            className="bg-primary-500 h-2 rounded-full"
                          ></motion.div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-right">
                          {stat.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Job posting modal */}
      {showJobForm && (
        <JobPostingModal 
          onClose={() => setShowJobForm(false)}
          onJobCreated={() => {
            setShowJobForm(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

// Job posting modal component
interface JobPostingModalProps {
  onClose: () => void;
  onJobCreated: () => void;
}

const JobPostingModal: React.FC<JobPostingModalProps> = ({ onClose, onJobCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'internship',
    location: '',
    remote: false,
    salary_min: '',
    salary_max: '',
    stipend: '',
    duration: '',
    requirements: [''],
    skills_required: [''],
    application_deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        skills_required: formData.skills_required.filter(skill => skill.trim()),
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        stipend: formData.stipend ? parseInt(formData.stipend) : null,
      };

      const response = await axios.post('/jobs/create', jobData);
      if (response.data.success) {
        onJobCreated();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills_required: [...prev.skills_required, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.map((skill, i) => i === index ? value : skill)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Post New Job
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="e.g. Frontend Developer Intern"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="input-field"
                required
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              placeholder="Describe the role, responsibilities, and what makes your company great..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="input-field"
                placeholder="e.g. San Francisco, CA"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.remote}
                  onChange={(e) => setFormData(prev => ({ ...prev, remote: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Remote Work Available
                </span>
              </label>
            </div>
          </div>

          {formData.type === 'internship' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stipend (₹/month)
                </label>
                <input
                  type="number"
                  value={formData.stipend}
                  onChange={(e) => setFormData(prev => ({ ...prev, stipend: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. 25000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. 3 months"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Salary (₹/year)
                </label>
                <input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary_min: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. 600000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Salary (₹/year)
                </label>
                <input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary_max: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. 1200000"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Application Deadline
            </label>
            <input
              type="date"
              value={formData.application_deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
              className="input-field"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Post Job'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EmployerDashboard;