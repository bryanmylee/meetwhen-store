import { Meeting } from '../meeting/types';
import { Field, ObjectType } from 'type-graphql';
import { Schedule } from '../schedule/types';
import { Identifiable } from '../types/identifiable';

@ObjectType()
export class User extends Identifiable {
  @Field()
  name: string;

  @Field()
  email: string;
  
  @Field((type) => [Meeting])
  meetings: Meeting[];

  @Field((type) => [Schedule])
  schedules: Schedule[];
}

export class UserEntry extends Identifiable {
  name: string;
  email: string;
}
