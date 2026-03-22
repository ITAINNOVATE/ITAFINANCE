'use client';

import React from 'react';
import ProjectList from '../../components/ProjectList';

export default function ProjetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Gestion des Projets</h1>
        <p className="text-text-muted text-sm mt-1">Suivez l'avancement technique et financier de vos services IT.</p>
      </div>
      <ProjectList />
    </div>
  );
}
