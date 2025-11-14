import {
  aws_apigateway,
  aws_lambda,
  aws_s3,
  aws_s3_notifications,
  aws_sqs,
  Duration,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  FRONTEND_URL,
  LAMBDA_BASIC_AUTHORIZER,
  PARSED_FOLDER,
  UPLOADED_FOLDER,
} from "../../constants";
import path from "node:path";
import { HttpMethods } from "aws-cdk-lib/aws-s3";

export interface ImportServiceProps {
  catalogItemsQueue: aws_sqs.Queue;
  authorizerFunction: aws_lambda.Function;
}

export class ImportService extends Construct {
  constructor(scope: Construct, id: string, props: ImportServiceProps) {
    super(scope, id);

    const s3Bucket = new aws_s3.Bucket(this, "ImportBucket", {
      bucketName: "import-bucket-aws-cloudx",
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedOrigins: [FRONTEND_URL],
          allowedMethods: [HttpMethods.PUT],
          allowedHeaders: ["*"],
        },
      ],
    });

    const lambdaImportProductsFile = new aws_lambda.Function(this, "importProductsFile", {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: Duration.seconds(5),
      handler: "index.main",
      code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/importProductsFile")),
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
        UPLOADED_PREFIX: UPLOADED_FOLDER,
      },
    });

    const lambdaImportFileParser = new aws_lambda.Function(this, "importFileParser", {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: Duration.seconds(5),
      handler: "index.main",
      code: aws_lambda.Code.fromAsset(path.join(__dirname, "../../dist/importFileParser")),
      environment: {
        UPLOADED_PREFIX: UPLOADED_FOLDER,
        PARSED_PREFIX: PARSED_FOLDER,
        SQS_QUEUE_URL: props.catalogItemsQueue.queueUrl,
      },
    });

    s3Bucket.grantPut(lambdaImportProductsFile);
    s3Bucket.grantReadWrite(lambdaImportFileParser);
    props.catalogItemsQueue.grantSendMessages(lambdaImportFileParser);

    s3Bucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(lambdaImportFileParser),
      { prefix: UPLOADED_FOLDER }
    );

    const api = new aws_apigateway.RestApi(this, "ImportAPI", {
      restApiName: "Import API",
      description: "APIs for import",
      defaultCorsPreflightOptions: {
        allowOrigins: [FRONTEND_URL],
        allowMethods: ["GET", "POST", "OPTIONS"],
        allowHeaders: ["Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"],
      },
    });

    const authHandler = aws_lambda.Function.fromFunctionAttributes(this, LAMBDA_BASIC_AUTHORIZER, {
      functionArn: props.authorizerFunction.functionArn,
      sameEnvironment: true,
    });

    const authorizer = new aws_apigateway.TokenAuthorizer(this, "ImportAuthorizer", {
      handler: authHandler,
      identitySource: "method.request.header.Authorization",
    });

    const productsResource = api.root.addResource("import");
    const productsLambdaIntegration = new aws_apigateway.LambdaIntegration(
      lambdaImportProductsFile
    );
    productsResource.addMethod("GET", productsLambdaIntegration, {
      authorizer: authorizer,
    });
  }
}
