const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eqqdjqdbbwmshllqesdt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxcWRqcWRiYndtc2hsbHFlc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEwMjcsImV4cCI6MjA5MTc3NzAyN30._DzQtFyU5Hz8trB1b86cxxHarmy5t35kZHdg2_2a4_o'
);

const PLATFORM_ID = '99ff8e98-b9b4-452c-a41e-35254e188472';

async function diagnose() {
  console.log('--- DIAGNOSTIC CRÉATION PROJET ---');
  
  // 1. Essai d'insertion projet
  const payload = {
    name: 'PROJET TEST DIAGNOSTIC',
    total_budget: 350000,
    status: 'En cours',
    platform_id: PLATFORM_ID
  };

  console.log('Tentative d\'insertion projet...', payload);
  const { data: newProject, error: projectError } = await supabase.from('projects').insert([payload]).select().single();
  
  if (projectError) {
    console.log('❌ ERREUR PROJET :', projectError.message);
    console.log('Code erreur :', projectError.code);
    return;
  }
  
  console.log('✅ Projet créé avec ID :', newProject.id);

  // 2. Essai d'insertion échéanciers
  const schedulePayload = [
    {
      project_id: newProject.id,
      due_date: '2026-04-14',
      amount: 250000,
      status: 'En attente',
      platform_id: PLATFORM_ID
    }
  ];

  console.log('Tentative d\'insertion échéancier...', schedulePayload);
  const { error: scheduleError } = await supabase.from('schedules').insert(schedulePayload);

  if (scheduleError) {
    console.log('❌ ERREUR ÉCHÉANCIER :', scheduleError.message);
    console.log('Code erreur :', scheduleError.code);
  } else {
    console.log('✅ Échéancier créé avec succès');
  }
  
  // Cleanup
  await supabase.from('projects').delete().eq('id', newProject.id);
  console.log('---------------------------------');
}

diagnose();
