# AI Interview System

A comprehensive AI-powered interview system built with Node.js, React, and Django.

## 🏗️ Project Structure

```
ai-interview-system/
├── .git/                          # Git repository
├── djangoaiservice/               # Django AI Service
│   ├── .venv/                    # Python virtual environment
│   ├── interview_ai/             # Django app directory
│   ├── djangoaiservice/          # Django project settings
│   ├── db.sqlite3               # SQLite database
│   └── manage.py                # Django management script
├── frontend/                     # React Frontend (Vite)
│   ├── src/                     # React source code
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   └── postcss.config.js        # PostCSS configuration
├── uploads/                      # File upload directory
├── node_modules/                 # Node.js dependencies
├── server.js                     # Node.js/Express backend server
├── package.json                  # Backend dependencies
├── start.bat                     # Windows startup script
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-system
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Setup Django Environment**
   ```bash
   cd djangoaiservice
   python -m venv .venv
   
   # On Windows
   .venv\Scripts\activate
   
   # On macOS/Linux
   source .venv/bin/activate
   
   pip install django
   python manage.py migrate
   cd ..
   ```

### Running the Application

#### Option 1: Use the Startup Script (Windows)
Simply double-click `start.bat` to start all services automatically.

#### Option 2: Manual Startup

1. **Start Django AI Service**
   ```bash
   cd djangoaiservice
   .venv\Scripts\activate  # Windows
   # source .venv/bin/activate  # macOS/Linux
   python manage.py runserver 8000
   ```

2. **Start Node.js Backend** (in a new terminal)
   ```bash
   npm start
   ```

3. **Start React Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

## 🌐 Service URLs

- **Django AI Service**: http://localhost:8000
- **Node.js Backend**: Check `server.js` for configured port
- **React Frontend**: Vite dev server (usually http://localhost:5173)

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Multer** - File upload handling
- **bcrypt** - Password hashing
- **Express Session** - Session management

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library

### AI Service
- **Django** - Python web framework
- **SQLite** - Database (development)
- **Python Virtual Environment** - Dependency isolation

## 📁 Key Directories

- **`djangoaiservice/`** - Contains the Django AI service with interview logic
- **`frontend/`** - React application with modern UI components
- **`uploads/`** - File storage for uploaded documents
- **`server.js`** - Main Express server handling API requests

## 🔧 Development Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Session
SESSION_SECRET=your_session_secret

# API Keys
OPENAI_API_KEY=your_openai_api_key

# Port Configuration
PORT=3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Check if services are already running
   - Kill processes using the required ports
   - Use different ports in configuration

2. **Virtual Environment Issues**
   - Ensure Python virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

3. **Node Modules Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **Database Connection Issues**
   - Check MongoDB connection string
   - Ensure MongoDB service is running

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure all services are running on correct ports
4. Check the troubleshooting section above

---

**Happy Coding! 🚀**
