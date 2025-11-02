export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Signify - Sign Language Recognition
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          AI-powered sign language recognition with emotion detection
        </p>
        <div className="text-center">
          <a 
            href="/real-time-sign" 
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Try Real-Time Recognition
          </a>
        </div>
      </div>
    </div>
  );
}
