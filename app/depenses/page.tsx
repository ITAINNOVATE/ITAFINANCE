'use client';

import React from 'react';
import ExpenseTable from '../../components/ExpenseTable';

export default function DepensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestion des Dépenses</h1>
          <p className="text-text-muted text-sm mt-1">Suivez l'ensemble de vos charges et investissements.</p>
        </div>
      </div>
      
      <ExpenseTable />
    </div>
  );
}
