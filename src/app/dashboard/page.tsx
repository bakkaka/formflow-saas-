import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-indigo-600">
              FormFlow AI Dashboard
            </div>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard!
            </h2>
            <p className="text-gray-600 mb-8">
              This is where you'll manage your forms and view analytics.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">Create Form</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Generate a new form with AI
                </p>
                <Link 
                  href="/dashboard/forms/new"
                  className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 inline-block"
                >
                  New Form
                </Link>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                 <h3 className="font-semibold text-lg mb-2">My Forms</h3>
                  <p className="text-gray-600 text-sm mb-4">
                     View and manage your forms
                 </p>
            <Link 
               href="/dashboard/forms"
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 inline-block"
               >
                   View Forms
           </Link>
          </div>

              {/* Card 3 */}
<div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
  <h3 className="font-semibold text-lg mb-2">Analytics</h3>
  <p className="text-gray-600 text-sm mb-4">
    See form performance
  </p>
  <Link 
    href="/dashboard/analytics"
    className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 inline-block"
  >
    View Analytics
  </Link>
</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}