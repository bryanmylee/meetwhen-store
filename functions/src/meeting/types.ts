import { Field, ObjectType } from 'type-graphql';
import { Schedule } from '../schedule/types';
import { Identifiable } from '../types/identifiable';
import { User } from '../user/types';

@ObjectType()
export class Meeting extends Identifiable {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  owner?: User;
  ownerId?: string;

  @Field(() => [Schedule])
  schedules: Schedule[];
}

export class MeetingEntry extends Identifiable {
  name: string;
  slug: string;
  ownerId?: string;
}
