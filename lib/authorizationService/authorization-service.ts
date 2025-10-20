import { aws_lambda, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { join } from "node:path";
import { LAMBDA_BASIC_AUTHORIZER } from "../../constants";

export class AuthorizationService extends Construct {
  public readonly basicAuthorizerFunction: aws_lambda.Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.basicAuthorizerFunction = new aws_lambda.Function(this, LAMBDA_BASIC_AUTHORIZER, {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 128,
      timeout: Duration.seconds(10),
      handler: "index.main",
      code: aws_lambda.Code.fromAsset(join(__dirname, "../../dist/basicAuthorizer")),
      environment: {
        GITHUB_USERNAME: process.env.GITHUB_USERNAME ?? "",
      },
    });
  }
}
