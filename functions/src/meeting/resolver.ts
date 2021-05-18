import { Length } from 'class-validator';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import {
  Arg,
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
import { MeetingService } from './service';
import { Meeting } from './types';

@InputType()
class AddMeetingInput implements Partial<Meeting> {
  @Field()
  @Length(1, 50)
  name: string;
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
    return this.userService.findById(meeting.ownerId);
  }

  @FieldResolver()
  async schedules(@Root() meeting: Meeting) {
    const scheduleEntries = await this.scheduleService.findAllWithMeetingId(meeting.id);
    return scheduleEntries as Schedule[];
  }

  @Mutation((returns) => Meeting)
  async addMeeting(@Arg('data') data: AddMeetingInput, @Ctx('principal') principal: Principal) {
    if (principal !== null) {
      return this.meetingService.addNew({ ...data, ownerId: principal.uid });
    }
    return this.meetingService.addNew(data);
  }
}
