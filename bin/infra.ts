#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ProductsServiceStack } from "../lib/products-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";

const app = new cdk.App();
new ProductsServiceStack(app, "ProductsServiceStack");
new ImportServiceStack(app, "ImportServiceStack");
