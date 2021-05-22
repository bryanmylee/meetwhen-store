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
import { Schedule } from '../schedule/types';
import { Principal } from '../security/context';
import { Interval, IntervalInput } from '../types/interval';
import { UserService } from '../user/service';
import { User } from '../user/types';
import { MeetingService } from './service';
import { Meeting } from './types';

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
}

@InputType()
class EditMeetingInput implements Partial<Meeting> {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @Length(1, 50)
  name?: string;
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
  async meeting(@Args() { id, slug }: QueryMeetingArgs): Promise<Meeting> {
    if (id !== undefined) {
      return (await this.meetingService.findById(id)) as Meeting;
    }
    if (slug !== undefined) {
      return (await this.meetingService.findBySlug(slug)) as Meeting;
    }
    throw new HttpsError('invalid-argument', 'id or slug must be provided');
  }

  @FieldResolver()
  async owner(@Root() meeting: Meeting): Promise<User | undefined> {
    if (meeting.ownerId === undefined) {
      return undefined;
    }
    return (await this.userService.findById(meeting.ownerId)) as User;
  }

  @FieldResolver()
  intervals(@Root() { intervals }: Meeting): Interval[] {
    return intervals;
  }

  @FieldResolver()
  async schedules(@Root() meeting: Meeting): Promise<Schedule[]> {
    return (await this.scheduleService.findAllWithMeetingId(meeting.id)) as Schedule[];
  }

  @Mutation(() => Meeting)
  async addMeeting(
    @Arg('data') data: AddMeetingInput,
    @Ctx('principal') principal: Principal
  ): Promise<Meeting> {
    if (principal !== null) {
      return (await this.meetingService.addNew({ ...data, ownerId: principal.uid })) as Meeting;
    }
    return (await this.meetingService.addNew(data)) as Meeting;
  }

  @Mutation(() => Meeting)
  @Authorized()
  async editMeeting(
    @Arg('data') { id, ...editArgs }: EditMeetingInput,
    @Ctx('principal') principal: Principal
  ): Promise<Meeting> {
    const meetingEntry = await this.meetingService.findById(id);
    if (meetingEntry.ownerId === undefined) {
      throw new HttpsError(
        'permission-denied',
        `meeting(id=${id}) has no owner and cannot be edited`
      );
    }
    if (principal!.uid !== meetingEntry.ownerId) {
      throw new HttpsError('permission-denied', `meeting(id=${id}) edit permission denied`);
    }
    return (await this.meetingService.edit(id, editArgs)) as Meeting;
  }
}
