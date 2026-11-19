import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { CodingModule } from './coding/coding.module';
import { ExecutionModule } from './execution/execution.module';
import { DsaModule } from './dsa/dsa.module';
import { SystemDesignModule } from './system-design/system-design.module';
import { MockInterviewsModule } from './mock-interviews/mock-interviews.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { DailyModule } from './daily/daily.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    QuestionsModule,
    CodingModule,
    ExecutionModule,
    DsaModule,
    SystemDesignModule,
    MockInterviewsModule,
    QuizzesModule,
    DailyModule,
    BookmarksModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
