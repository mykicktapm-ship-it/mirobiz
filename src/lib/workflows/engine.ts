import { notificationProvider, repositories } from '../adapters/local';
import type { BusinessEvent, User, Workflow } from '../domain/types';
import { services } from '../services/domain';

export function runWorkflow(workflow: Workflow, event: BusinessEvent): string[] { return workflow.enabled && workflow.triggerEventType===event.type ? workflow.steps.map(s=>s.label) : []; }
export function executeWorkflows(workspaceId: string, actor: User, event: BusinessEvent): string[] {
  const messages: string[] = [];
  for (const workflow of repositories.workflows.list(workspaceId)) {
    if (!runWorkflow(workflow, event).length) continue;
    for (const step of workflow.steps) {
      if(step.type==='create_deal' && event.entityType==='lead') { services.deals.createDealFromLead(workspaceId, actor, event.entityId); messages.push(`${workflow.name}: deal created`); }
      if(step.type==='assign_manager') { if(event.entityType==='lead') repositories.leads.update(event.entityId,{assignedUserId:'u2'}); if(event.entityType==='deal') repositories.deals.update(event.entityId,{assignedUserId:'u2'}); messages.push(`${workflow.name}: manager assigned`); }
      if(step.type==='create_task') { services.tasks.createTask(workspaceId, actor, {title: step.label.includes('schedule')?'Schedule installation':'First call', assigneeId: step.label.includes('schedule')?'u3':'u2', relatedEntityType:event.entityType, relatedEntityId:event.entityId}); messages.push(`${workflow.name}: task created`); }
      if(step.type==='send_notification') { notificationProvider.send({workspaceId,userId:event.type==='deal_won'?'u3':'u2',title:workflow.name,body:`${step.label} after ${event.title}`}); messages.push(`${workflow.name}: notification sent`); }
      if(step.type==='create_invoice' && event.entityType==='deal') { const deal=repositories.deals.get(event.entityId); if(deal && !deal.invoiceId){ const invoice= repositories.invoices.create({id:`inv_${event.entityId}`,workspaceId,clientId:deal.clientId,dealId:deal.id,status:'sent',total:deal.value,dueAt:'2026-06-30'}); repositories.deals.update(deal.id,{invoiceId:invoice.id}); messages.push(`${workflow.name}: invoice created`); } }
      if(step.type==='create_installation' && event.entityType==='deal') { services.hvac.createInstallationFromDeal(workspaceId, actor, event.entityId); messages.push(`${workflow.name}: installation created`); }
    }
  }
  return messages;
}
