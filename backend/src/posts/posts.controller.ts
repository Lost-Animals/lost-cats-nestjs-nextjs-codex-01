import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { ResolvePostDto } from './dto/resolve-post.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  list(@Query() query: ListPostsDto) {
    return this.postsService.list(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, user.id, user.role, dto);
  }

  @Post(':id/resolve')
  @UseGuards(AuthGuard('jwt'))
  resolve(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }, @Body() dto: ResolvePostDto) {
    return this.postsService.resolve(id, user.id, user.role, dto);
  }

  @Post(':id/archive')
  @UseGuards(AuthGuard('jwt'))
  archive(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.postsService.archive(id, user.id, user.role);
  }
}
