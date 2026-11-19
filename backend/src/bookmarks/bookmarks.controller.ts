import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BookmarkType } from '../database/entities/user-bookmark.entity';

@Controller('api/bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  async getBookmarks(
    @CurrentUser('id') userId: number,
    @Query('itemType') itemType?: BookmarkType,
  ) {
    return this.bookmarksService.getBookmarks(userId, itemType);
  }

  @Post('toggle')
  async toggleBookmark(
    @CurrentUser('id') userId: number,
    @Body() body: { itemType: BookmarkType; itemId: number },
  ) {
    return this.bookmarksService.toggleBookmark(
      userId,
      body.itemType,
      Number(body.itemId),
    );
  }

  @Get('notes')
  async getNotes(
    @CurrentUser('id') userId: number,
    @Query('itemType') itemType?: string,
    @Query('itemId') itemId?: number,
  ) {
    return this.bookmarksService.getNotes(
      userId,
      itemType,
      itemId ? Number(itemId) : undefined,
    );
  }

  @Post('notes')
  async saveNote(
    @CurrentUser('id') userId: number,
    @Body()
    body: { itemType: string; itemId?: number; title?: string; content: string },
  ) {
    return this.bookmarksService.saveNote(userId, body);
  }

  @Delete('notes/:id')
  async deleteNote(
    @CurrentUser('id') userId: number,
    @Param('id') id: number,
  ) {
    return this.bookmarksService.deleteNote(Number(id), userId);
  }
}
