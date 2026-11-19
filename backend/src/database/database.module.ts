import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Question } from './entities/question.entity';
import { CodingProblem } from './entities/coding-problem.entity';
import { CodeSubmission } from './entities/code-submission.entity';
import { SystemDesignTopic } from './entities/system-design-topic.entity';
import { MockInterview } from './entities/mock-interview.entity';
import { MockInterviewAnswer } from './entities/mock-interview-answer.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { DailyActivity } from './entities/daily-activity.entity';
import { UserBookmark } from './entities/user-bookmark.entity';
import { UserNote } from './entities/user-note.entity';
import * as path from 'path';
import * as fs from 'fs';

const entities = [
  User,
  Question,
  CodingProblem,
  CodeSubmission,
  SystemDesignTopic,
  MockInterview,
  MockInterviewAnswer,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  DailyActivity,
  UserBookmark,
  UserNote,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>('DB_TYPE', 'sqlite');

        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: configService.get<string>('DB_HOST', 'localhost'),
            port: configService.get<number>('DB_PORT', 3306),
            username: configService.get<string>('DB_USERNAME', 'devinterview'),
            password: configService.get<string>('DB_PASSWORD', 'devinterview_secret'),
            database: configService.get<string>('DB_DATABASE', 'devinterview_db'),
            entities,
            synchronize: true, // Auto synchronize schema for dev/staging
            logging: false,
            retryAttempts: 15,
            retryDelay: 3000,
          };
        }

        // SQLite fallback for frictionless zero-config local runs
        const sqlitePath = configService.get<string>(
          'SQLITE_DB_PATH',
          './data/devinterview.sqlite',
        );
        const resolvedPath = path.resolve(process.cwd(), sqlitePath);
        const dir = path.dirname(resolvedPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        return {
          type: 'better-sqlite3',
          database: resolvedPath,
          entities,
          synchronize: true,
          logging: false,
        };
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
