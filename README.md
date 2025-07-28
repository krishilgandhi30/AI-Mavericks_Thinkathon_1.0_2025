# 🏥 AI-Powered Healthcare Management System

An intelligent healthcare platform that leverages AI to analyze medical reports, generate personalized recommendations, and facilitate doctor-patient collaboration for better health outcomes.

## 🌟 Features

### For Patients
- **📋 Health Report Upload**: Upload blood test and urine test reports
- **🤖 AI-Powered Analysis**: Get instant AI-generated health insights and recommendations
- **📊 Health Dashboard**: Track your health metrics and view historical data
- **💊 Personalized Treatment Plans**: Receive customized medication and lifestyle recommendations
- **📈 Health Insights**: Comprehensive analysis of your health reports with risk assessments
- **👤 User Profile Management**: Manage personal health information and medical history

### For Doctors
- **🏥 Doctor Dashboard**: Review pending patient recommendations and manage caseload
- **✅ Recommendation Review**: Approve, modify, or reject AI-generated recommendations
- **📝 Clinical Notes**: Add professional medical notes and feedback
- **🔄 AI Collaboration**: Provide feedback to improve AI recommendations
- **📊 Statistics & Analytics**: Track review metrics and patient outcomes
- **⚡ Priority Management**: Handle urgent cases and manage workflow efficiently

### AI Capabilities
- **🧠 Intelligent Analysis**: Advanced AI processing of medical reports using OpenAI
- **🎯 Risk Assessment**: Automated identification of health risks and urgency levels
- **💡 Treatment Suggestions**: Evidence-based medication and lifestyle recommendations
- **📈 Health Scoring**: Comprehensive health score calculation
- **🔄 Continuous Learning**: AI improvements based on doctor feedback

## 🏗️ Project Architecture

```
AI-Mavericks_Thinkathon_1.0_2025/
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # React Components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx        # User authentication
│   │   │   │   └── SignUp.jsx       # User registration
│   │   │   ├── dashboard/
│   │   │   │   ├── PatientDashboard.jsx     # Patient interface
│   │   │   │   ├── DoctorDashboard.jsx      # Doctor interface
│   │   │   │   └── RoleBasedDashboard.jsx   # Role routing
│   │   │   ├── health/
│   │   │   │   ├── HealthReportUpload.jsx   # Report upload
│   │   │   │   ├── HealthInsights.jsx       # AI insights display
│   │   │   │   └── ReportAnalysis.jsx       # Report analysis
│   │   │   ├── doctor/
│   │   │   │   ├── ReviewQueue.jsx          # Pending reviews
│   │   │   │   ├── RecommendationReview.jsx # Review interface
│   │   │   │   └── DoctorStats.jsx          # Analytics
│   │   │   └── common/
│   │   │       ├── Header.jsx               # Navigation
│   │   │       ├── Footer.jsx               # Footer component
│   │   │       └── LoadingSpinner.jsx       # Loading states
│   │   ├── contexts/                # React Context
│   │   │   ├── AuthContext.jsx              # Authentication state
│   │   │   └── HealthContext.jsx            # Health data state
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js                   # Authentication hook
│   │   │   └── useHealthData.js             # Health data hook
│   │   ├── services/                # API services
│   │   │   ├── api.js                       # API configuration
│   │   │   ├── authService.js               # Auth API calls
│   │   │   ├── healthService.js             # Health API calls
│   │   │   └── doctorService.js             # Doctor API calls
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.js                 # App constants
│   │   │   ├── helpers.js                   # Helper functions
│   │   │   └── validators.js                # Form validation
│   │   ├── styles/                  # CSS styles
│   │   │   ├── globals.css                  # Global styles
│   │   │   └── components.css               # Component styles
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # App entry point
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── server/                          # Node.js Backend API
│   ├── controllers/                 # Business logic
│   │   ├── authController.js                # Authentication logic
│   │   ├── healthReportController.js        # Health report management
│   │   ├── aiRecommendationController.js    # AI processing
│   │   ├── doctorReviewController.js        # Doctor review system
│   │   └── userController.js                # User management
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js                          # User model
│   │   ├── HealthReport.js                  # Health report model
│   │   ├── Recommendation.js                # AI recommendation model
│   │   └── DoctorReview.js                  # Doctor review model
│   ├── routes/                      # API routes
│   │   ├── authRoutes.js                    # Authentication routes
│   │   ├── healthRoutes.js                  # Health report routes
│   │   ├── aiRoutes.js                      # AI recommendation routes
│   │   ├── doctorRoutes.js                  # Doctor review routes
│   │   └── userRoutes.js                    # User management routes
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                          # JWT authentication
│   │   ├── validation.js                    # Input validation
│   │   ├── errorHandler.js                  # Error handling
│   │   └── roleCheck.js                     # Role-based access
│   ├── services/                    # External services
│   │   ├── aiService.js                     # OpenAI integration
│   │   ├── emailService.js                  # Email notifications
│   │   └── fileService.js                   # File processing
│   ├── config/                      # Configuration
│   │   ├── database.js                      # MongoDB connection
│   │   ├── openai.js                        # OpenAI configuration
│   │   └── email.js                         # Email configuration
│   ├── utils/                       # Utility functions
│   │   ├── helpers.js                       # Helper functions
│   │   ├── constants.js                     # Server constants
│   │   └── logger.js                        # Logging utility
│   ├── uploads/                     # File uploads directory
│   ├── .env                         # Environment variables
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Application entry 
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package.json
└── README.md                        # Project documentation
```

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **React Icons** - Icon library
- **Vite** - Fast build tool and development server
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling
- **OpenAI API** - AI-powered health analysis
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting and formatting
- **Nodemon** - Development server auto-restart
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **OpenAI API Key** (for AI functionality)
- **Git** (for version control)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/krishilgandhi/AI-Mavericks_Thinkathon_1.0_2025.git

