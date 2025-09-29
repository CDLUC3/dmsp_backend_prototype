// This is the top level of an organization's customization
// It contains:
//   - a pointer to the base (not versioned) template
//   - a status of its publication: DRAFT (default), PUBLISHED, ARCHIVED
//   - a migrationStatus indicating whether or not the template that it "tracks"
//     has been re-published. The values are: OK (default), STALE (something changed),
//     ORPHANED (the base template is no longer available)

// When an org admin decides to customization a funder template, this record is created
// The user selects a published version of a template in the UI, and the resolver
// determines the base templateId and creates this object using that id.

// Status defintions:
//   DRAFT - the org is still working on it, not available to users
//   PUBLISHED - the org has published it and it is available to users
//   ARCHIVED - the org has archived it, it is no longer available to users

// When the base template that it tracks has changed, a function is executed
// that does the following:
//   1. Determine if the base template still has a published version.
//       a. If not, set the migrationStatus to `ORPHANED`
//       b. If so, go through each associated CustomSection, CustomQuestion,
//          SectionCustomization and QuestionCustomization to determine if anything
//          has changed. If so, change the migrationStatus to `STALE`

// The function described above executes a similar function in each associated
// object (e.g. CustomSection) which updates their own migrationStatus if necessary
// and updates their pointers to the current/prior versions they are associated with
