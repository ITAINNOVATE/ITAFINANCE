-- Script de nettoyage des données de test
-- ATTENTION : cela supprimera TOUT sauf le compte admin principal

-- Suppression des paiements et dépenses associés aux projets
DELETE FROM public.payments;
DELETE FROM public.expenses;

-- Suppression des projets
DELETE FROM public.projects;

-- Suppression des clients
DELETE FROM public.clients;

-- Nettoyage des profils (sauf l'admin principal)
DELETE FROM public.profiles WHERE email != 'groupita25@gmail.com';

-- Réinitialisation des séquences d'ID si nécessaire (selon votre config)
-- ALTER SEQUENCE clients_id_seq RESTART WITH 1;
