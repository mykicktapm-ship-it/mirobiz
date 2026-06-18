import { authProvider, notificationProvider, realtimeProvider } from '../adapters/local';
import type { Permission, User } from '../domain/types';
import { can } from '../permissions/rbac';
import { auditService } from '../services/eventAudit';
import { services } from '../services/domain';
import { executeRules } from '../rules/engine';
import { executeWorkflows } from '../workflows/engine';

export type BusinessActionType = 'lead.create'|'lead.qualify'|'lead.createDeal'|'deal.markWon'|'deal.markLost'|'task.complete'|'invoice.markPaid'|'visit.complete'|'installation.complete';
export interface BusinessAction { workspaceId: string; actorUserId?: string; type: BusinessActionType; payload: Record<string, unknown>; }
export interface BusinessActionResult { ok: boolean; message: string; data?: unknown; sideEffects?: string[]; }
const permissions: Record<BusinessActionType, Permission> = { 'lead.create':'manage_sales','lead.qualify':'manage_sales','lead.createDeal':'manage_sales','deal.markWon':'manage_sales','deal.markLost':'manage_sales','task.complete':'view_dashboard','invoice.markPaid':'manage_finance','visit.complete':'manage_schedule','installation.complete':'perform_installation' };
function actor(id?: string): User { return authProvider.listUsers().find(u=>u.id===id) ?? authProvider.getCurrentUser(); }
export function executeBusinessAction(action: BusinessAction): BusinessActionResult {
  const user = actor(action.actorUserId);
  const permission = permissions[action.type];
  if (!can(user, permission)) {
    auditService.record({workspaceId:action.workspaceId,actorUserId:user.id,action:`denied.${action.type}`,entityType:String(action.payload.entityType ?? 'action'),entityId:String(action.payload.id ?? 'none'),before:undefined,after:{reason:`Missing ${permission}`}});
    notificationProvider.send({workspaceId:action.workspaceId,userId:user.id,title:'Action denied',body:`${user.role} cannot execute ${action.type}`});
    return {ok:false,message:`Permission denied: ${user.role} lacks ${permission}`};
  }
  try {
    let result: {entity: unknown; event: Parameters<typeof realtimeProvider.publish>[0]};
    const id = String(action.payload.id ?? '');
    if(action.type==='lead.create') result = services.leads.createLead(action.workspaceId,user,action.payload);
    else if(action.type==='lead.qualify') result = services.leads.qualifyLead(action.workspaceId,user,id);
    else if(action.type==='lead.createDeal') result = services.deals.createDealFromLead(action.workspaceId,user,id);
    else if(action.type==='deal.markWon') result = services.deals.markDealWon(action.workspaceId,user,id);
    else if(action.type==='deal.markLost') result = services.deals.markDealLost(action.workspaceId,user,id);
    else if(action.type==='task.complete') result = services.tasks.completeTask(action.workspaceId,user,id);
    else if(action.type==='invoice.markPaid') result = services.invoices.markInvoicePaid(action.workspaceId,user,id);
    else if(action.type==='visit.complete') result = services.schedule.completeVisit(action.workspaceId,user,id);
    else result = services.hvac.completeInstallation(action.workspaceId,user,id);
    realtimeProvider.publish(result.event);
    const sideEffects = [...executeRules(action.workspaceId,user,result.event), ...executeWorkflows(action.workspaceId,user,result.event)];
    return {ok:true,message:`${action.type} completed`,data:result.entity,sideEffects};
  } catch (error) { return {ok:false,message:error instanceof Error ? error.message : 'Action failed'}; }
}
