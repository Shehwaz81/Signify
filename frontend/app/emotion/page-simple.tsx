export default function EmotionDetectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Emotion Detection
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          AI-powered emotion recognition from facial expressions
        </p>
        <div className="text-center">
          <button className="bg-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
            Start Emotion Detection
          </button>
        </div>
      </div>
    </div>
  );
}
