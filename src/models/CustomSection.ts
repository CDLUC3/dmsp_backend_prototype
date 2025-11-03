// This object represents a custom section that an organization wants to include
// as part of an existing published template

// It contains:
//   - a pointer to the parent TemplateCustomization
//   - a pointer to the base (not versioned) template section that it "follows" (appears after)
//   - a migrationStatus indicating whether or not the section that it "follows"
//     has been re-published. The values are: OK (default), STALE (something changed),
//     ORPHANED (the base template section is no longer available)

// When an org admin decides to add a custom section to a template, this record is created
// The user "pins" this object to a section of the published template in the UI, and the resolver
// determines the base sectionId and creates this object using that id.

// Status defintions:
//   OK - the base section that it follows has not changed
//   STALE - the base section that it follows has changed
//   ORPHANED - the base section that it follows is no longer available

// When the base template that it tracks has changed, a function is executed
// that does the following:
//   1. Determine if the base section it was pinned to still exists.
//       a. If not, set the migrationStatus to `ORPHANED`
//       b. If so, determine if anything in the section it is "following" actually
//          changed. If so, change the migrationStatus to `STALE`
