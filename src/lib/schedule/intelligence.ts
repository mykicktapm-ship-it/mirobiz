import type { TechnicianTeam, Visit } from '../domain/types';
export const minutes = (visit: Visit) => (Date.parse(visit.endsAt)-Date.parse(visit.startsAt))/60000;
export const overlaps = (a: Visit, b: Visit) => a.id!==b.id && a.assignedTeamId===b.assignedTeamId && Date.parse(a.startsAt)<Date.parse(b.endsAt) && Date.parse(b.startsAt)<Date.parse(a.endsAt);
export const conflictsFor = (visit: Visit, visits: Visit[]) => visits.filter(v=>overlaps(visit,v));
export const scoreTeam = (team: TechnicianTeam, visit: Visit) => team.skills.filter(s=>visit.skills.includes(s)).length*2 + (team.districts.includes(visit.district)?3:0) + (visit.priority==='high'?1:0);
