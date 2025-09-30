// This object represents custom requirements and guidance and organization wants to
// add to an existing published template section
//
// It contains:
//   - a pointer to the parent TemplateCustomization
//   - a pointer to the base (not versioned) template section that it is "customizing"
//   - a migrationStatus indicating whether or not the section that it is "customizing"
//     has been re-published. The values are: OK (default), STALE (something changed),
//     ORPHANED (the base template section is no longer available)
//
// When an org admin decides to customize a section of a published template, this record
// is created. The resolver determines the base sectionId and creates this object
// using that id.
//
// Status defintions:
//   OK - the base section that it customizes has not changed
//   STALE - the base section that it customizes has changed
//   ORPHANED - the base section that it customizes is no longer available
//
// When the base template that it tracks has changed, a function is executed
// that does the following:
//   1. Determine if the base section it is customizing still exists.
//       a. If not, set the migrationStatus to `ORPHANED`
//       b. If so, determine if anything in the section it is "customizing" actually
//          changed. If so, change the migrationStatus to `STALE`
