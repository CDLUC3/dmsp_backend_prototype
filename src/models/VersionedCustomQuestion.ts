// Represents a versioned/published custom question
// This is a snapshot of a CustomQuestion at the time it was published
// It contains the same data as CustomQuestion, but is mostly immutable
// It also contains pointers to the TemplateCustomization and CustomQuestion it
// was created from and the CustomSection it belongs to if applicable

// The only fields that can change are the pointers to the current/prior versions
// of the versionedQuestion it follows (was pinned to) if applicable.

// When the priorPinnedVersionedQuestionId is NULL, it indicates that this is the first
// version of this CustomQuestion

// When the currentPinnedVersionedQuestionId is NULL, it indicates that this question
// is not pinned to any base template question (it is part of a CustomSection)

// When the function on the TemplateCustomization (assuming its not part of a CustomSection)
// runs that determines what has changed when the base template is re-published, it
// automatically sets the priorPinnedVersionedQuestionId to the currentPinnedVersionedQuestionId,
// and then updates the currentPinnedVersionedQuestionId to point to the new version of
// the base template question
