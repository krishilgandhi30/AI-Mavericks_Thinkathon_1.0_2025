# Enhanced AI Health Recommendations Setup Script for Windows

Write-Host "🚀 Setting up Enhanced AI Health Recommendations System..." -ForegroundColor Green

# Navigate to server directory
Set-Location server

Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
npm install

# Navigate to client directory
Set-Location ..\client

Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✅ Setup complete!" -ForegroundColor Green

Write-Host @"

🎉 Enhanced AI Health Recommendations System is ready!

📋 Features Added:
- ✨ Enhanced AI analysis with comprehensive health scoring
- 🧠 Personalized recommendations based on multiple reports
- 📊 Health trend analysis across time
- 🎯 Priority-based action plans
- 💊 Detailed medication recommendations with instructions
- 🏃‍♂️ Lifestyle modifications with scientific backing
- ⚡ Real-time health insights dashboard
- 📈 Success metrics and goal tracking

🚀 To start the application:

1. Start the server (in one terminal):
   cd server
   npm start

2. Start the client (in another terminal):
   cd client
   npm run dev

3. Open your browser and go to: http://localhost:5173

🔧 Key Enhancements:
- AI analysis considers patient age, gender, and medical history
- Comprehensive health scoring (0-100)
- Emergency warnings for critical values
- Trend analysis across multiple reports
- Personalized long-term health plans
- Interactive insights dashboard

📊 AI Analysis Features:
- Blood test analysis with risk stratification
- Kidney and liver function assessment
- Cardiovascular risk evaluation
- Age and gender-specific recommendations
- Preventive care scheduling
- Medication interactions awareness

🎯 Ready to provide intelligent health insights!

"@ -ForegroundColor Cyan
