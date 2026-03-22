'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const PaymentTable = dynamic(() => import('../../components/PaymentTable'), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-white/5 h-96 rounded-2xl" />
});


export default function PaiementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Historique des Paiements</h1>
        <p className="text-text-muted text-sm mt-1">Consultez, gérez et éditez les reçus de vos recettes et acomptes.</p>
      </div>
      <PaymentTable />
    </div>
  );
}
