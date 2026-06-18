import type { BusinessEvent, Rule } from '../domain/types';
export function evaluateRule(rule: Rule, event: BusinessEvent): string[] { if(!rule.enabled || rule.triggerEventType!==event.type) return []; const ok=Object.entries(rule.conditions).every(([k,v])=>String(event.payload?.[k])===v); return ok ? rule.actions.map(a=>`${a.type}:${a.value}`) : []; }
