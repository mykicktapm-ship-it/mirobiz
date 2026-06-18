import type { BusinessEvent, Workflow } from '../domain/types';
export function runWorkflow(workflow: Workflow, event: BusinessEvent): string[] { return workflow.enabled && workflow.triggerEventType===event.type ? workflow.steps.map(s=>s.label) : []; }