# Navigate to project directory
cd AI-Mavericks_Thinkathon_1.0_2025

# Verify project structure
ls -la
```

### 2. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create environment variables file:
```bash
# Create .env file in server directory
touch .env
```

Add the following environment variables to `.env`:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/healthcare-ai

# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare-ai

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini Configuration
GEMINI_API_KEY = your-gemini-api-key-here

#Email Configuration
EMAIL_USER=your-email
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup

Navigate to the client directory:
```bash
cd ../client
```

Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Running the Application

### Start the Backend Server
```bash
cd server
npm start
```
The server will run on `http://localhost:5000`

### Start the Frontend Application
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

## 📝 API Documentation

**Base URL**: `http://localhost:5000/api`

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "gender": "male",
  "dateOfBirth": "1990-01-01",
  "bloodGroup": "O+"
}
```
**Response**: `{ "token": "jwt_token", "user": {...} }`

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response**: `{ "token": "jwt_token", "user": {...} }`

#### Reset Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{ "email": "john@example.com" }
```

### 🏥 Health Report Endpoints

#### Upload Health Report
```http
POST /api/health-reports/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "reportType": "blood",
  "file": "report.pdf",
  "bloodMetrics": {
    "cholesterol": 240,
    "bloodSugar": 110,
    "hemoglobin": 14.5
  },
  "patientNotes": "Feeling tired lately"
}
```
**Response**: `{ "reportId": "...", "analysisStatus": "processing" }`

#### Get Patient Reports
```http
GET /api/health-reports/patient
Authorization: Bearer {token}
```
**Response**: `{ "reports": [...], "totalCount": 5 }`

#### Get Specific Report
```http
GET /api/health-reports/{reportId}
Authorization: Bearer {token}
```
**Response**: `{ "report": {...}, "recommendations": {...} }`

### 🤖 AI Recommendations Endpoints

#### Get AI Health Insights
```http
GET /api/ai-recommendations/insights/{reportId}
Authorization: Bearer {token}
```
**Response**:
```json
{
  "insights": {
    "riskLevel": "moderate",
    "healthScore": 72,
    "keyFindings": ["High cholesterol", "Normal blood sugar"],
    "recommendations": {
      "medications": ["Atorvastatin 20mg daily"],
      "lifestyle": ["Mediterranean diet", "30min daily exercise"],
      "followUp": "3 months"
    }
  },
  "confidenceScore": 0.87
}
```

#### Get Personalized Recommendations
```http
GET /api/ai-recommendations/personalized
Authorization: Bearer {token}
```
**Response**: `{ "recommendations": [...], "lastUpdated": "..." }`

### 👨‍⚕️ Doctor Review Endpoints

