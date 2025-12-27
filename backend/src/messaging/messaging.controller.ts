import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessagingService } from './messaging.service';
import { ContactPostDto } from './dto/contact-post.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller()
@UseGuards(AuthGuard('jwt'))
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('posts/:id/contact')
  contactPost(
    @Param('id') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ContactPostDto
  ) {
    return this.messagingService.contactPost(postId, user.id, dto.message);
  }

  @Get('threads')
  listThreads(@CurrentUser() user: { id: string }) {
    return this.messagingService.listThreads(user.id);
  }

  @Get('threads/:id/messages')
  listMessages(@Param('id') threadId: string, @CurrentUser() user: { id: string }) {
    return this.messagingService.listMessages(threadId, user.id);
  }

  @Post('threads/:id/messages')
  createMessage(
    @Param('id') threadId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateMessageDto
  ) {
    return this.messagingService.createMessage(threadId, user.id, dto.body);
  }
}
