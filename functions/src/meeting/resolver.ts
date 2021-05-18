import { Length } from 'class-validator';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
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
import { UserService } from '../user/service';
import { User } from '../user/types';
import { MeetingService } from './service';
import { Meeting } from './types';

@InputType()
class AddMeetingInput implements Partial<Meeting> {
  @Field()
  @Length(1, 50)
  name: string;
}

@InputType()
class EditMeetingInput implements Partial<Meeting> {
  @Field()
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

  @Query((returns) => Meeting)
  async meeting(@Arg('id') id: string) {
    return this.meetingService.findById(id);
  }

  @FieldResolver()
  async owner(@Root() meeting: Meeting) {
    if (meeting.ownerId === undefined) {
      throw new HttpsError('invalid-argument', `meeting(id=${meeting.id}) no owner`);
    }
    return (await this.userService.findById(meeting.ownerId)) as User;
  }

  @FieldResolver()
  async schedules(@Root() meeting: Meeting) {
    return (await this.scheduleService.findAllWithMeetingId(meeting.id)) as Schedule[];
  }

  @Mutation((returns) => Meeting)
  async addMeeting(@Arg('data') data: AddMeetingInput, @Ctx('principal') principal: Principal) {
    if (principal !== null) {
      return this.meetingService.addNew({ ...data, ownerId: principal.uid });
    }
    return this.meetingService.addNew(data);
  }

  @Mutation((returns) => Meeting)
  @Authorized()
  async editMeeting(
    @Arg('data') { id, ...editArgs }: EditMeetingInput,
    @Ctx('principal') principal: Principal
  ) {
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
    return this.meetingService.edit(id, editArgs);
  }
}
