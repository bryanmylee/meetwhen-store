import { HttpsError } from 'firebase-functions/lib/providers/https';
import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Inject, Service } from 'typedi';
import { UserService } from '../user/service';
import { MeetingService } from './service';
import { Meeting, MeetingEntry, NewMeetingInput } from './types';

@Service()
@Resolver(Meeting)
export class MeetingResolver implements ResolverInterface<Meeting> {
  @Inject()
  private meetingService: MeetingService;

  @Inject()
  private userService: UserService;

  @Query((returns) => Meeting)
  async meeting(@Arg('id') id: string) {
    return this.meetingService.findById(id);
  }

  @FieldResolver()
  async owner(@Root() meeting: MeetingEntry) {
    if (meeting.ownerId === undefined) {
      throw new HttpsError('invalid-argument', `meeting(id=${meeting.id}) no owner`);
    }
    return this.userService.findById(meeting.ownerId);
  }

  // TODO: Get owner id from context.
  @Mutation((returns) => Meeting)
  async addMeeting(@Arg('data') data: NewMeetingInput) {
    return this.meetingService.addNew(data);
  }
}
