'use client';

import React from 'react';
import EcheancierList from '../../components/EcheancierList';

export default function EcheanciersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Planification des Échéances</h1>
          <p className="text-text-muted text-sm mt-1">Anticipez vos revenus et gérez les relances de paiement.</p>
        </div>
      </div>
      
      <EcheancierList />
    </div>
  );
}
