import { Response } from 'express';
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { firebaseAdmin } from '../firebase/setup';
import { MeetingService } from '../meeting/service';
import { Meeting } from '../meeting/types';
import { Principal } from '../security/context';
import { Interval, IntervalInput } from '../types/interval';
import { UserService } from '../user/service';
import { User } from '../user/types';
import { ScheduleService } from './service';
import { Schedule } from './types';

@ArgsType()
class GetScheduleArgs {
  @Field(() => ID)
  meetingId: string;

  @Field(() => ID)
  userId: string;
}

@InputType()
class ScheduleInput {
  @Field(() => ID)
  meetingId: string;

  @Field(() => [IntervalInput])
  intervals: IntervalInput[];
}

@InputType()
class AddGuestScheduleInput extends ScheduleInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@InputType()
class EditGuestScheduleInput extends ScheduleInput {
  @Field()
  token: string;
}

@ObjectType()
class ScheduleWithToken extends Schedule {
  @Field()
  token: string;
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
  async addSchedule(
    @Arg('data') { meetingId, intervals }: ScheduleInput,
    @Ctx('principal') principal: Principal
  ): Promise<Schedule> {
    return (await this.scheduleService.addSchedule({
      meetingId,
      intervals,
      userId: principal!.uid,
    })) as Schedule;
  }

  @Mutation(() => ScheduleWithToken)
  async addGuestSchedule(
    @Arg('data') { username, password, meetingId, intervals }: AddGuestScheduleInput,
    @Ctx('res') res: Response
  ): Promise<ScheduleWithToken> {
    const { user, scheduleEntry } = await this.scheduleService.addGuestSchedule({
      meetingId,
      intervals,
      username,
      password,
    });
    const userRecord = await this.userService.login({ email: user.email, password });
    const token = await userRecord.getIdToken();
    res.setHeader('__token', token);
    return {
      ...(scheduleEntry as Schedule),
      token,
    };
  }

  @Mutation(() => Schedule)
  @Authorized()
  async editSchedule(
    @Arg('data') { meetingId, intervals }: ScheduleInput,
    @Ctx('principal') principal: Principal
  ): Promise<Schedule> {
    return (await this.scheduleService.editSchedule({
      meetingId,
      intervals,
      userId: principal!.uid,
    })) as Schedule;
  }

  @Mutation(() => Schedule)
  async editGuestSchedule(
    @Arg('data') { meetingId, intervals, token }: EditGuestScheduleInput
  ): Promise<Schedule> {
    const principal: Principal = await firebaseAdmin.auth().verifyIdToken(token);
    return (await this.scheduleService.editSchedule({
      meetingId,
      intervals,
      userId: principal!.uid,
    })) as Schedule;
  }
}
