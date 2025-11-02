export default function RealTimeSignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Real-Time Sign Language Recognition
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Continuous recognition of ASL gestures including moving letters (J, Z) and common gestures
        </p>
        <div className="text-center">
          <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Start Recognition
          </button>
        </div>
      </div>
    </div>
  );
}
