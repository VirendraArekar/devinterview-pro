import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SystemDesignType {
  HLD = 'High-Level Design',
  LLD = 'Low-Level Design',
  REAL_WORLD = 'Real-World System',
}

@Entity('system_design_topics')
export class SystemDesignTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'varchar',
    default: SystemDesignType.REAL_WORLD,
  })
  type: SystemDesignType;

  @Column({ type: 'text' })
  summary: string;

  @Column({ default: 'Advanced' })
  difficulty: string;

  @Column({ default: '5–8 Years' })
  experienceLevel: string;

  @Column({ type: 'simple-json', nullable: true })
  functionalRequirements: string[];

  @Column({ type: 'simple-json', nullable: true })
  nonFunctionalRequirements: string[];

  @Column({ type: 'simple-json', nullable: true })
  capacityEstimation: {
    dau?: string;
    qps?: string;
    peakQps?: string;
    storagePerDay?: string;
    storage5Years?: string;
    networkBandwidth?: string;
    notes?: string;
  };

  @Column({ type: 'simple-json', nullable: true })
  architectureDiagram: {
    type: string; // 'mermaid' | 'flow' | 'nodes'
    content: string;
    layers: {
      name: string;
      components: string[];
      description: string;
    }[];
  };

  @Column({ type: 'simple-json', nullable: true })
  databaseSchema: {
    type: string;
    tables: {
      tableName: string;
      primaryKey: string;
      columns: { name: string; type: string; desc: string }[];
      partitionKey?: string;
    }[];
    notes?: string;
  };

  @Column({ type: 'simple-json', nullable: true })
  apiDesign: {
    endpoint: string;
    method: string;
    description: string;
    requestBody?: string;
    responseBody?: string;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  componentBreakdown: {
    name: string;
    role: string;
    techStack: string;
    scalabilityNotes: string;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  scalingStrategy: string[];

  @Column({ type: 'simple-json', nullable: true })
  bottlenecks: string[];

  @Column({ type: 'simple-json', nullable: true })
  failureScenarios: {
    scenario: string;
    impact: string;
    mitigation: string;
  }[];

  @Column({ type: 'simple-json', nullable: true })
  securityConsiderations: string[];

  @Column({ type: 'simple-json', nullable: true })
  tradeOffs: {
    choiceA: string;
    choiceB: string;
    selected: string;
    justification: string;
  }[];

  @Column({ type: 'text', nullable: true })
  interviewExplanation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
