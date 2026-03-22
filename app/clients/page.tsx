'use client';

import React from 'react';
import ClientTable from '../../components/ClientTable';

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Base de Données Clients</h1>
        <p className="text-text-muted text-sm mt-1">Gérez vos relations clients et consultez leur historique financier.</p>
      </div>
      <ClientTable />
    </div>
  );
}
