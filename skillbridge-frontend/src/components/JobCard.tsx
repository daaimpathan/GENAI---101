import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  company_name: string;
  company_logo?: string;
  location: string;
  remote: boolean;
  type: 'internship' | 'full-time' | 'part-time' | 'contract';
  salary_min?: number;
  salary_max?: number;
  stipend?: number;
  duration?: string;
  skills_required: string[];
  created_at: string;
  applied?: boolean;
}

interface JobCardProps {
  job: Job;
  onSave?: (jobId: number) => void;
  isSaved?: boolean;
  showApplyButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onSave, 
  isSaved = false, 
  showApplyButton = true 
}) => {
  const formatSalary = () => {
    if (job.stipend) {
      return `₹${job.stipend.toLocaleString()}/month`;
    }
    if (job.salary_min && job.salary_max) {
      return `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`;
    }
    if (job.salary_min) {
      return `₹${job.salary_min.toLocaleString()}+`;
    }
    return 'Salary not disclosed';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'full-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'contract':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card p-6 hover:shadow-2xl group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {job.company_logo ? (
            <img 
              src={job.company_logo} 
              alt={job.company_name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {job.company_name}
            </p>
          </div>
        </div>
        
        {onSave && (
          <button
            onClick={() => onSave(job.id)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isSaved ? (
              <BookmarkCheck className="h-5 w-5 text-primary-600" />
            ) : (
              <Bookmark className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Job type and remote badge */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
          {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
        </span>
        {job.remote && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Remote
          </span>
        )}
        {job.applied && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Applied
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Skills */}
      {job.skills_required && job.skills_required.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills_required.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-lg text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills_required.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-lg text-xs">
                +{job.skills_required.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job details */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <MapPin size={16} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DollarSign size={16} />
          <span>{formatSalary()}</span>
        </div>
        {job.duration && (
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{job.duration}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={14} />
          <span>{timeAgo(job.created_at)}</span>
        </div>
        
        {showApplyButton && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/jobs/${job.id}`}
              className="btn-secondary text-sm py-2 px-4"
            >
              View Details
            </Link>
            {!job.applied && (
              <Link
                to={`/jobs/${job.id}`}
                className="btn-primary text-sm py-2 px-4"
              >
                Apply Now
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JobCard;