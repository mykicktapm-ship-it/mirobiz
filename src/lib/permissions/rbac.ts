import type { Permission, Role, User } from '../domain/types';
export const rolePermissions: Record<Role, Permission[]> = {
  Owner: ['view_dashboard','manage_workspace','view_finance','manage_finance','manage_sales','manage_schedule','perform_installation','manage_service','view_settings'],
  Admin: ['view_dashboard','manage_workspace','view_finance','manage_sales','manage_schedule','perform_installation','manage_service','view_settings'],
  Manager: ['view_dashboard','manage_sales','manage_schedule','manage_service'],
  Dispatcher: ['view_dashboard','manage_schedule','manage_service'],
  Installer: ['view_dashboard','perform_installation','manage_service'],
  Accountant: ['view_dashboard','view_finance','manage_finance'],
  Service: ['view_dashboard','manage_service','manage_schedule'],
  Viewer: ['view_dashboard']
};
export const can = (user: User, permission: Permission) => rolePermissions[user.role].includes(permission);
