import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './events.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Publish a business event',
    description:
      'Persists the event to the database and enqueues it for async processing via BullMQ.',
  })
  @ApiResponse({ status: 201, description: 'Event published and queued' })
  async publish(@Body() dto: CreateEventDto, @Request() req) {
    try {
      const userId = req.user?.id;
      return await this.eventsService.publish(dto.type, dto.payload, userId);
    } catch (error) {
      this.logger.error(`Failed to publish event type=${dto.type}`, error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all events (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      return await this.eventsService.findAll(+page, +limit);
    } catch (error) {
      this.logger.error(`Failed to fetch events: page=${page} limit=${limit}`, error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID with its processing logs' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.eventsService.findById(id);
    } catch (error) {
      this.logger.error(`Failed to fetch event by id: ${id}`, error);
      throw error;
    }
  }
}
