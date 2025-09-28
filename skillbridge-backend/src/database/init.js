const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../database.sqlite');

let db;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('✅ Connected to SQLite database');
        createTables()
          .then(() => insertDummyData())
          .then(() => {
            console.log('✅ Database initialized successfully');
            resolve();
          })
          .catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'employer', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Profiles table
      `CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        bio TEXT,
        skills TEXT, -- JSON array as string
        experience TEXT, -- JSON array as string
        education TEXT, -- JSON array as string
        location TEXT,
        website TEXT,
        github TEXT,
        linkedin TEXT,
        resume_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Companies table
      `CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        website TEXT,
        industry TEXT,
        size TEXT,
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Jobs table
      `CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT, -- JSON array as string
        skills_required TEXT, -- JSON array as string
        type TEXT NOT NULL CHECK(type IN ('internship', 'full-time', 'part-time', 'contract')),
        location TEXT,
        remote BOOLEAN DEFAULT FALSE,
        salary_min INTEGER,
        salary_max INTEGER,
        stipend INTEGER,
        duration TEXT, -- for internships
        application_deadline DATE,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'closed')),
        approved BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
      )`,
      
      // Applications table
      `CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        cover_letter TEXT,
        status TEXT DEFAULT 'applied' CHECK(status IN ('applied', 'shortlisted', 'interviewed', 'selected', 'rejected')),
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(job_id, user_id)
      )`
    ];

    let completed = 0;
    tables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`Error creating table ${index}:`, err);
          reject(err);
        } else {
          completed++;
          if (completed === tables.length) {
            console.log('✅ All tables created successfully');
            resolve();
          }
        }
      });
    });
  });
};

const insertDummyData = async () => {
  try {
    // Hash password for dummy users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Insert dummy users
    const users = [
      { email: 'admin@skillbridge.com', password: hashedPassword, role: 'admin' },
      { email: 'student@example.com', password: hashedPassword, role: 'student' },
      { email: 'employer@techcorp.com', password: hashedPassword, role: 'employer' },
      { email: 'john.doe@university.edu', password: hashedPassword, role: 'student' },
      { email: 'hr@innovatetech.com', password: hashedPassword, role: 'employer' }
    ];

    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)',
          [user.email, user.password, user.role],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    // Insert dummy profiles
    const profiles = [
      {
        user_id: 1,
        full_name: 'Admin User',
        phone: '+1-234-567-8900',
        bio: 'Platform Administrator',
        location: 'New York, NY'
      },
      {
        user_id: 2,
        full_name: 'Jane Smith',
        phone: '+1-234-567-8901',
        bio: 'Computer Science student passionate about full-stack development and AI/ML.',
        skills: JSON.stringify(['JavaScript', 'React', 'Python', 'Node.js', 'Machine Learning']),
        education: JSON.stringify([{
          institution: 'MIT',
          degree: 'Bachelor of Science in Computer Science',
          year: '2024',
          gpa: '3.8'
        }]),
        location: 'Cambridge, MA',
        github: 'https://github.com/janesmith',
        linkedin: 'https://linkedin.com/in/janesmith'
      },
      {
        user_id: 4,
        full_name: 'John Doe',
        phone: '+1-234-567-8902',
        bio: 'Final year engineering student with expertise in mobile app development.',
        skills: JSON.stringify(['React Native', 'Flutter', 'Java', 'Swift', 'Firebase']),
        education: JSON.stringify([{
          institution: 'Stanford University',
          degree: 'Bachelor of Engineering in Computer Science',
          year: '2024',
          gpa: '3.9'
        }]),
        location: 'Palo Alto, CA',
        github: 'https://github.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe'
      }
    ];

    for (const profile of profiles) {
      await new Promise((resolve, reject) => {
        const columns = Object.keys(profile).join(', ');
        const placeholders = Object.keys(profile).map(() => '?').join(', ');
        const values = Object.values(profile);
        
        db.run(
          `INSERT OR IGNORE INTO profiles (${columns}) VALUES (${placeholders})`,
          values,
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    // Insert dummy companies
    const companies = [
      {
        user_id: 3,
        name: 'TechCorp Solutions',
        description: 'Leading technology solutions provider specializing in cloud computing and AI.',
        industry: 'Technology',
        size: '1000-5000',
        location: 'San Francisco, CA',
        website: 'https://techcorp.com'
      },
      {
        user_id: 5,
        name: 'InnovateTech',
        description: 'Innovative startup focused on cutting-edge mobile applications.',
        industry: 'Technology',
        size: '50-200',
        location: 'Austin, TX',
        website: 'https://innovatetech.com'
      }
    ];

    for (const company of companies) {
      await new Promise((resolve, reject) => {
        const columns = Object.keys(company).join(', ');
        const placeholders = Object.keys(company).map(() => '?').join(', ');
        const values = Object.values(company);
        
        db.run(
          `INSERT OR IGNORE INTO companies (${columns}) VALUES (${placeholders})`,
          values,
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    // Insert dummy jobs
    const jobs = [
      {
        company_id: 1,
        title: 'Full Stack Developer Intern',
        description: 'Join our dynamic team to work on cutting-edge web applications using React, Node.js, and cloud technologies.',
        requirements: JSON.stringify([
          'Currently pursuing Computer Science or related degree',
          'Experience with JavaScript, React, and Node.js',
          'Familiarity with databases and RESTful APIs',
          'Strong problem-solving skills'
        ]),
        skills_required: JSON.stringify(['JavaScript', 'React', 'Node.js', 'SQL', 'Git']),
        type: 'internship',
        location: 'San Francisco, CA',
        remote: true,
        stipend: 5000,
        duration: '3 months',
        application_deadline: '2025-10-15',
        approved: true
      },
      {
        company_id: 2,
        title: 'Mobile App Developer',
        description: 'Develop innovative mobile applications for iOS and Android platforms.',
        requirements: JSON.stringify([
          'Bachelor\'s degree in Computer Science',
          '2+ years of mobile development experience',
          'Proficiency in React Native or Flutter',
          'Experience with mobile app deployment'
        ]),
        skills_required: JSON.stringify(['React Native', 'Flutter', 'JavaScript', 'Swift', 'Kotlin']),
        type: 'full-time',
        location: 'Austin, TX',
        remote: false,
        salary_min: 80000,
        salary_max: 120000,
        application_deadline: '2025-11-01',
        approved: true
      },
      {
        company_id: 1,
        title: 'Data Science Intern',
        description: 'Work with our data science team to analyze large datasets and build ML models.',
        requirements: JSON.stringify([
          'Pursuing degree in Data Science, Statistics, or Computer Science',
          'Experience with Python and data analysis libraries',
          'Knowledge of machine learning concepts',
          'Strong analytical skills'
        ]),
        skills_required: JSON.stringify(['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL']),
        type: 'internship',
        location: 'San Francisco, CA',
        remote: true,
        stipend: 6000,
        duration: '6 months',
        application_deadline: '2025-10-30',
        approved: true
      }
    ];

    for (const job of jobs) {
      await new Promise((resolve, reject) => {
        const columns = Object.keys(job).join(', ');
        const placeholders = Object.keys(job).map(() => '?').join(', ');
        const values = Object.values(job);
        
        db.run(
          `INSERT OR IGNORE INTO jobs (${columns}) VALUES (${placeholders})`,
          values,
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    console.log('✅ Dummy data inserted successfully');
  } catch (error) {
    console.error('Error inserting dummy data:', error);
    throw error;
  }
};

const getDatabase = () => db;

module.exports = {
  initializeDatabase,
  getDatabase
};