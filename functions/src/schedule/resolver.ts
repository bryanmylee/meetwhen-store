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
import { Interval, Schedule } from './types';

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

  @Field(() => [IntervalInput])
  intervals: IntervalInput[];
}

@InputType()
class IntervalInput {
  @Field(() => Int)
  beg: number;

  @Field(() => Int)
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

  @Query(() => Schedule)
  async schedule(@Args() { meetingId, userId }: GetScheduleArgs): Promise<Schedule> {
    return (await this.scheduleService.findByMeetingUser({ meetingId, userId })) as Schedule;
  }

  @FieldResolver()
  async meeting(@Root() { meetingId }: Schedule): Promise<Meeting> {
    return (await this.meetingService.findById(meetingId)) as Meeting;
  }

  @FieldResolver()
  async user(@Root() { userId }: Schedule): Promise<User> {
    return (await this.userService.findById(userId)) as User;
  }

  @FieldResolver()
  intervals(@Root() { intervals }: Schedule): Interval[] {
    return intervals;
  }

  @Mutation(() => Schedule)
  @Authorized()
  async joinMeeting(
    @Args() { meetingId, intervals }: JoinMeetingArgs,
    @Ctx('principal') principal: Principal
  ): Promise<Schedule> {
    return (await this.scheduleService.joinMeeting({
      meetingId,
      intervals,
      userId: principal!.uid,
    })) as Schedule;
  }
}
