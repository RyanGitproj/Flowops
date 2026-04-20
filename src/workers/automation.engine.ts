import { Injectable, Logger } from '@nestjs/common';
import { EventType } from '../events/events.constants';

export interface AutomationResult {
  action: string;
  details: Record<string, any>;
  simulatedAt: string;
}

/**
 * AutomationEngine
 * ─────────────────────────────────────────────────────────────
 * Core business logic layer. Each event type triggers a specific
 * automated workflow. In production, these would integrate with
 * email services, notification systems, Slack, etc.
 */
@Injectable()
export class AutomationEngine {
  private readonly logger = new Logger(AutomationEngine.name);

  async handle(
    type: string,
    payload: Record<string, any>,
    eventId: string,
  ): Promise<AutomationResult> {
    this.logger.log(`🤖 Automation triggered | type=${type} | event=${eventId}`);

    switch (type) {
      case EventType.USER_REGISTERED:
        return this.handleUserRegistered(payload);

      case EventType.PROJECT_CREATED:
        return this.handleProjectCreated(payload);

      case EventType.TASK_CREATED:
        return this.handleTaskCreated(payload);

      case EventType.TASK_OVERDUE:
        return this.handleTaskOverdue(payload);

      case EventType.MEETING_CREATED:
        return this.handleMeetingCreated(payload);

      default:
        return {
          action: 'NO_OP',
          details: { reason: `Unknown event type: ${type}` },
          simulatedAt: new Date().toISOString(),
        };
    }
  }

  // ─── USER_REGISTERED → Send welcome notification ──────────────
  private async handleUserRegistered(
    payload: Record<string, any>,
  ): Promise<AutomationResult> {
    const { email, name } = payload;

    // Simulate: send welcome email
    await this.simulateDelay(120);
    this.logger.log(`📧 Welcome email sent to ${email || 'unknown'}`);

    // Simulate: create onboarding checklist
    await this.simulateDelay(80);
    this.logger.log(`📋 Onboarding checklist created for ${name || 'user'}`);

    return {
      action: 'WELCOME_FLOW_INITIATED',
      details: {
        emailSent: true,
        recipient: email,
        onboardingChecklistCreated: true,
        steps: ['verify_email', 'complete_profile', 'create_first_project'],
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  // ─── PROJECT_CREATED → Initialize project workflow ────────────
  private async handleProjectCreated(
    payload: Record<string, any>,
  ): Promise<AutomationResult> {
    const { projectId, projectName, ownerId } = payload;

    await this.simulateDelay(200);
    this.logger.log(
      `🏗️  Workflow initialized for project "${projectName || projectId}"`,
    );

    // Simulate: create default milestones
    await this.simulateDelay(150);
    const milestones = ['Planning', 'Development', 'Testing', 'Deployment'];

    // Simulate: notify team members
    await this.simulateDelay(100);

    return {
      action: 'PROJECT_WORKFLOW_INITIALIZED',
      details: {
        projectId,
        milestonesCreated: milestones,
        defaultLabelsAdded: ['bug', 'feature', 'improvement'],
        ownerNotified: true,
        ownerId,
        webhookRegistered: true,
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  // ─── TASK_CREATED → Send assignment notification ───────────────
  private async handleTaskCreated(
    payload: Record<string, any>,
  ): Promise<AutomationResult> {
    const { taskId, title, assignee, dueDate, projectId } = payload;

    await this.simulateDelay(90);
    this.logger.log(`🔔 Notification sent to assignee: ${assignee || 'N/A'}`);

    return {
      action: 'TASK_ASSIGNMENT_NOTIFICATION_SENT',
      details: {
        taskId,
        title,
        assignee,
        dueDate,
        projectId,
        notificationChannels: ['in_app', 'email'],
        reminderScheduled: dueDate ? true : false,
        estimatedReminder: dueDate
          ? new Date(
              new Date(dueDate).getTime() - 24 * 60 * 60 * 1000,
            ).toISOString()
          : null,
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  // ─── TASK_OVERDUE → Escalation alert ──────────────────────────
  private async handleTaskOverdue(
    payload: Record<string, any>,
  ): Promise<AutomationResult> {
    const { taskId, title, assignee, managerId, daysOverdue } = payload;

    await this.simulateDelay(100);
    this.logger.warn(
      `⚠️  OVERDUE ALERT: Task "${title || taskId}" is ${daysOverdue ?? '?'} day(s) late`,
    );

    // Simulate: escalate to manager
    await this.simulateDelay(80);
    this.logger.warn(`📢 Escalation sent to manager: ${managerId || 'N/A'}`);

    return {
      action: 'OVERDUE_ESCALATION_TRIGGERED',
      details: {
        taskId,
        title,
        assignee,
        managerId,
        daysOverdue: daysOverdue ?? 1,
        alertsSent: ['assignee_reminder', 'manager_escalation', 'slack_alert'],
        priority: daysOverdue > 3 ? 'CRITICAL' : 'HIGH',
        autoReassignScheduled: daysOverdue > 7,
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  // ─── MEETING_CREATED → Schedule reminders ─────────────────────
  private async handleMeetingCreated(
    payload: Record<string, any>,
  ): Promise<AutomationResult> {
    const { meetingId, title, scheduledAt, attendees, location } = payload;

    await this.simulateDelay(110);
    const attendeeCount = Array.isArray(attendees) ? attendees.length : 0;
    this.logger.log(
      `📅 Meeting reminders scheduled for ${attendeeCount} attendee(s): "${title || meetingId}"`,
    );

    return {
      action: 'MEETING_REMINDERS_SCHEDULED',
      details: {
        meetingId,
        title,
        scheduledAt,
        location: location || 'virtual',
        attendees,
        reminders: [
          { triggerBefore: '24h', channel: 'email', scheduled: true },
          { triggerBefore: '1h', channel: 'push', scheduled: true },
          { triggerBefore: '15min', channel: 'in_app', scheduled: true },
        ],
        calendarInvitesSent: attendeeCount,
        agendaTemplateCreated: true,
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  // ─── Helper ────────────────────────────────────────────────────
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
