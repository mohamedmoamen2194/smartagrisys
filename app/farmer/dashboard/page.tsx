const FarmerDashboardPage = () => {
  return (
    <div className="container mx-auto py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to FarmTech Pro Dashboard</h1>
        <p className="text-gray-600">Manage your farm operations with AI-powered insights</p>
      </div>

      {/* Dashboard Content (Example) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800">Crop Health</h2>
          <p className="text-gray-600">View the health status of your crops.</p>
          {/* Add more content here */}
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800">Weather Forecast</h2>
          <p className="text-gray-600">Get the latest weather updates for your farm.</p>
          {/* Add more content here */}
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800">Market Prices</h2>
          <p className="text-gray-600">Check current market prices for your produce.</p>
          {/* Add more content here */}
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboardPage
