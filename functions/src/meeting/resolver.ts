import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Inject, Service } from "typedi";
import { MeetingService } from "./service";
import { Meeting, NewMeetingInput } from "./types";

@Service()
@Resolver(Meeting)
export class MeetingResolver {
  @Inject()
  private meetingService: MeetingService;

  @Query((returns) => Meeting)
  async meeting(@Arg('id') id: string) {
    return this.meetingService.findById(id);
  }
  
  @Mutation((returns) => Meeting)
  async addMeeting(@Arg('data') data: NewMeetingInput) {
    return this.meetingService.addNew(data);
  }
}
