import { MyContext } from "../context";
import { CollaboratorSearchResult } from "../types";
import {
  formatORCID,
  isNullOrUndefined,
  stripIdentifierBaseURL
} from "../utils/helpers";
import { User } from "../models/User";
import { Affiliation } from "../models/Affiliation";
import { ProjectMember } from "../models/Member";
import { OrcidAPI, OrcidPerson } from "../datasources/orcid";
import {Project} from "../models/Project";
import {ProjectCollaborator} from "../models/Collaborator";

// Find a person by their ORCID
export const findCollaboratorByOrcid = async (
  reference: string,
  context: MyContext,
  orcid: string
): Promise<CollaboratorSearchResult> => {
  // Get the fully formatted ORCID
  const fullOrcid = formatORCID(orcid);
  // Get the ORCID without the base URL
  const orcidId = stripIdentifierBaseURL(orcid);

  if (!isNullOrUndefined(fullOrcid) && !isNullOrUndefined(orcid)) {
    // First try to find the user in the User table
    const user: User = await User.findByOrcid(reference, context, fullOrcid);
    if (!isNullOrUndefined(user)) {
      // We found the person in our users table, so just return the info we have
      const affiliation = await Affiliation.findByURI(
        reference,
        context,
        user.affiliationId
      );

      return {
        givenName: user.givenName,
        surName: user.surName,
        orcid: user.orcid || '',
        email: await user.getEmail(context),
        affiliationName: affiliation?.name,
        affiliationRORId: affiliation?.uri,
        affiliationURL: affiliation?.homepage,
      };

    } else {
      // Try to find a member in the Member table
      const member: ProjectMember = await ProjectMember.findByOrcid(reference, context, fullOrcid);
      if (!isNullOrUndefined(member)) {
        // We found the person in our members table, so just return the info we have
        const affiliation = await Affiliation.findByURI(
          reference,
          context,
          member.affiliationId
        );

        return {
          givenName: member.givenName,
          surName: member.surName,
          orcid: member.orcid || '',
          email: member.email || null,
          affiliationName: affiliation?.name,
          affiliationRORId: affiliation?.uri,
          affiliationURL: affiliation?.homepage,
        };

      } else {
        // Finally, call the ORCID API to get the person's details
        const orcidAPI: OrcidAPI = await new OrcidAPI({cache: context.cache});
        const orcidData: OrcidPerson = await orcidAPI.getPerson(context, orcidId, reference);

        if (isNullOrUndefined(orcidData)) {
          return null;
        }

        // Return the results provided by the ORCID API
        return {
          givenName: orcidData.givenName,
          surName: orcidData.surName,
          orcid: orcidData.orcid,
          email: orcidData.email,
          affiliationName: orcidData.employment?.name,
          affiliationRORId: orcidData.employment?.rorId,
          affiliationURL: orcidData.employment?.url,
        };
      }
    }
  }
  return null;
}

// Find collaborators by a search term (in their name or email) within the projects associated
// with the current user's affiliation
export const findCollaboratorByAffiliationAndTerm = async (
  reference: string,
  context: MyContext,
  term: string
): Promise<CollaboratorSearchResult[]> => {
  // Gather all the projects associated with the current user's affiliation
  const projects: Project[] = await Project.findByAffiliation(
    reference,
    context,
    context.token?.affiliationId
  );

  if (Array.isArray(projects) && projects.length > 0) {
    // Fetch all the collaborators for these projects
    const placeholder = projects.map(() => '?').join(',');
    const sql = `
      SELECT DISTINCT u.givenName,
                      u.surName,
                      ue.email,
                      u.orcid,
                      a.name     affiliationName,
                      a.uri      affiliationRORId,
                      a.homepage affiliationURL
      FROM projects p
             INNER JOIN projectCollaborators pc ON p.id = pc.projectId
             INNER JOIN users u ON pc.userId = u.id AND u.active = 1
             INNER JOIN userEmails ue on ue.userId = u.id AND ue.isPrimary = 1
             LEFT OUTER JOIN affiliations a ON u.affiliationId = a.uri
      WHERE p.id IN (${placeholder});
    `;
    const collaborators = await ProjectCollaborator.query(
      context,
      sql,
      projects.map(p => p.id.toString()),
      reference
    );

    if (Array.isArray(collaborators) && collaborators.length > 0) {
      // Now filter the collaborators based on the search term
      const matchedCollaborators = collaborators.filter(c => {
        return c.id !== null // Skip open invitations
          // Match email givenName or surName
          && (c.email.toLowerCase().includes(term.toLowerCase())
            || c.givenName.toLowerCase().includes(term.toLowerCase())
            || c.surName.toLowerCase().includes(term.toLowerCase()));
      });

      // Combine the results with the matchedCollaborators removing duplicates and current user
      return matchedCollaborators.filter(c => c.email !== context.token?.email);
    }
    return [];
  }
}
