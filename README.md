# SkillBridge / OpportuneX 🌉

A modern placement & internship portal connecting students with opportunities.

## ✨ Features

### 🎓 For Students
- **Smart Job Matching**: AI-powered recommendations based on your skills
- **One-Click Apply**: Apply to multiple jobs instantly
- **Profile Builder**: Comprehensive profile with skills, education, and projects
- **Application Tracking**: Monitor your application status in real-time
- **Personalized Dashboard**: Track progress and get recommendations

### 🏢 For Employers
- **Job Posting**: Easy job posting with detailed requirements
- **Candidate Management**: View and manage applications
- **Company Profile**: Showcase your company culture and values
- **Analytics Dashboard**: Track application metrics and hiring funnel

### 📊 For Placement Cells
- **Analytics Dashboard**: Comprehensive placement statistics
- **Job Approval System**: Review and approve job postings
- **Student Progress Tracking**: Monitor placement rates and trends
- **Reporting Tools**: Generate detailed placement reports

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Recharts** for analytics visualization
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **SQLite** database for data storage
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillbridge
   ```

2. **Install Backend Dependencies**
   ```bash
   cd skillbridge-backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../skillbridge-frontend
   npm install
   ```

4. **Start the Backend Server**
   ```bash
   cd ../skillbridge-backend
   npm run dev
   ```
   Server runs on `http://localhost:5000`

5. **Start the Frontend Development Server**
   ```bash
   cd ../skillbridge-frontend
   npm start
   ```
   App runs on `http://localhost:3000`

## 🔐 Demo Accounts

Use these credentials to test different user roles:

- **Student**: `student@example.com` / `password123`
- **Employer**: `employer@techcorp.com` / `password123`
- **Admin**: `admin@skillbridge.com` / `password123`

## 📁 Project Structure

```
skillbridge/
├── skillbridge-frontend/          # React frontend
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components
│   │   ├── context/               # React contexts (Auth, Theme)
│   │   └── ...
│   └── ...
├── skillbridge-backend/           # Express backend
│   ├── src/
│   │   ├── routes/                # API routes
│   │   ├── database/              # Database initialization
│   │   └── server.js              # Main server file
│   └── ...
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #2563EB)
- **Secondary**: Green gradient (#22C55E to #16A34A)
- **Neutral**: Gray shades for text and backgrounds
- **Accent**: Various colors for status indicators

### Typography
- **Headings**: Inter font family
- **Body**: Inter font family
- **UI Elements**: Medium to semibold weights

### Components
- **Cards**: Rounded corners (2xl), soft shadows, hover effects
- **Buttons**: Multiple variants with smooth transitions
- **Forms**: Clean inputs with focus states
- **Navigation**: Responsive navbar with mobile menu

## 🌙 Dark Mode

Full dark mode support with system preference detection and manual toggle.

## 📱 Responsive Design

Mobile-first approach with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `GET /api/auth/verify` - Token verification

### Jobs
- `GET /api/jobs/list` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/create` - Create new job (employers only)
- `POST /api/jobs/:id/apply` - Apply to job (students only)
- `GET /api/jobs/my/applications` - Get user applications

### Profile
- `GET /api/profile/me` - Get user profile
- `PUT /api/profile/update` - Update profile
- `GET /api/profile/recommendations` - Get job recommendations

### Analytics
- `GET /api/analytics/overview` - Platform analytics (admin only)
- `GET /api/analytics/employer` - Employer analytics

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy the backend code
3. Update frontend API URL

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Video interviews integration
- [ ] Resume parser and builder
- [ ] Company reviews and ratings
- [ ] Skill assessment tests
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with ML insights
- [ ] Integration with LinkedIn/GitHub
- [ ] Automated screening questions
- [ ] Salary negotiation tools

---

Made with ❤️ for students everywhere by the SkillBridge team.