# 🚀 SkillBridge Quick Setup Guide

## One-Command Setup

```bash
# Install all dependencies and start development servers
npm run install-all && npm run dev
```

## Manual Setup

### 1. Install Dependencies
```bash
# Backend dependencies
cd skillbridge-backend
npm install

# Frontend dependencies  
cd ../skillbridge-frontend
npm install
```

### 2. Start Development Servers

**Option A: Use the startup script**
```bash
./start-dev.sh
```

**Option B: Start manually**
```bash
# Terminal 1 - Backend
cd skillbridge-backend
npm run dev

# Terminal 2 - Frontend  
cd skillbridge-frontend
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@example.com | password123 |
| Employer | employer@techcorp.com | password123 |
| Admin | admin@skillbridge.com | password123 |

## 📱 Features to Test

### As a Student:
1. 📝 Register/Login
2. 🎯 Complete profile with skills
3. 🔍 Browse job board with filters
4. 📋 Apply to jobs with one click
5. 📊 View dashboard with recommendations
6. 📈 Track application status

### As an Employer:
1. 📝 Register/Login as employer
2. 🏢 Complete company profile
3. ➕ Post new job openings
4. 👥 View applications and candidates
5. 📊 Monitor hiring analytics
6. ✅ Manage job approval status

### As an Admin:
1. 📝 Login with admin account
2. 📊 View comprehensive analytics
3. ✅ Approve/reject job postings
4. 📈 Monitor placement statistics
5. 🎯 Track platform performance
6. 📋 Generate reports

## 🎨 Design Features

- ✅ Dark/Light mode toggle
- ✅ Smooth animations with Framer Motion
- ✅ Mobile-first responsive design
- ✅ Modern gradient color scheme
- ✅ Professional typography (Inter/Poppins)
- ✅ Intuitive user experience
- ✅ Loading states and error handling

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 5000
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9
```

### Build Issues
```bash
# Clear npm cache and reinstall
cd skillbridge-frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
The SQLite database is automatically created and populated with demo data on first run. If you need to reset:
```bash
cd skillbridge-backend
rm -f src/database.sqlite
npm run dev  # This will recreate the database
```

## 📞 Need Help?

1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify ports 3000 and 5000 are available
4. Check that both servers are running

---

🎉 **You're ready to explore SkillBridge!** 

Navigate to http://localhost:3000 and start with one of the demo accounts above.