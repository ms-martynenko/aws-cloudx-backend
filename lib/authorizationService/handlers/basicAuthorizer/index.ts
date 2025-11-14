import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from "aws-lambda";

export const main: APIGatewayTokenAuthorizerHandler = async (event, context) => {
  console.log("Event: ", event);
  console.log("Context: ", context);

  const authorizationToken = event.authorizationToken;

  if (!authorizationToken) {
    console.log("No authorization token is provided");

    throw new Error("Unauthorized"); // 401
  }

  try {
    // Extract and decode the base64 encoded credentials
    const base64Credentials = authorizationToken.replace("Basic ", "");
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [username, password] = credentials.split(":");

    if (!username || !password) {
      console.log("Invalid credentials format");

      throw new Error("Unauthorized"); // 401
    }

    console.log(`Attempting to authorize user: ${username}`);

    const expectedPassword = process.env[username];

    if (!expectedPassword) {
      console.log("User not found in environment variables");

      return generatePolicy(username, "Deny", event.methodArn);
    }

    if (password !== expectedPassword) {
      console.log(`Invalid password for the user ${username}`);

      return generatePolicy(username, "Deny", event.methodArn);
    }

    console.log(`Authorization successful for the user: ${username}`);

    return generatePolicy(username, "Allow", event.methodArn);
  } catch (error) {
    console.error("Authorization failed:", error);

    throw error;
  }
};

// Helper function to generate IAM policy
function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
): APIGatewayAuthorizerResult {
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
