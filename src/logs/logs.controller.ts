import { Controller, Get, Param, Query, UseGuards, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(LogsController.name);

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
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('eventId') eventId?: string,
    @Query('status') status?: LogStatus,
  ) {
    try {
      return await this.logsService.findAll(+page, +limit, eventId, status);
    } catch (error) {
      this.logger.error(`Failed to fetch logs: page=${page} limit=${limit}`, error);
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get log statistics by status' })
  async getStats() {
    try {
      return await this.logsService.getStats();
    } catch (error) {
      this.logger.error('Failed to fetch log statistics', error);
      throw error;
    }
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get all logs for a specific event' })
  async findByEvent(@Param('eventId') eventId: string) {
    try {
      return await this.logsService.findByEvent(eventId);
    } catch (error) {
      this.logger.error(`Failed to fetch logs for eventId: ${eventId}`, error);
      throw error;
    }
  }
}
