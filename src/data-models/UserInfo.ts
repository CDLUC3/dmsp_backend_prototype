
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  orcid: string;
  org_id: string;
  department_id: string;
}

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
