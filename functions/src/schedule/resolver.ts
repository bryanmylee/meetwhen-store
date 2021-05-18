import {
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { ScheduleService } from './service';
import { Schedule } from './types';
import { Principal } from '../security/context';

@ArgsType()
class GetScheduleArgs {
  @Field()
  meetingId: string;

  @Field()
  userId: string;
}

@ArgsType()
class JoinMeetingArgs {
  @Field()
  meetingId: string;

  @Field((type) => [IntervalInput])
  intervals: IntervalInput[];
}

@InputType()
class IntervalInput {
  @Field((type) => Int)
  beg: number;

  @Field((type) => Int)
  end: number;
}


@Service()
@Resolver(Schedule)
export class ScheduleResolver implements ResolverInterface<Schedule> {
  @Inject()
  private scheduleService: ScheduleService;

  @Query((returns) => Schedule)
  async schedule(@Args() { meetingId, userId }: GetScheduleArgs) {
    return this.scheduleService.findByMeetingUser({ meetingId, userId });
  }

  @FieldResolver()
  intervals(@Root() { intervals }: Schedule) {
    return intervals;
  }
  
  @Mutation((returns) => Schedule)
  @Authorized()
  joinMeeting(@Args() { meetingId, intervals }: JoinMeetingArgs, @Ctx('principal') principal: Principal) {
    console.log({ meetingId, intervals, principal });
  }
}
