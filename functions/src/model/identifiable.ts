import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
export class Identifiable {
  @Field((type) => ID)
  id: string;
}
