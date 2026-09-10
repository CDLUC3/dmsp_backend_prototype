import { createHash } from 'crypto';
import {
  AcceptedWork, isDOI, parseDOI,
  RelatedWork,
  RelatedWorkSourceType,
  RelatedWorkStatus,
  RelationType,
  Work,
  WorkType,
  WorkVersion
} from "../models/RelatedWork.js";
import { MyContext } from "../context.js";
import { AddRelatedWorkManualInput } from "../types.js";
import { Plan } from "../models/Plan.js";
import { NotFoundError } from "../utils/graphQLErrors.js";

/**
 * Generate a unique hash for the work version or return the existing hash if it exists
 *
 * @param workVersion the work version
 * @returns a unique hash for the work version
 */
const getWorkVersionHash = (workVersion: WorkVersion): string => {
  if (!workVersion) return '';
  if (workVersion.hash) return workVersion.hash.toString();

  const workVersionDetails: string = JSON.stringify({
    workId: workVersion.workId,
    workType: workVersion.workType,
    sourceName: workVersion.sourceName,
    sourceUrl: workVersion.sourceUrl,
  });

  return createHash('md5').update(workVersionDetails).digest('hex');
}

/**
 * Adds a related work that was manually added by the user through the UI or was
 * added via the addEntirePlan/replaceEntirePlan mutations
 *
 * @param reference the string reference for logging
 * @param context the Apollo server context
 * @param plan the Plan
 * @param input the Related Work input
 * @returns the Accepted Work
 */
export const addAcceptedWork = async (
  reference: string,
  context: MyContext,
  plan: Plan,
  input: AddRelatedWorkManualInput
): Promise<AcceptedWork> => {
  if (!plan.id) {
    throw NotFoundError('Plan must have an id to add a related work');
  }

  const acceptedWork: AcceptedWork = new AcceptedWork({
    ...input,
    planId: plan.id,
    workId: 0,
    workVersionId: 0,
    relatedWorkId: 0,
    workType: WorkType[input.workType as keyof typeof WorkType],
    relationType: input.relationType
      ? RelationType[input.relationType as keyof typeof RelationType]
      : undefined,
    publicationDate: input.publicationDate ?? undefined,
    title: input.title ?? undefined,
    abstractText: input.abstractText ?? undefined,
    publicationVenue: input.publicationVenue ?? undefined,
  });
  const parsedDOI: string = isDOI(input.doi) ? (parseDOI(input.doi) ?? input.doi) : input.doi;

  // Fetch or create work
  let work: Work | null = await Work.findByDoi(reference, context, parsedDOI);
  if (!work) {
    work = new Work({ doi: input.doi });
    work = await work.create(context);
  }
  if (!work || !work.id || work.hasErrors()) {
    acceptedWork.addError('general', 'Unable to create or find work');
    return acceptedWork;
  }

  // Fetch or create work version
  const osHash: string = input.hash
    ? input.hash.toString()
    : getWorkVersionHash(new WorkVersion({
      ...input,
      workId: work.id,
      hash: Buffer.alloc(0),
      workType: WorkType[input.workType as keyof typeof WorkType],
      publicationDate: input.publicationDate ?? '',
      title: input.title ?? '',
      abstractText: input.abstractText ?? '',
      publicationVenue: input.publicationVenue ?? '',
    }));
  let workVersion: WorkVersion | null = await WorkVersion.findByDoiAndHash(
    reference,
    context,
    parsedDOI,
    Buffer.from(osHash, 'hex')
  );
  if (!workVersion) {
    workVersion = new WorkVersion({
      ...input,
      workId: work.id,
      hash: Buffer.from(osHash, 'hex'),
      workType: WorkType[input.workType as keyof typeof WorkType],
      publicationDate: input.publicationDate ?? '',
      title: input.title ?? '',
      abstractText: input.abstractText ?? '',
      publicationVenue: input.publicationVenue ?? '',
    });
    workVersion = await workVersion.create(context, work.doi);
  }
  if (!workVersion || !workVersion.id || workVersion.hasErrors()) {
    acceptedWork.addError('general', 'Unable to create or find a version of the work');
    return acceptedWork;
  }

  // Create related work
  if (!acceptedWork.hasErrors()) {
    let relatedWork: RelatedWork | null = new RelatedWork({
      planId: plan.id,
      workVersionId: workVersion.id,
      status: RelatedWorkStatus.ACCEPTED,
      score: 1.0,
      scoreMax: 1.0,
      sourceType: RelatedWorkSourceType.USER_ADDED,
      doiMatch: { found: true, score: 1.0, sources: [] },
      contentMatch: { abstractHighlights: [], score: 1.0 },
      authorMatches: [],
      institutionMatches: [],
      funderMatches: [],
      awardMatches: [],
    });
    relatedWork = await relatedWork.create(context);
    if (relatedWork && !relatedWork.hasErrors()) {
      const found = await AcceptedWork.findByPlanIdAndDoi(reference, context, plan.id, parsedDOI);
      if (found) return found;
      acceptedWork.addError('general', 'Unable to find related work after creation');
      return acceptedWork;
    }
    acceptedWork.addError('general', 'Unable to create related work');
  }

  return acceptedWork;
}

/**
 * Update the type of work or type of relation for the AcceptedWork
 *
 * @param reference the string reference for logging
 * @param context the Apollo server context
 * @param plan the Plan
 * @param input the related work
 * @returns the updated Accepted work
 */
export const UpdateAcceptedWork = async (
  reference: string,
  context: MyContext,
  plan: Plan,
  input: AddRelatedWorkManualInput
): Promise<AcceptedWork> => {
  if (!plan.id) {
    throw NotFoundError('Plan must have an id to updated accepted work');
  }

  const acceptedWork: AcceptedWork | null = await AcceptedWork.findByPlanIdAndDoi(
    reference,
    context,
    plan.id,
    input.doi
  );

  if (!acceptedWork || !acceptedWork.workVersionId) {
    throw NotFoundError('Unable to find related work');
  }

  if (acceptedWork.workType !== input.workType) {
    const workVersion: WorkVersion | null = await WorkVersion.findById(
      reference,
      context,
      acceptedWork.workVersionId
    );
    if (workVersion && workVersion.id) {
      const newWorkVersion = new WorkVersion({
        ...workVersion,
        workType: WorkType[input.workType as keyof typeof WorkType],
      });
      // Instead of updating, we create a new version of the work with the correct type
      const created: WorkVersion | null = await newWorkVersion.create(context, acceptedWork.doi);
      if (!created || created.hasErrors()) {
        acceptedWork.addError('workType', 'Unable to update work type for work');
      }

      acceptedWork.workVersionId = workVersion.id;

      // Now get the RelatedWork and if the relationship type changed, update it
      const relatedWork: RelatedWork | null = await RelatedWork.findByPlanAndWorkVersionId(
        reference,
        context,
        plan.id,
        workVersion.id
      );
      if (relatedWork && relatedWork.relationType !== input.relationType) {
        relatedWork.relationType = RelationType[input.relationType as keyof typeof RelationType];
        const updated: RelatedWork | null = await relatedWork.update(context);
        if (!updated || updated.hasErrors()) {
          acceptedWork.addError('workType', 'Unable to update relation type for work');
        }
      } else {
        acceptedWork.addError('workType', 'Unable to update related work');
      }

    } else {
      acceptedWork.addError('general', 'Unable to update version of work');
    }
  }

  return acceptedWork;
}

/**
 * Remove the Related work associated with the AcceptedWork
 *
 * @param reference the string reference for logging
 * @param context the Apollo server context
 * @param plan the Plan
 * @param doi the DOI
 * @returns the AcceptedWork that was deleted
 */
export const removeAcceptedWork = async (
  reference: string,
  context: MyContext,
  plan: Plan,
  doi: string
): Promise<AcceptedWork> => {
  if (!plan.id) {
    throw NotFoundError('Plan must have an id to remove related work');
  }

  const acceptedWork: AcceptedWork | null = await AcceptedWork.findByPlanIdAndDoi(
    reference,
    context,
    plan.id,
    doi
  );
  if (!acceptedWork || !acceptedWork.workVersionId) {
    throw NotFoundError('Unable to find related work');
  }

  const relatedWork: RelatedWork | null = await RelatedWork.findById(
    reference,
    context,
    acceptedWork.relatedWorkId
  );
  if (!relatedWork) {
    throw NotFoundError('Unable to find relevant version of related work');
  }

  const deleted: RelatedWork | null = await relatedWork.delete(context);
  if (!deleted || deleted.hasErrors()) {
    acceptedWork.addError('general', 'Unable to delete related work');
  }

  return acceptedWork;
}
