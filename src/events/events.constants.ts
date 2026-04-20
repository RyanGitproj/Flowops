export const FLOWOPS_QUEUE = 'flowops:events';

export enum EventType {
  USER_REGISTERED = 'USER_REGISTERED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_OVERDUE = 'TASK_OVERDUE',
  MEETING_CREATED = 'MEETING_CREATED',
}

export const EVENT_DESCRIPTIONS: Record<EventType, string> = {
  [EventType.USER_REGISTERED]: 'Triggered when a new user registers',
  [EventType.PROJECT_CREATED]: 'Triggered when a new project is created',
  [EventType.TASK_CREATED]: 'Triggered when a task is assigned',
  [EventType.TASK_OVERDUE]: 'Triggered when a task passes its due date',
  [EventType.MEETING_CREATED]: 'Triggered when a meeting is scheduled',
};
