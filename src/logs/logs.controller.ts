import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { LogStatus } from '@prisma/client';

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private logsService: LogsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all processing logs (paginated)',
    description:
      'Returns all event processing logs. Filter by eventId or status.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'eventId', required: false, type: String })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: LogStatus,
  })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('eventId') eventId?: string,
    @Query('status') status?: LogStatus,
  ) {
    return this.logsService.findAll(+page, +limit, eventId, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get log statistics by status' })
  getStats() {
    return this.logsService.getStats();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all logs for a specific event' })
  findByEvent(@Param('eventId') eventId: string) {
    return this.logsService.findByEvent(eventId);
  }
}
