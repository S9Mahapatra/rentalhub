import React from 'react';

export const metadata = {
  title: 'Our Stores | RentalHub',
  description: 'Find a RentalHub store near you for pick up and returns.',
};

export default function StoresPage() {
  return (
    <main className="min-h-screen py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-white">Our Stores</h1>
      <p className="text-gray-400 mb-8">
        Find a RentalHub store near you to pick up your rentals for free.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl hover:border-gray-700 transition-colors">
          <h2 className="text-2xl font-semibold mb-2 text-white">Main Hub</h2>
          <p className="text-gray-400 mb-4">123 Rental Ave<br/>Tech District, 10001</p>
          <div className="text-sm text-gray-500">
            <p>Mon-Fri: 9 AM - 8 PM</p>
            <p>Sat-Sun: 10 AM - 6 PM</p>
          </div>
        </div>
        {/* Add more stores as needed */}
      </div>
    </main>
  );
}