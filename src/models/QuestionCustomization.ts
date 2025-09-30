// This object represents custom requirements, guidance and sample text an organization
// wants to add to an existing published template question
//
// It contains:
//   - a pointer to the parent TemplateCustomization
//   - a pointer to the base (not versioned) template question that it is "customizing"
//   - a migrationStatus indicating whether or not the question that it is "customizing"
//     has been re-published. The values are: OK (default), STALE (something changed),
//     ORPHANED (the base template section is no longer available)
//
// When an org admin decides to customize a question of a published template, this record
// is created. The resolver determines the base questionId and creates this object
// using that id.
//
// Status defintions:
//   OK - the base question that it customizes has not changed
//   STALE - the base question that it customizes has changed
//   ORPHANED - the base question that it customizes is no longer available
//
// When the base template that it tracks has changed, a function is executed
// that does the following:
//   1. Determine if the base question it is customizing still exists.
//       a. If not, set the migrationStatus to `ORPHANED`
//       b. If so, determine if anything in the question it is "customizing" actually
//          changed. If so, change the migrationStatus to `STALE`
