import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { JobService } from 'src/services/job.service';

@InputType()
export class ExportInput {
  @Field(() => Number, { nullable: true })
  age?: number;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String)
  exportPath: string;
}

@ObjectType()
export class ExportOutput {
  @Field(() => String)
  jobId: string;
  @Field(() => String, { nullable: true })
  message?: string;
}

@Resolver()
export class JobResolver {
  constructor(private readonly jobService: JobService) {}

  @Mutation(() => ExportOutput)
  async exportJob(@Args('input') input: ExportInput): Promise<ExportOutput> {
    return this.jobService.addExportJob(
      input.age,
      input.userId,
      input.exportPath,
    );
  }
}
