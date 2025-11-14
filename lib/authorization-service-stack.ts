import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AuthorizationService } from "./authorizationService/authorization-service";

export class AuthorizationServiceStack extends Stack {
  public readonly authorizationService: AuthorizationService;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.authorizationService = new AuthorizationService(this, "AuthorizationService");
  }
}
