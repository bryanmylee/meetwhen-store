import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class CollectionQueryArgs {
  @Field(() => Int, { nullable: true })
  limit?: number;
}
