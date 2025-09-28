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

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();

    if (req.user.role === 'employer') {
      // Get company profile
      const profile = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            u.email, u.role,
            p.full_name, p.phone, p.bio, p.avatar_url,
            c.name as company_name, c.description as company_description,
            c.logo_url, c.website, c.industry, c.size, c.location
          FROM users u
          LEFT JOIN profiles p ON u.id = p.user_id
          LEFT JOIN companies c ON u.id = c.user_id
          WHERE u.id = ?
        `, [req.user.userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      res.json({
        success: true,
        data: profile
      });
    } else {
      // Get student/admin profile
      const profile = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            u.email, u.role,
            p.*
          FROM users u
          LEFT JOIN profiles p ON u.id = p.user_id
          WHERE u.id = ?
        `, [req.user.userId], (err, row) => {
          if (err) reject(err);
          else {
            if (row) {
              // Parse JSON fields
              row.skills = row.skills ? JSON.parse(row.skills) : [];
              row.experience = row.experience ? JSON.parse(row.experience) : [];
              row.education = row.education ? JSON.parse(row.education) : [];
            }
            resolve(row);
          }
        });
      });

      res.json({
        success: true,
        data: profile
      });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update profile
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase();

    if (req.user.role === 'employer') {
      // Update company profile
      const {
        full_name,
        phone,
        bio,
        company_name,
        company_description,
        website,
        industry,
        size,
        location
      } = req.body;

      // Update personal profile
      if (full_name || phone || bio) {
        await new Promise((resolve, reject) => {
          const updates = [];
          const values = [];
          
          if (full_name) {
            updates.push('full_name = ?');
            values.push(full_name);
          }
          if (phone) {
            updates.push('phone = ?');
            values.push(phone);
          }
          if (bio) {
            updates.push('bio = ?');
            values.push(bio);
          }
          
          values.push(req.user.userId);
          
          db.run(
            `UPDATE profiles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
            values,
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      // Update or create company profile
      if (company_name || company_description || website || industry || size || location) {
        const company = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM companies WHERE user_id = ?', [req.user.userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        if (company) {
          // Update existing company
          const updates = [];
          const values = [];
          
          if (company_name) {
            updates.push('name = ?');
            values.push(company_name);
          }
          if (company_description) {
            updates.push('description = ?');
            values.push(company_description);
          }
          if (website) {
            updates.push('website = ?');
            values.push(website);
          }
          if (industry) {
            updates.push('industry = ?');
            values.push(industry);
          }
          if (size) {
            updates.push('size = ?');
            values.push(size);
          }
          if (location) {
            updates.push('location = ?');
            values.push(location);
          }
          
          values.push(company.id);
          
          await new Promise((resolve, reject) => {
            db.run(
              `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`,
              values,
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        } else {
          // Create new company
          await new Promise((resolve, reject) => {
            db.run(`
              INSERT INTO companies (user_id, name, description, website, industry, size, location)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              req.user.userId,
              company_name || '',
              company_description || '',
              website || null,
              industry || null,
              size || null,
              location || null
            ], function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }

    } else {
      // Update student/admin profile
      const {
        full_name,
        phone,
        bio,
        skills,
        experience,
        education,
        location,
        website,
        github,
        linkedin
      } = req.body;

      const updates = [];
      const values = [];
      
      if (full_name) {
        updates.push('full_name = ?');
        values.push(full_name);
      }
      if (phone) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (bio) {
        updates.push('bio = ?');
        values.push(bio);
      }
      if (skills) {
        updates.push('skills = ?');
        values.push(JSON.stringify(skills));
      }
      if (experience) {
        updates.push('experience = ?');
        values.push(JSON.stringify(experience));
      }
      if (education) {
        updates.push('education = ?');
        values.push(JSON.stringify(education));
      }
      if (location) {
        updates.push('location = ?');
        values.push(location);
      }
      if (website) {
        updates.push('website = ?');
        values.push(website);
      }
      if (github) {
        updates.push('github = ?');
        values.push(github);
      }
      if (linkedin) {
        updates.push('linkedin = ?');
        values.push(linkedin);
      }
      
      if (updates.length > 0) {
        values.push(req.user.userId);
        
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE profiles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
            values,
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get recommendations for students
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can get recommendations'
      });
    }

    const db = getDatabase();

    // Get student's skills
    const profile = await new Promise((resolve, reject) => {
      db.get('SELECT skills FROM profiles WHERE user_id = ?', [req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    let recommendations = [];

    if (profile && profile.skills) {
      const userSkills = JSON.parse(profile.skills);
      
      if (userSkills.length > 0) {
        // Find jobs that match user's skills
        const skillConditions = userSkills.map(() => 'j.skills_required LIKE ?').join(' OR ');
        const params = userSkills.map(skill => `%${skill}%`);
        
        recommendations = await new Promise((resolve, reject) => {
          db.all(`
            SELECT 
              j.*,
              c.name as company_name,
              c.logo_url as company_logo,
              c.location as company_location
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.approved = 1 AND j.status = 'active'
              AND (${skillConditions})
              AND j.id NOT IN (
                SELECT job_id FROM applications WHERE user_id = ?
              )
            ORDER BY j.created_at DESC
            LIMIT 5
          `, [...params, req.user.userId], (err, rows) => {
            if (err) reject(err);
            else {
              const parsedJobs = rows.map(job => ({
                ...job,
                requirements: job.requirements ? JSON.parse(job.requirements) : [],
                skills_required: job.skills_required ? JSON.parse(job.skills_required) : []
              }));
              resolve(parsedJobs);
            }
          });
        });
      }
    }

    // If no skill-based recommendations, get latest jobs
    if (recommendations.length === 0) {
      recommendations = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            j.*,
            c.name as company_name,
            c.logo_url as company_logo,
            c.location as company_location
          FROM jobs j
          JOIN companies c ON j.company_id = c.id
          WHERE j.approved = 1 AND j.status = 'active'
            AND j.id NOT IN (
              SELECT job_id FROM applications WHERE user_id = ?
            )
          ORDER BY j.created_at DESC
          LIMIT 5
        `, [req.user.userId], (err, rows) => {
          if (err) reject(err);
          else {
            const parsedJobs = rows.map(job => ({
              ...job,
              requirements: job.requirements ? JSON.parse(job.requirements) : [],
              skills_required: job.skills_required ? JSON.parse(job.skills_required) : []
            }));
            resolve(parsedJobs);
          }
        });
      });
    }

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

module.exports = router;