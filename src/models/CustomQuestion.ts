// This object represents a custom question that an organization wants to include
// as part of an existing published template section or as part of one of their
// own custom sections

// It contains:
//   - a pointer to the parent TemplateCustomization
//   - a pointer to the parent SectionCustomization (if it is part of a custom section) or NULL
//   - a pointer to the base (not versioned) template question that it "follows" (appears after)
//   - a migrationStatus indicating whether or not the question that it "follows"
//     has been re-published. The values are: OK (default), STALE (something changed),
//     ORPHANED (the base template question is no longer available)

// When an org admin decides to add a custom question to a template, this record is created
// The user either "pins" this object to a question of the published template in the UI, and the resolver
// determines the base questionId and creates this object using that id.
// OR
// The user includes it as part of a CustomSection and includes a `displayOrder`

// Status defintions (when "following" a base question):
//   OK - the base question that it follows has not changed
//   STALE - the base question that it follows has changed
//   ORPHANED - the base question that it follows is no longer available

// The `migrationStatus` only applies when the question is "following" a base question.

// When the base template that it tracks has changed, a function is executed
// that does the following:
//   1. Determine if the base question it was pinned to still exists.
//       a. If not, set the migrationStatus to `ORPHANED`
//       b. If so, determine if anything in the question it is "following" actually
//          changed. If so, change the migrationStatus to `STALE`
