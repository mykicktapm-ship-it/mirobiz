import { repositories } from '../adapters/local';
import type { AuditLog, BusinessEvent, ID } from '../domain/types';
import { createId, nowIso } from '../utils';

export class EventService {
  createEvent(input: Omit<BusinessEvent,'id'|'createdAt'> & {id?: ID; createdAt?: string}): BusinessEvent {
    return repositories.events.create({ ...input, id: input.id ?? createId('event'), createdAt: input.createdAt ?? nowIso() });
  }
  listRecent(workspaceId: string): BusinessEvent[] { return repositories.events.list(workspaceId).slice(0, 10); }
  listForEntity(workspaceId: string, entityType: string, entityId: ID): BusinessEvent[] { return repositories.events.list(workspaceId).filter(e=>e.entityType===entityType && e.entityId===entityId); }
}
export class AuditService {
  record(input: Omit<AuditLog,'id'|'createdAt'>): AuditLog { return repositories.audit.create({ ...input, id:createId('audit'), createdAt:nowIso() }); }
  listRecent(workspaceId: string): AuditLog[] { return repositories.audit.list(workspaceId).slice(0, 10); }
}
export const eventService = new EventService();
export const auditService = new AuditService();
