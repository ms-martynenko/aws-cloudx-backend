#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductsServiceStack } from "../lib/products-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";
import { AuthorizationServiceStack } from "../lib/authorization-service-stack";

const app = new cdk.App();

const authorizationServiceStack = new AuthorizationServiceStack(app, "AuthorizationServiceStack");
const productsServiceStack = new ProductsServiceStack(app, "ProductsServiceStack");

new ImportServiceStack(app, "ImportServiceStack", {
  catalogItemsQueue: productsServiceStack.productsService.catalogItemsQueue,
  authorizerFunction: authorizationServiceStack.authorizationService.basicAuthorizerFunction,
});
