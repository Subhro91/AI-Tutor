AI Tutor App

A personalized AI-powered learning platform designed to provide tailored tutoring and track user progress across multiple subjects.

Features

- AI-Powered Personalized Learning: Engage with an AI tutor that adapts to your learning style
- Progress Tracking: Visualize your learning journey with comprehensive progress metrics
- Multiple Subjects: Access a variety of subjects with structured learning paths
- User Profiles: Manage your personal information and preferences
- Streaks & Achievements: Stay motivated with learning streaks and achievements
- Notifications: Receive updates on your progress and important milestones

Tech Stack

- Frontend: Next.js 14+
- Authentication: Firebase Authentication
- Database: Firebase Firestore
- AI: Google Gemini API
- Styling: Tailwind CSS

Getting Started

Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase account

Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-tutor.git
cd ai-tutor
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add your Firebase and Google AI API credentials:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
GOOGLE_AI_API_KEY=your_gemini_api_key
NOTIFICATIONS_API_KEY=your_secure_api_key_for_notifications
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open http://localhost:3000 in your browser

Setting Up Firestore Indexes

The application requires these Firestore indexes:

1. Notifications Index:
   - Collection: notifications
   - Fields to index:
     - userId (Ascending)
     - createdAt (Descending)

2. User Progress Index:
   - Collection: userProgress
   - Fields to index:
     - userId (Ascending)
     - lastAccessed (Descending)

3. User Notifications by Read Status:
   - Collection: notifications
   - Fields to index:
     - userId (Ascending)
     - isRead (Ascending)

Security Best Practices

API Keys Protection

1. Client-side Firebase Keys: 
   - Only use Firebase keys prefixed with NEXT_PUBLIC_ on the client side
   - These keys have limited permissions and are safe to include in client-side code

2. Server-side Authentication:
   - Use Firebase Admin for secure server-side operations
   - Set up Firebase Admin credentials as environment variables (never expose these)
   - Use proper token-based authentication for API routes

Firebase Security Rules

Implement proper security rules in Firebase:

1. Navigate to the Firebase Console
2. Go to your project and access Firestore and Storage
3. Copy the rules from src/lib/firebase-rules.txt to the respective Rules sections

License

This project is licensed under the MIT License - see the LICENSE file for details.

Deployment

Deploy to Vercel for best performance with Next.js:
```bash
vercel
```

Once deployed, make sure to:
1. Update Firebase authorized domains
2. Set environment variables in your deployment platform
3. Set up CORS for Firebase Storage with your production domain 