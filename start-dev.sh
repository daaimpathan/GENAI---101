#!/bin/bash

echo "🚀 Starting SkillBridge Development Servers..."

# Function to check if port is in use
check_port() {
    if lsof -i:$1 >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check ports
check_port 3000 || echo "Frontend may already be running on port 3000"
check_port 5000 || echo "Backend may already be running on port 5000"

echo ""
echo "📁 Project structure:"
echo "├── skillbridge-frontend/  (React + TypeScript + TailwindCSS)"
echo "├── skillbridge-backend/   (Node.js + Express + SQLite)"
echo "└── README.md"
echo ""

# Start backend in background
echo "🔧 Starting backend server..."
cd skillbridge-backend
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting frontend server..."
cd ../skillbridge-frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "📊 API Health: http://localhost:5000/api/health"
echo ""
echo "📝 Demo Accounts:"
echo "   Student:  student@example.com / password123"
echo "   Employer: employer@techcorp.com / password123"
echo "   Admin:    admin@skillbridge.com / password123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
wait