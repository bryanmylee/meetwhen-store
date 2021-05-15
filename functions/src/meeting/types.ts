import { Length } from 'class-validator';
import { Identifiable } from '../types/identifiable';
import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class Meeting extends Identifiable {
  @Field()
  name: string;
}

@InputType()
export class NewMeetingInput implements Partial<Meeting> {
  @Field()
  @Length(1, 50)
  name: string;
}
