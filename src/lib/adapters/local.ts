import { localRole } from '../config';
import type { AuditLog, BusinessEvent, Invoice, Lead, Notification, Payment, Role, User } from '../domain/types';
import * as seed from '../mock/seed';
import { createId, nowIso } from '../utils';

export interface AuthProvider { getCurrentUser(): User; getWorkspace(): typeof seed.workspace; listUsers(): User[]; }
export interface Repository<T> { list(workspaceId: string): T[]; get(id: string): T|undefined; create(input: T): T; update(id: string, patch: Partial<T>): T|undefined; delete(id: string): boolean; }
export type MutableRepository<T> = Repository<T>;
export interface NotificationProvider { send(input: Omit<Notification,'id'|'createdAt'|'read'>): Notification; list(workspaceId: string): Notification[]; }
export interface PaymentProvider { pay(invoice: Invoice): Payment; }
export interface RealtimeProvider { publish(event: BusinessEvent): void; subscribe(handler: (event: BusinessEvent)=>void): () => void; }

class ArrayRepository<T extends {id:string; workspaceId?: string}> implements Repository<T> {
  constructor(private rows:T[]){}
  list(workspaceId:string){return this.rows.filter(r=>!r.workspaceId||r.workspaceId===workspaceId)}
  get(id:string){return this.rows.find(r=>r.id===id)}
  create(input:T){this.rows.unshift(input); return input;}
  update(id:string, patch:Partial<T>){const row=this.get(id); if(!row) return undefined; Object.assign(row, patch); return row;}
  delete(id:string){const index=this.rows.findIndex(r=>r.id===id); if(index<0) return false; this.rows.splice(index,1); return true;}
}
export class LocalAuthProvider implements AuthProvider { getCurrentUser(){ return seed.users.find(u=>u.role === (localRole as Role)) ?? seed.users[0]; } getWorkspace(){ return seed.workspace; } listUsers(){ return seed.users; } }
export class LocalNotificationProvider implements NotificationProvider { private rows=[...seed.notifications]; send(input: Omit<Notification,'id'|'createdAt'|'read'>){ const n={...input,id:createId('notification'),read:false,createdAt:nowIso()}; this.rows.unshift(n); console.info('[local notification]', n.title); return n;} list(workspaceId:string){return this.rows.filter(n=>n.workspaceId===workspaceId)} }
export class MockPaymentProvider implements PaymentProvider { pay(invoice: Invoice): Payment { return {id:createId('payment'), invoiceId: invoice.id, amount: invoice.total, status:'mock_authorized', providerRef:'local-mock'}; } }
export class LocalEventBus implements RealtimeProvider { private handlers: ((event:BusinessEvent)=>void)[]=[]; publish(e:BusinessEvent){this.handlers.forEach(h=>h(e));} subscribe(h:(event:BusinessEvent)=>void){this.handlers.push(h); return ()=>{this.handlers=this.handlers.filter(x=>x!==h)}} }
export const authProvider = new LocalAuthProvider();
export const notificationProvider = new LocalNotificationProvider();
export const paymentProvider = new MockPaymentProvider();
export const realtimeProvider = new LocalEventBus();
export const repositories = {
 clients: new ArrayRepository(seed.clients), leads: new ArrayRepository<Lead>(seed.leads), deals: new ArrayRepository(seed.deals), tasks: new ArrayRepository(seed.tasks), visits: new ArrayRepository(seed.visits), offers: new ArrayRepository(seed.offers), invoices: new ArrayRepository(seed.invoices), events: new ArrayRepository(seed.events), audit: new ArrayRepository<AuditLog>(seed.auditLogs), equipment: new ArrayRepository(seed.equipment), installations: new ArrayRepository(seed.installations), serviceRequests: new ArrayRepository(seed.serviceRequests), warranties: new ArrayRepository(seed.warranties), teams: new ArrayRepository(seed.teams), rules: new ArrayRepository(seed.rules), workflows: new ArrayRepository(seed.workflows)
};
