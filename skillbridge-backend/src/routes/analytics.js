const express = require('express');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get overview analytics (admin only)
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access analytics'
      });
    }

    const db = getDatabase();

    // Get basic counts
    const stats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM users WHERE role = 'employer') as total_employers,
          (SELECT COUNT(*) FROM jobs WHERE approved = 1) as total_jobs,
          (SELECT COUNT(*) FROM applications) as total_applications,
          (SELECT COUNT(*) FROM applications WHERE status = 'selected') as placed_students
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });

    // Get application status distribution
    const applicationStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT status, COUNT(*) as count
        FROM applications
        GROUP BY status
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get job type distribution
    const jobTypeStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT type, COUNT(*) as count
        FROM jobs
        WHERE approved = 1
        GROUP BY type
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get monthly application trends (last 6 months)
    const monthlyTrends = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          strftime('%Y-%m', applied_at) as month,
          COUNT(*) as applications
        FROM applications
        WHERE applied_at >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', applied_at)
        ORDER BY month
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get top skills demanded
    const topSkills = await new Promise((resolve, reject) => {
      db.all(`
        SELECT skills_required
        FROM jobs
        WHERE approved = 1 AND skills_required IS NOT NULL
      `, (err, rows) => {
        if (err) reject(err);
        else {
          // Parse and count skills
          const skillCounts = {};
          rows.forEach(row => {
            if (row.skills_required) {
              try {
                const skills = JSON.parse(row.skills_required);
                skills.forEach(skill => {
                  skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
              } catch (e) {
                // Skip invalid JSON
              }
            }
          });
          
          // Convert to array and sort
          const sortedSkills = Object.entries(skillCounts)
            .map(([skill, count]) => ({ skill, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
          
          resolve(sortedSkills);
        }
      });
    });

    // Get company with most jobs
    const topCompanies = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.name,
          COUNT(j.id) as job_count
        FROM companies c
        LEFT JOIN jobs j ON c.id = j.company_id AND j.approved = 1
        GROUP BY c.id, c.name
        HAVING job_count > 0
        ORDER BY job_count DESC
        LIMIT 5
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents: stats.total_students || 0,
          totalEmployers: stats.total_employers || 0,
          totalJobs: stats.total_jobs || 0,
          totalApplications: stats.total_applications || 0,
          placedStudents: stats.placed_students || 0,
          placementRate: stats.total_students > 0 
            ? ((stats.placed_students || 0) / stats.total_students * 100).toFixed(1)
            : 0
        },
        applicationStats: applicationStats.map(stat => ({
          name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
          value: stat.count
        })),
        jobTypeStats: jobTypeStats.map(stat => ({
          name: stat.type.charAt(0).toUpperCase() + stat.type.slice(1),
          value: stat.count
        })),
        monthlyTrends: monthlyTrends.map(trend => ({
          month: trend.month,
          applications: trend.applications
        })),
        topSkills,
        topCompanies
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get employer analytics
router.get('/employer', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can access employer analytics'
      });
    }

    const db = getDatabase();

    // Get employer's company
    const company = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM companies WHERE user_id = ?', [req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get job statistics
    const jobStats = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN approved = 1 THEN 1 END) as approved_jobs,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs
        FROM jobs
        WHERE company_id = ?
      `, [company.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Get application statistics
    const applicationStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.status,
          COUNT(*) as count
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE j.company_id = ?
        GROUP BY a.status
      `, [company.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get recent applications
    const recentApplications = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.*,
          j.title as job_title,
          p.full_name as applicant_name,
          p.skills as applicant_skills
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN profiles p ON a.user_id = p.user_id
        WHERE j.company_id = ?
        ORDER BY a.applied_at DESC
        LIMIT 10
      `, [company.id], (err, rows) => {
        if (err) reject(err);
        else {
          const parsedApplications = rows.map(app => ({
            ...app,
            applicant_skills: app.applicant_skills ? JSON.parse(app.applicant_skills) : []
          }));
          resolve(parsedApplications);
        }
      });
    });

    res.json({
      success: true,
      data: {
        jobStats: {
          totalJobs: jobStats.total_jobs || 0,
          approvedJobs: jobStats.approved_jobs || 0,
          activeJobs: jobStats.active_jobs || 0
        },
        applicationStats: applicationStats.map(stat => ({
          name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
          value: stat.count
        })),
        recentApplications
      }
    });

  } catch (error) {
    console.error('Get employer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employer analytics'
    });
  }
});

module.exports = router;