import { UserInfo } from "./data-models/UserInfo.js";
import { CognitoJwtVerifier } from "aws-jwt-verify";

// Verifier that expects valid access tokens:
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID || '',
  tokenUse: "access",
  clientId: process.env.USER_POOL_CLIENT_ID || '',
});

// Extract the UserInfo from the token
function extractUserInfoFromToken(token: string): UserInfo | null {
  try {
    // Decode the token
    const tokenParts = token.split('.');
    const encodedPayload = tokenParts[1];
    const decodedPayload = atob(encodedPayload);
    const payload = JSON.parse(decodedPayload);

    // Extract user information from the decoded payload
    const { id, email, name, given_name, family_name, orcid, org_id, department_id } = payload;

    // Return the extracted user info
    return { id, email, name, given_name, family_name, orcid, org_id, department_id };
  } catch (error) {
    console.error('Error extracting user info from token:', error);
    return null;
  }
}

// Send the token to Cognito for verification and then extract the UserInfo if successful
export default async function verifyToken(token: string): Promise<UserInfo | null> {
  try {
    const payload = await verifier.verify(token);
    return extractUserInfoFromToken(token);
  } catch {
    return null
  }
}
