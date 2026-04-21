import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';
import { EventType } from './events.constants';

export class CreateEventDto {
  @ApiProperty({
    enum: EventType,
    example: EventType.TASK_CREATED,
    description: 'The type of business event to publish',
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    example: {
      taskId: 'task-001',
      title: 'Review PR #42',
      assignee: 'john@example.com',
      dueDate: '2024-12-31',
    },
    description: 'Arbitrary JSON payload specific to the event type',
  })
  @IsObject()
  payload: Record<string, any>;
}
