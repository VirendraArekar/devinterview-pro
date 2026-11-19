import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as fs from 'fs';
import { User, UserRole } from '../entities/user.entity';
import { Question } from '../entities/question.entity';
import { CodingProblem } from '../entities/coding-problem.entity';
import { SystemDesignTopic } from '../entities/system-design-topic.entity';
import { Quiz } from '../entities/quiz.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { CodeSubmission, SubmissionStatus } from '../entities/code-submission.entity';
import { DailyActivity } from '../entities/daily-activity.entity';

import { initialQuestionsSeed } from './questions.seed';
import { initialCodingProblemsSeed } from './coding-problems.seed';
import { initialSystemDesignSeed } from './system-design.seed';
import { initialQuizzesSeed } from './quizzes.seed';

export async function runSeeds() {
  console.log('🌱 Starting DevInterview Pro Database Seeder...');

  const dbType = process.env.DB_TYPE || 'sqlite';
  const entities = [
    User,
    Question,
    CodingProblem,
    SystemDesignTopic,
    Quiz,
    QuizQuestion,
    CodeSubmission,
    DailyActivity,
  ];

  let dataSource: DataSource;

  if (dbType === 'mysql') {
    dataSource = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'devinterview',
      password: process.env.DB_PASSWORD || 'devinterview_secret',
      database: process.env.DB_DATABASE || 'devinterview_db',
      entities,
      synchronize: true,
      logging: false,
    });
  } else {
    const sqlitePath = process.env.SQLITE_DB_PATH || './data/devinterview.sqlite';
    const resolvedPath = path.resolve(process.cwd(), sqlitePath);
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: resolvedPath,
      entities,
      synchronize: true,
      logging: false,
    });
  }

  let connected = false;
  let attempts = 0;
  while (!connected && attempts < 15) {
    try {
      await dataSource.initialize();
      connected = true;
    } catch (err) {
      attempts++;
      if (attempts >= 15) throw err;
      console.log(`⏳ Database connection retry (${attempts}/15)...`);
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
  console.log(`✅ Connected to database (${dbType})`);

  const userRepo = dataSource.getRepository(User);
  const questionRepo = dataSource.getRepository(Question);
  const problemRepo = dataSource.getRepository(CodingProblem);
  const designRepo = dataSource.getRepository(SystemDesignTopic);
  const quizRepo = dataSource.getRepository(Quiz);
  const quizQuestionRepo = dataSource.getRepository(QuizQuestion);
  const activityRepo = dataSource.getRepository(DailyActivity);
  const submissionRepo = dataSource.getRepository(CodeSubmission);

  // 1. Seed Users
  const userCount = await userRepo.count();
  if (userCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    const userHash = await bcrypt.hash('Dev@12345', salt);

    const admin = userRepo.create({
      email: 'admin@devinterview.pro',
      passwordHash: adminHash,
      name: 'System Administrator',
      role: UserRole.ADMIN,
      experienceLevel: '12+ Years',
      targetCompensation: '₹35–40 LPA',
      bio: 'Staff Engineer & Interview Architect at DevInterview Pro.',
      dailyStreak: 14,
      lastActiveDate: new Date().toISOString().split('T')[0],
      emailVerified: true,
    });

    const demoUser = userRepo.create({
      email: 'developer@devinterview.pro',
      passwordHash: userHash,
      name: 'Alex Johnson',
      role: UserRole.USER,
      experienceLevel: '5–8 Years',
      targetCompensation: '₹25–30 LPA',
      bio: 'Full-Stack Software Engineer preparing for senior product company roles.',
      dailyStreak: 7,
      lastActiveDate: new Date().toISOString().split('T')[0],
      emailVerified: true,
    });

    await userRepo.save([admin, demoUser]);
    console.log('👤 Seeded default Admin and Demo Developer users');
  }

  function findDataFile(filename: string): string | null {
    const candidates = [
      path.join(__dirname, 'data', filename),
      path.join(process.cwd(), 'dist', 'database', 'seeds', 'data', filename),
      path.join(process.cwd(), 'src', 'database', 'seeds', 'data', filename),
      path.join(process.cwd(), 'backend', 'src', 'database', 'seeds', 'data', filename),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return null;
  }

  // 2. Seed Question Bank (Target: 500+ comprehensive subjective interview questions)
  const questionCount = await questionRepo.count();
  if (questionCount < 500) {
    const existing = await questionRepo.find({ select: ['slug'] });
    const existingSlugs = new Set(existing.map((e) => e.slug));

    const allQuestions = [...initialQuestionsSeed];
    const qFile = findDataFile('questions-comprehensive.json');
    if (qFile) {
      try {
        const loaded = JSON.parse(fs.readFileSync(qFile, 'utf-8'));
        allQuestions.push(...loaded);
      } catch (e: any) {
        console.warn(`Notice loading questions-comprehensive.json: ${e.message}`);
      }
    }

    const toInsert = allQuestions.filter((q) => {
      if (existingSlugs.has(q.slug)) return false;
      existingSlugs.add(q.slug);
      return true;
    });

    if (toInsert.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        await questionRepo.save(questionRepo.create(chunk));
      }
    }
    console.log(`📚 Seeded ${toInsert.length} technical interview questions (Total in DB: ${await questionRepo.count()})`);
  }

  // 3. Seed Coding Problems (Target: 500+ coding challenges across 22 DSA categories)
  const problemCount = await problemRepo.count();
  if (problemCount < 500) {
    const existing = await problemRepo.find({ select: ['slug'] });
    const existingSlugs = new Set(existing.map((e) => e.slug));

    const allProblems = [...initialCodingProblemsSeed];
    const cFile = findDataFile('coding-comprehensive.json');
    if (cFile) {
      try {
        const loaded = JSON.parse(fs.readFileSync(cFile, 'utf-8'));
        allProblems.push(...loaded);
      } catch (e: any) {
        console.warn(`Notice loading coding-comprehensive.json: ${e.message}`);
      }
    }

    const toInsert = allProblems.filter((p) => {
      if (existingSlugs.has(p.slug)) return false;
      existingSlugs.add(p.slug);
      return true;
    });

    if (toInsert.length > 0) {
      const chunkSize = 50;
      for (let i = 0; i < toInsert.length; i += chunkSize) {
        const chunk = toInsert.slice(i, i + chunkSize);
        await problemRepo.save(problemRepo.create(chunk));
      }
    }
    console.log(`💻 Seeded ${toInsert.length} LeetCode-style coding challenges (Total in DB: ${await problemRepo.count()})`);
  }

  // 4. Seed System Design Topics
  const designCount = await designRepo.count();
  if (designCount === 0) {
    await designRepo.save(designRepo.create(initialSystemDesignSeed));
    console.log(`🏗️ Seeded ${initialSystemDesignSeed.length} real-world system design blueprints`);
  }

  // 5. Seed Quizzes
  const quizCount = await quizRepo.count();
  if (quizCount === 0) {
    for (const item of initialQuizzesSeed) {
      const qEntity = await quizRepo.save(quizRepo.create(item.quiz));
      const questionsWithId = item.questions.map((q) => ({
        ...q,
        quizId: qEntity.id,
      }));
      await quizQuestionRepo.save(quizQuestionRepo.create(questionsWithId));
    }
    console.log(`📝 Seeded ${initialQuizzesSeed.length} domain assessment quizzes`);
  }

  // 6. Seed Sample Submissions and Activities for Demo User
  const demoUser = await userRepo.findOne({
    where: { email: 'developer@devinterview.pro' },
  });
  if (demoUser) {
    const subCount = await submissionRepo.count({
      where: { userId: demoUser.id },
    });
    if (subCount === 0) {
      const firstProblem = await problemRepo.findOne({
        where: { slug: 'two-sum' },
      });
      if (firstProblem) {
        await submissionRepo.save(
          submissionRepo.create({
            userId: demoUser.id,
            problemId: firstProblem.id,
            language: 'javascript',
            code: firstProblem.starterCode.javascript || '',
            status: SubmissionStatus.ACCEPTED,
            runtimeMs: 45,
            memoryKb: 13400,
            testCasesPassed: 4,
            totalTestCases: 4,
          }),
        );
      }
    }

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const ds = d.toISOString().split('T')[0];

      const exists = await activityRepo.findOne({
        where: { userId: demoUser.id, dateString: ds },
      });
      if (!exists) {
        await activityRepo.save(
          activityRepo.create({
            userId: demoUser.id,
            dateString: ds,
            questionsCompleted: Math.floor(2 + Math.random() * 4),
            codingProblemsSolved: Math.floor(1 + Math.random() * 3),
            quizzesTaken: i % 2 === 0 ? 1 : 0,
            minutesSpent: Math.floor(30 + Math.random() * 45),
          }),
        );
      }
    }
    console.log('📈 Seeded 7-day demo user progress activities');
  }

  console.log('🎉 Database seeding completed successfully!');
  // Avoid dataSource.destroy() on Node 24 to prevent V8 isolate cleanup hook assertion
}

if (require.main === module) {
  runSeeds().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
