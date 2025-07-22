#!/usr/bin/env bash

# Enhanced AI Health Recommendations Setup Script

echo "🚀 Setting up Enhanced AI Health Recommendations System..."

# Navigate to server directory
cd server

echo "📦 Installing server dependencies..."
npm install

# Navigate to client directory
cd ../client

echo "📦 Installing client dependencies..."
npm install

echo "✅ Setup complete!"

echo "
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

1. Start the server:
   cd server
   npm start

2. Start the client (in a new terminal):
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
"
