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
import { Principal } from '../security/context';
import { UserService } from '../user/service';
import { ScheduleService } from './service';
import { Schedule } from './types';

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

  @Inject()
  private userService: UserService;

  @Query((returns) => Schedule)
  async schedule(@Args() { meetingId, userId }: GetScheduleArgs) {
    return this.scheduleService.findByMeetingUser({ meetingId, userId });
  }

  @FieldResolver()
  async user(@Root() { userId }: Schedule) {
    return this.userService.findById(userId);
  }

  @FieldResolver()
  intervals(@Root() { intervals }: Schedule) {
    return intervals;
  }

  @Mutation((returns) => Schedule)
  @Authorized()
  joinMeeting(
    @Args() { meetingId, intervals }: JoinMeetingArgs,
    @Ctx('principal') principal: Principal
  ) {
    return this.scheduleService.joinMeeting({
      meetingId,
      intervals,
      userId: principal?.uid as string,
    });
  }
}
