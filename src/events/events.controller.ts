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
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Publish a business event',
    description:
      'Persists the event to the database and enqueues it for async processing via BullMQ.',
  })
  @ApiResponse({ status: 201, description: 'Event published and queued' })
  publish(@Body() dto: CreateEventDto, @Request() req) {
    // Use authenticated user's userId instead of request body
    const userId = req.user?.id;
    return this.eventsService.publish(dto.type, dto.payload, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all events (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.eventsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID with its processing logs' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }
}
