// Represents a versioned/published customization to a template question
// This is a snapshot of a QuestionCustomization at the time it was published
// It contains the same data as QuestionCustomization, but is mostly immutable
// It also contains a pointer to the TemplateCustomization

// The only fields that can change are the pointers to the current/prior versions
// of the versionedQuestion it is customizing.

// When the priorVersionedQuestionId is NULL, it indicates that this is the first
// version of this QuestionCustomization

// When the function on the QuestionCustomization runs that determines what has
// changed when the base template is re-published, it automatically sets the
// priorVersionedSQuestionId to the currentVersionedQuestionId, and then updates
// the currentVersionedQuestionId to point to the new version of the base template question