#### Get Doctor Dashboard Stats
```http
GET /api/doctor-review/stats
Authorization: Bearer {doctor_token}
```
**Response**:
```json
{
  "pendingReviews": 12,
  "completedToday": 8,
  "approvalRate": 0.85,
  "avgReviewTime": "5.2 minutes"
}
```

#### Get Pending Recommendations
```http
GET /api/doctor-review/pending?page=1&limit=10
Authorization: Bearer {doctor_token}
```
**Response**: `{ "recommendations": [...], "pagination": {...} }`

#### Approve Recommendation
```http
POST /api/doctor-review/{recommendationId}/approve
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "doctorNotes": "Approved with minor modifications",
  "modifications": {
    "medications": ["Reduced dosage to 10mg"]
  },
  "aiAccuracyRating": 8
}
```
**Response**: `{ "status": "approved", "notificationSent": true }`

#### Reject Recommendation
```http
POST /api/doctor-review/{recommendationId}/reject
Authorization: Bearer {doctor_token}
Content-Type: application/json

{
  "reason": "Insufficient data for diagnosis",
  "doctorNotes": "Requires additional blood work",
  "aiAccuracyRating": 4
}
```

### 📊 Error Responses

**400 Bad Request**
```json
{ "error": "Validation failed", "details": [...] }
```

**401 Unauthorized**
```json
{ "error": "Invalid token" }
```

**403 Forbidden**
```json
{ "error": "Insufficient permissions" }
```

**500 Internal Server Error**
```json
{ "error": "Server error", "message": "..." }
```

### 🔑 Authentication Headers
All protected endpoints require:
```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## 👥 User Roles & Permissions

### Patient Role
- Upload health reports
- View AI-generated recommendations
- Access personal health dashboard
- View approved treatment plans
- Manage profile information

### Doctor Role
- Review AI-generated recommendations
- Approve or reject recommendations with notes
- Provide feedback to AI system
- View patient health reports
- Manage assigned cases

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt encryption for passwords
- **Role-Based Access Control** - Different permissions for patients and doctors
- **Data Validation** - Input validation and sanitization
- **CORS Protection** - Cross-origin request security

## 🤖 AI Integration

The application integrates with OpenAI's GPT models to provide:

- **Intelligent Report Analysis** - Automated analysis of blood and urine test results
- **Risk Assessment** - Identification of potential health risks
- **Treatment Recommendations** - Evidence-based treatment suggestions
- **Lifestyle Advice** - Personalized lifestyle and dietary recommendations
- **Follow-up Planning** - Automated scheduling suggestions

## 📊 Database Schema

### User Model
```javascript
{
  fullName: String,
  username: String,
  email: String,
  password: String,
  role: ['patient', 'doctor'],
  gender: String,
  dateOfBirth: Date,
  medicalHistory: [String],
  bloodGroup: String
}
```

### Health Report Model
```javascript
{
  patientId: ObjectId,
  reportType: ['blood', 'urine'],
  bloodMetrics: Object,
  urineMetrics: Object,
  patientNotes: String,
  isAnalyzed: Boolean,
  analysisDate: Date
}
```

### Recommendation Model
```javascript
{
  reportId: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  aiSuggestions: Object,
  doctorModifications: Object,
  finalRecommendations: Object,
  reviewStatus: ['pending', 'under_review', 'approved', 'rejected'],
  confidenceScore: Number,
  doctorNotes: String
}
```

## 🚀 Development Workflow

### Adding New Features
1. Create feature branch from `main`
2. Implement backend API endpoints
3. Add corresponding frontend components
4. Test functionality thoroughly
5. Submit pull request for review

### Code Standards
- Use ESLint for code formatting
- Follow React best practices
- Implement proper error handling
- Add comprehensive comments
- Maintain consistent naming conventions

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** - Full-featured experience
- **Tablet** - Optimized layout for touch interaction
- **Mobile** - Mobile-first design with touch-friendly interfaces

## 🛠️ Build & Deployment

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## 📈 Performance Optimization

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Compressed images and lazy loading
- **API Caching** - Intelligent caching strategies
- **Database Indexing** - Optimized MongoDB queries

## 👥 Team - AI Mavericks

- **Krishil Gandhi** - Frontend Development, UI/UX Design, Backend Developer & AI Integration

## 📞 Support

For support and questions:
- **Email**: krishil.gandhi@acldigital.com

---

**Made with ❤️ for better healthcare through AI**
