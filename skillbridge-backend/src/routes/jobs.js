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

// Get all jobs (with filters)
router.get('/list', async (req, res) => {
  try {
    const { 
      type, 
      location, 
      remote, 
      skills, 
      search,
      page = 1,
      limit = 10 
    } = req.query;

    const db = getDatabase();
    let query = `
      SELECT 
        j.*,
        c.name as company_name,
        c.logo_url as company_logo,
        c.location as company_location
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.approved = 1 AND j.status = 'active'
    `;
    
    const params = [];

    if (type) {
      query += ' AND j.type = ?';
      params.push(type);
    }

    if (location && location !== 'all') {
      query += ' AND (j.location LIKE ? OR j.remote = 1)';
      params.push(`%${location}%`);
    }

    if (remote === 'true') {
      query += ' AND j.remote = 1';
    }

    if (skills) {
      const skillsArray = skills.split(',');
      const skillConditions = skillsArray.map(() => 'j.skills_required LIKE ?').join(' OR ');
      query += ` AND (${skillConditions})`;
      skillsArray.forEach(skill => params.push(`%${skill.trim()}%`));
    }

    if (search) {
      query += ' AND (j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY j.created_at DESC';

    // Add pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const jobs = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          // Parse JSON fields
          const parsedJobs = rows.map(job => ({
            ...job,
            requirements: job.requirements ? JSON.parse(job.requirements) : [],
            skills_required: job.skills_required ? JSON.parse(job.skills_required) : []
          }));
          resolve(parsedJobs);
        }
      });
    });

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE j.approved = 1 AND j.status = 'active'
    `;
    
    let countParams = [];
    
    if (type) {
      countQuery += ' AND j.type = ?';
      countParams.push(type);
    }

    if (location && location !== 'all') {
      countQuery += ' AND (j.location LIKE ? OR j.remote = 1)';
      countParams.push(`%${location}%`);
    }

    if (remote === 'true') {
      countQuery += ' AND j.remote = 1';
    }

    if (skills) {
      const skillsArray = skills.split(',');
      const skillConditions = skillsArray.map(() => 'j.skills_required LIKE ?').join(' OR ');
      countQuery += ` AND (${skillConditions})`;
      skillsArray.forEach(skill => countParams.push(`%${skill.trim()}%`));
    }

    if (search) {
      countQuery += ' AND (j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const { total } = await new Promise((resolve, reject) => {
      db.get(countQuery, countParams, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const job = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          j.*,
          c.name as company_name,
          c.description as company_description,
          c.logo_url as company_logo,
          c.website as company_website,
          c.industry as company_industry,
          c.size as company_size,
          c.location as company_location
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Parse JSON fields
    const parsedJob = {
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      skills_required: job.skills_required ? JSON.parse(job.skills_required) : []
    };

    res.json({
      success: true,
      data: parsedJob
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
});

// Create job (employer only)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Only employers can create jobs'
      });
    }

    const {
      title,
      description,
      requirements,
      skills_required,
      type,
      location,
      remote,
      salary_min,
      salary_max,
      stipend,
      duration,
      application_deadline
    } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and type are required'
      });
    }

    const db = getDatabase();

    // Get company ID for the employer
    const company = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM companies WHERE user_id = ?', [req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Company profile not found. Please create a company profile first.'
      });
    }

    const jobId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO jobs (
          company_id, title, description, requirements, skills_required,
          type, location, remote, salary_min, salary_max, stipend,
          duration, application_deadline
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        company.id,
        title,
        description,
        JSON.stringify(requirements || []),
        JSON.stringify(skills_required || []),
        type,
        location || null,
        remote || false,
        salary_min || null,
        salary_max || null,
        stipend || null,
        duration || null,
        application_deadline || null
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { jobId }
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
});

// Apply to job (student only)
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can apply to jobs'
      });
    }

    const { id: jobId } = req.params;
    const { cover_letter } = req.body;
    const userId = req.user.userId;

    const db = getDatabase();

    // Check if job exists
    const job = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM jobs WHERE id = ? AND approved = 1 AND status = "active"', [jobId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not available'
      });
    }

    // Check if already applied
    const existingApplication = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM applications WHERE job_id = ? AND user_id = ?', [jobId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const applicationId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO applications (job_id, user_id, cover_letter) VALUES (?, ?, ?)',
        [jobId, userId, cover_letter || null],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { applicationId }
    });

  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply to job'
    });
  }
});

// Get user applications (student only)
router.get('/my/applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view their applications'
      });
    }

    const db = getDatabase();

    const applications = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.*,
          j.title as job_title,
          j.type as job_type,
          j.location as job_location,
          j.remote as job_remote,
          j.stipend,
          j.salary_min,
          j.salary_max,
          c.name as company_name,
          c.logo_url as company_logo
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        WHERE a.user_id = ?
        ORDER BY a.applied_at DESC
      `, [req.user.userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: applications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

module.exports = router;