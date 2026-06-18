export type ID = string;
export type Role = 'Owner'|'Admin'|'Manager'|'Dispatcher'|'Installer'|'Accountant'|'Service'|'Viewer';
export type Permission = 'view_dashboard'|'manage_workspace'|'view_finance'|'manage_finance'|'manage_sales'|'manage_schedule'|'perform_installation'|'manage_service'|'view_settings';
export interface Workspace { id: ID; name: string; industryPack: 'hvac'; timezone: string; currency: string; }
export interface User { id: ID; workspaceId: ID; name: string; email: string; role: Role; }
export interface Contact { name: string; phone: string; email?: string; }
export interface ServiceObject { id: ID; clientId: ID; address: string; district: string; type: 'apartment'|'house'|'office'|'commercial'; }
export interface Client { id: ID; workspaceId: ID; name: string; type: 'person'|'company'; contacts: Contact[]; objects: ServiceObject[]; tags: string[]; }
export interface Lead { id: ID; workspaceId: ID; clientId?: ID; name: string; source: 'website'|'phone'|'referral'; status: 'new'|'contacted'|'qualified'|'lost'; priority: 'low'|'medium'|'high'; assignedUserId: ID; district: string; createdAt: string; }
export interface Deal { id: ID; workspaceId: ID; clientId: ID; title: string; stage: 'new'|'contacted'|'offer_sent'|'won'|'lost'; value: number; assignedUserId: ID; offerId?: ID; invoiceId?: ID; }
export interface Task { id: ID; workspaceId: ID; title: string; status: 'open'|'in_progress'|'done'; priority: 'low'|'medium'|'high'; assigneeId: ID; dueAt: string; relatedEntityType?: string; relatedEntityId?: ID; }
export interface Visit { id: ID; workspaceId: ID; title: string; type: 'installation'|'service'|'survey'; status: 'planned'|'in_progress'|'completed'|'conflict'; startsAt: string; endsAt: string; assignedTeamId?: ID; assignedUserId?: ID; objectId?: ID; relatedEntityType?: string; relatedEntityId?: ID; district: string; priority: 'low'|'medium'|'high'; skills: string[]; }
export type OfferItemType = 'product'|'service'|'material'|'warranty'|'subscription'|'custom';
export interface OfferItem { id: ID; type: OfferItemType; name: string; quantity: number; unitPrice: number; }
export interface Offer { id: ID; workspaceId: ID; dealId: ID; name: string; status: 'draft'|'sent'|'accepted'; items: OfferItem[]; }
export interface Invoice { id: ID; workspaceId: ID; clientId: ID; dealId?: ID; status: 'draft'|'sent'|'paid'|'overdue'; total: number; dueAt: string; }
export interface Payment { id: ID; invoiceId: ID; amount: number; status: 'mock_authorized'|'paid'|'failed'; providerRef: string; }
export interface BusinessEvent { id: ID; workspaceId: ID; type: string; title: string; entityType: string; entityId: ID; actorUserId: ID; createdAt: string; payload?: Record<string, string|number|boolean>; }
export interface AuditLog { id: ID; workspaceId: ID; actorUserId: ID; action: string; entityType: string; entityId: ID; before?: unknown; after?: unknown; createdAt: string; }
export interface Notification { id: ID; workspaceId: ID; userId: ID; title: string; body: string; read: boolean; createdAt: string; }
export interface Rule { id: ID; workspaceId: ID; name: string; enabled: boolean; triggerEventType: string; conditions: Record<string, string>; actions: {type: 'create_task'|'assign_user'|'notify'|'create_event'; value: string}[]; priority: number; }
export interface Workflow { id: ID; workspaceId: ID; name: string; enabled: boolean; triggerEventType: string; steps: {type: 'create_deal'|'assign_manager'|'create_task'|'send_notification'; label: string}[]; }
export interface Equipment { id: ID; workspaceId: ID; model: string; serial: string; clientId: ID; locationId: ID; status: 'quoted'|'installed'|'servicing'; }
export interface Installation { id: ID; workspaceId: ID; equipmentId: ID; visitId: ID; status: 'scheduled'|'completed'; completedAt?: string; }
export interface ServiceRequest { id: ID; workspaceId: ID; equipmentId: ID; status: 'new'|'scheduled'|'resolved'; priority: 'low'|'medium'|'high'; issue: string; }
export interface Warranty { id: ID; workspaceId: ID; equipmentId: ID; startsAt: string; endsAt: string; status: 'active'|'expired'; }
export interface TechnicianTeam { id: ID; workspaceId: ID; name: string; userIds: ID[]; skills: string[]; districts: string[]; }
