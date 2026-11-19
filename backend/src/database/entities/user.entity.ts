import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MENTOR = 'MENTOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: '3-5 Years' })
  experienceLevel: string;

  @Column({ default: '₹20-25 LPA' })
  targetCompensation: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 1 })
  dailyStreak: number;

  @Column({ nullable: true })
  lastActiveDate: string;

  @Column({ default: true })
  emailVerified: boolean;

  @Column({ nullable: true, select: false })
  refreshTokenHash: string;

  @Column({ nullable: true, select: false })
  resetPasswordToken: string;

  @Column({ nullable: true, select: false })
  resetPasswordExpires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
