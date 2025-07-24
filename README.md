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

## 🏗️ Architecture

```
ai-mavericks-thinkathon/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # React Components
│   │   │   ├── Login.jsx       # Authentication component
│   │   │   ├── SignUp.jsx      # User registration
│   │   │   ├── PatientDashboard.jsx    # Patient interface
│   │   │   ├── DoctorDashboard.jsx     # Doctor interface
│   │   │   ├── HealthReportUpload.jsx  # Report upload functionality
│   │   │   ├── HealthInsights.jsx      # AI insights display
│   │   │   └── RoleBasedDashboard.jsx  # Role-based routing
│   │   ├── contexts/           # React Context for state management
│   │   ├── utils/              # API utilities and constants
│   │   └── assets/             # Static assets and images
│   └── package.json
├── server/                     # Node.js Backend API
│   ├── controllers/            # Business logic controllers
│   │   ├── auth.controllers.js         # Authentication logic
│   │   ├── healthReport.controllers.js # Health report management
│   │   ├── aiRecommendations.controllers.js # AI processing
│   │   └── doctorReview.controllers.js # Doctor review system
│   ├── models/                 # MongoDB data models
│   │   ├── user.models.js      # User schema
│   │   ├── healthReport.models.js      # Health report schema
│   │   └── recommendation.model.js     # AI recommendation schema
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Authentication and validation
│   ├── services/               # External service integrations
│   │   └── aiRecommendationService.js  # OpenAI integration
│   └── server.js               # Application entry point
└── README.md
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
git clone https://github.com/your-username/ai-mavericks-thinkathon.git
cd ai-mavericks-thinkathon
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

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Health Report Endpoints
- `POST /api/health-reports/upload` - Upload and analyze health report
- `GET /api/health-reports/patient` - Get patient's health reports
- `GET /api/health-reports/:reportId` - Get specific report details

### AI Recommendations Endpoints
- `GET /api/ai-recommendations/insights/:reportId` - Get AI health insights
- `GET /api/ai-recommendations/personalized` - Get personalized recommendations

### Doctor Review Endpoints
- `GET /api/doctor-review/stats` - Get doctor dashboard statistics
- `GET /api/doctor-review/pending` - Get pending recommendations
- `GET /api/doctor-review/assigned` - Get assigned recommendations
- `POST /api/doctor-review/:id/approve` - Approve recommendation
- `POST /api/doctor-review/:id/reject` - Reject recommendation
- `POST /api/doctor-review/:id/update-ai` - Update AI based on feedback

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

### Deployment Options
- **Heroku** - Easy deployment with MongoDB Atlas
- **Vercel** - Frontend deployment with serverless functions
- **DigitalOcean** - Full-stack deployment on droplets
- **AWS** - Scalable cloud deployment

## 📈 Performance Optimization

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Compressed images and lazy loading
- **API Caching** - Intelligent caching strategies
- **Database Indexing** - Optimized MongoDB queries

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Krishil Gandhi** - Frontend Development, UI/UX Design, Backend Developer & AI Integration

## 📞 Support

For support and questions:
- **Email**: krishil.gandhi@acldigital.com
- **Documentation**: [Project Wiki](wiki-link)

## 🔮 Future Enhancements

- **Mobile App** - React Native mobile application
- **Telemedicine** - Video consultation integration
- **Wearable Integration** - Fitness tracker data integration
- **Advanced Analytics** - Machine learning insights
- **Multi-language Support** - Internationalization
- **Voice Interface** - Voice-controlled interactions
- **Blockchain Integration** - Secure health record storage

---

**Made with ❤️ for better healthcare through AI**
