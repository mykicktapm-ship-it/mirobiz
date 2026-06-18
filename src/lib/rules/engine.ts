import { notificationProvider, repositories } from '../adapters/local';
import type { BusinessEvent, Rule, User } from '../domain/types';
import { eventService } from '../services/eventAudit';
import { services } from '../services/domain';

export function evaluateRule(rule: Rule, event: BusinessEvent): string[] { if(!rule.enabled || rule.triggerEventType!==event.type) return []; const ok=Object.entries(rule.conditions).every(([k,v])=>String(event.payload?.[k])===v); return ok ? rule.actions.map(a=>`${a.type}:${a.value}`) : []; }
export function executeRules(workspaceId: string, actor: User, event: BusinessEvent): string[] {
  if(event.metadata?.source === 'rule') return [];
  const messages: string[] = [];
  for (const rule of repositories.rules.list(workspaceId).sort((a,b)=>b.priority-a.priority)) {
    if (!evaluateRule(rule, event).length) continue;
    for (const action of rule.actions) {
      if(action.type==='create_task') { services.tasks.createTask(workspaceId, actor, {title: action.value, assigneeId: actor.id, relatedEntityType:event.entityType, relatedEntityId:event.entityId}); messages.push(`Rule ${rule.name}: task created`); }
      if(action.type==='notify') { const userId = action.value==='dispatcher' ? 'u3' : actor.id; notificationProvider.send({workspaceId,userId,title:rule.name,body:`Triggered by ${event.title}`}); messages.push(`Rule ${rule.name}: notification sent`); }
      if(action.type==='create_event') { eventService.createEvent({workspaceId,type:action.value,title:action.value,entityType:event.entityType,entityId:event.entityId,actorUserId:actor.id,metadata:{source:'rule'}}); messages.push(`Rule ${rule.name}: event created`); }
      if(action.type==='assign_user' && (event.entityType==='lead' || event.entityType==='deal')) { const repo = event.entityType==='lead' ? repositories.leads : repositories.deals; repo.update(event.entityId,{assignedUserId: action.value}); messages.push(`Rule ${rule.name}: assigned ${action.value}`); }
    }
  }
  return messages;
}
