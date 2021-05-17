import { AuthChecker } from 'type-graphql';
import { Context } from './context';

export const authChecker: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
  return true;
  // return context.principal !== null;
};
