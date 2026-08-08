import React from 'react';

export default function InvoicePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Invoice for Order #{params.id}</h1>
      <p>Invoice details will be displayed here.</p>
    </div>
  );
}
