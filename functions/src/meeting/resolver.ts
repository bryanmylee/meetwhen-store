import { Length } from 'class-validator';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import {
  Arg,
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
import { UserService } from '../user/service';
import { MeetingService } from './service';
import { Meeting } from './types';

@InputType()
class AddMeetingArgs implements Partial<Meeting> {
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

  // TODO: Get owner id from context.
  @Mutation((returns) => Meeting)
  async addMeeting(@Arg('data') data: AddMeetingArgs) {
    return this.meetingService.addNew(data);
  }
}
