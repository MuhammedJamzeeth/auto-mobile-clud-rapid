import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
  Query,
} from '@nestjs/graphql';
import { JobService } from 'src/services/job.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { console } from 'inspector';
import { Logger, NotFoundException } from '@nestjs/common';
import { IsOptional, IsNumber, IsString } from 'class-validator';

@InputType()
export class ExportInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  age?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  // @Field(() => String, { nullable: true })
  // exportPath?: string;
}

@ObjectType()
export class ExportOutput {
  @Field(() => String)
  jobId: string;
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => String)
  status: string;
}

@ObjectType()
export class JobStatus {
  @Field(() => String)
  jobId: string;
  @Field(() => String)
  status: string;
  @Field(() => Number)
  progress: number;
  @Field(() => String, { nullable: true })
  failedReason?: string;
  @Field(() => String, { nullable: true })
  filePath?: string;
}

@Resolver()
export class JobResolver {
  constructor(
    private readonly jobService: JobService,
    @InjectQueue('export-queue') private exportQueue: Queue,
  ) {}

  @Mutation(() => ExportOutput)
  async exportJob(
    @Args('input', {
      type: () => ExportInput,
    })
    input: ExportInput,
  ): Promise<ExportOutput> {
    const result = await this.jobService.addExportJob(
      input.age,
      input.userId,
      // input.exportPath,
    );

    return {
      jobId: result.jobId,
      message: result.message,
      status: 'queued',
    };
  }

  @Query(() => JobStatus)
  async jobStatus(@Args('jobId') jobId: string): Promise<JobStatus> {
    const job = await this.exportQueue.getJob(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isCompleted = await job.isCompleted();
    const isFailed = await job.isFailed();
    const isActive = await job.isActive();
    const isWaiting = await job.isWaiting();

    return {
      jobId: job.id.toString(),
      status: isCompleted
        ? 'completed'
        : isFailed
          ? 'failed'
          : isActive
            ? 'processing'
            : isWaiting
              ? 'queued'
              : 'unknown',
      progress: job.progress(),
      failedReason: isFailed ? job.failedReason : undefined,
      filePath: job.data.filePath,
    };
  }
}
