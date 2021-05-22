import { Field, ObjectType } from 'type-graphql';
import { Meeting } from '../meeting/types';
import { Identifiable } from '../types/identifiable';
import { Interval } from '../types/interval';
import { User } from '../user/types';

@ObjectType()
export class Schedule extends Identifiable {
  @Field(() => Meeting)
  meeting: Meeting;
  meetingId: string;

  @Field(() => User)
  user: User;
  userId: string;

  @Field(() => [Interval])
  intervals: Interval[];
}

export class ScheduleEntry extends Identifiable {
  meetingId: string;
  userId: string;
  intervals: Interval[];
}
