import { Field, ObjectType } from 'type-graphql';
import { Meeting } from '../meeting/types';
import { Schedule } from '../schedule/types';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class User extends Identifiable {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => [Meeting])
  meetings: Meeting[];

  @Field(() => [Schedule])
  schedules: Schedule[];
}

export class UserEntry extends Identifiable {
  name: string;
  email: string;
}
