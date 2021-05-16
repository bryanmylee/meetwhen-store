import { Field, ObjectType } from 'type-graphql';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class Schedule extends Identifiable {
  @Field((type) => [Interval])
  intervals: Interval[];
}

export class ScheduleEntry extends Identifiable {
  meetingId: string;
  userId: string;
  intervals: Interval[];
}

export class Interval {
  start: number;
  end: number;
}
