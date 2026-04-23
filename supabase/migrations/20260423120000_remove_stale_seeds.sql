-- ============================================================================
-- Migration — Remove stale octopus + cesp seed entries
-- Both seeds reference repos/paths that no longer exist:
--   octopus  → src/components/ui/ (deleted in favor of hub/)
--   cesp     → hulusi-tunc/CESP-v2 (repo 404 on GitHub)
-- The catalog now relies on real ingested entries (hubera, jetsnack).
-- design_system_stats rows auto-cascade via FK on delete.
-- ============================================================================

delete from public.design_systems where slug in ('octopus', 'cesp');
