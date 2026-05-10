/**
 * Placeholder component for the main Projects Dashboard.
 * This is shown when the user has completed onboarding and has registered devices.
 */
export function ProjectsDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Monitor your active projects and sensor deployments.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="p-6 bg-white border rounded-xl shadow-sm space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Sensors</p>
                    <p className="text-3xl font-bold text-gray-900">--</p>
                </div>
                <div className="p-6 bg-white border rounded-xl shadow-sm space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ongoing Projects</p>
                    <p className="text-3xl font-bold text-gray-900">--</p>
                </div>
                <div className="p-6 bg-white border rounded-xl shadow-sm space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Status</p>
                    <div className="flex items-center space-x-2">
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        <span className="text-lg font-semibold text-gray-900">Healthy</span>
                    </div>
                </div>
            </div>

            {/* Empty State placeholder for actual projects list */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl h-64 flex flex-col items-center justify-center space-y-4 bg-gray-50/50">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <p className="text-gray-600 font-medium">Your data and projects will appear here shortly.</p>
            </div>
        </div>
    );
}
