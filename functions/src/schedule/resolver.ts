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
import { MeetingService } from '../meeting/service';
import { Meeting } from '../meeting/types';
import { Principal } from '../security/context';
import { UserService } from '../user/service';
import { User } from '../user/types';
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
  private meetingService: MeetingService;

  @Inject()
  private userService: UserService;

  @Query((returns) => Schedule)
  async schedule(@Args() { meetingId, userId }: GetScheduleArgs) {
    return this.scheduleService.findByMeetingUser({ meetingId, userId });
  }

  @FieldResolver()
  async meeting(@Root() { meetingId }: Schedule) {
    return (await this.meetingService.findById(meetingId)) as Meeting;
  }

  @FieldResolver()
  async user(@Root() { userId }: Schedule) {
    return (await this.userService.findById(userId)) as User;
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
      userId: principal!.uid,
    });
  }
}
