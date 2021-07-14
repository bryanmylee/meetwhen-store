import { Length } from 'class-validator';
import { HttpsError } from 'firebase-functions/lib/providers/https';
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
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { ScheduleService } from '../schedule/service';
import { Schedule, ScheduleCollectionQueryArgs, ScheduleEntry } from '../schedule/types';
import { Principal } from '../security/context';
import { Interval, IntervalInput } from '../types/interval';
import { UserService } from '../user/service';
import { User, UserShallow } from '../user/types';
import { MeetingService } from './service';
import { Meeting, MeetingEntry } from './types';

@ArgsType()
class QueryMeetingArgs implements Partial<Meeting> {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  slug?: string;
}

@InputType()
class AddMeetingInput implements Partial<Meeting> {
  @Field()
  @Length(1, 50)
  name: string;

  @Field(() => [IntervalInput])
  intervals: IntervalInput[];

  @Field({ nullable: true })
  emoji?: string;
}

@InputType()
class EditMeetingInput implements Partial<Meeting> {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @Length(1, 50)
  name?: string;

  @Field({ nullable: true })
  emoji?: string;
}

@Service()
@Resolver(Meeting)
export class MeetingResolver implements ResolverInterface<Meeting> {
  @Inject()
  private meetingService: MeetingService;

  @Inject()
  private userService: UserService;

  @Inject()
  private scheduleService: ScheduleService;

  @Query(() => Meeting)
  async meeting(@Args() { id, slug }: QueryMeetingArgs): Promise<MeetingEntry> {
    if (id !== undefined) {
      return this.meetingService.findById(id);
    }
    if (slug !== undefined) {
      return this.meetingService.findBySlug(slug);
    }
    throw new HttpsError('invalid-argument', 'id or slug must be provided', {
      id: 'invalid-argument',
    });
  }

  @FieldResolver(() => User)
  async owner(@Root() meeting: Meeting): Promise<UserShallow | undefined> {
    if (meeting.ownerId === undefined) {
      return undefined;
    }
    return this.userService.findById(meeting.ownerId);
  }

  @FieldResolver(() => [Interval])
  intervals(@Root() { intervals }: Meeting): Interval[] {
    return intervals;
  }

  @FieldResolver(() => [Schedule])
  async schedules(
    @Root() meeting: Meeting,
    @Args() args?: ScheduleCollectionQueryArgs
  ): Promise<ScheduleEntry[]> {
    return this.scheduleService.findAllByMeetingId(meeting.id, args);
  }

  @Mutation(() => Meeting)
  async addMeeting(
    @Arg('data') data: AddMeetingInput,
    @Ctx('principal') principal: Principal
  ): Promise<MeetingEntry> {
    if (principal !== null && principal.guestOf === null) {
      return this.meetingService.addNew({ ...data, ownerId: principal.id });
    }
    return this.meetingService.addNew(data);
  }

  @Mutation(() => Meeting)
  @Authorized()
  async editMeeting(
    @Arg('data') { id, ...editArgs }: EditMeetingInput,
    @Ctx('principal') principal: Principal
  ): Promise<MeetingEntry> {
    const meetingEntry = await this.meetingService.findById(id);
    if (meetingEntry.ownerId === undefined) {
      throw new HttpsError(
        'permission-denied',
        `meeting(id=${id}) has no owner and cannot be edited`,
        { id: 'no-owner' }
      );
    }
    if (principal!.id !== meetingEntry.ownerId) {
      throw new HttpsError('permission-denied', `meeting(id=${id}) edit permission denied`, {
        id: 'permission-denied',
      });
    }
    return this.meetingService.edit(id, editArgs);
  }
}
