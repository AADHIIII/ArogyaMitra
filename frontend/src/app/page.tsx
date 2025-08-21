export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 text-blue-600 mr-2">❤️</div>
              <h1 className="text-2xl font-bold text-gray-900">ArogyaMitra</h1>
            </div>
            <div className="flex space-x-4">
              <a 
                href="/auth/login" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Login
              </a>
              <a 
                href="/auth/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Your Doctor in Your{' '}
            <span className="text-blue-600">Pocket</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Seamless healthcare access connecting patients with their preferred doctors. 
            Book appointments, manage medications, and stay connected with your healthcare providers.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a 
              href="/auth/register?role=patient" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200"
            >
              I'm a Patient
            </a>
            <a 
              href="/auth/register?role=doctor" 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200"
            >
              I'm a Doctor
            </a>
          </div>
        </div>

        {/* Simple Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Booking</h3>
              <p className="text-gray-600">Find and book appointments with your preferred doctors instantly</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Messaging</h3>
              <p className="text-gray-600">Communicate securely with your healthcare providers</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Reminders</h3>
              <p className="text-gray-600">Never miss appointments or medication schedules</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Care Continuity</h3>
              <p className="text-gray-600">Complete care journey from booking to recovery</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ArogyaMitra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}