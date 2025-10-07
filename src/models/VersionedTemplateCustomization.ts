// Represents a versioned/published template customization
// This is a snapshot of a TemplateCustomization at the time it was published
// It contains the same data as TemplateCustomization, but is mostly immutable
// It also contains a pointer to the TemplateCustomization it was created from

// The only fields that can change are the pointers to the current/prior versions
// of the versionedTemplate it follows.

// When the priorVersionedTemplateId is NULL, it indicates that this is the first
// version of this TemplateCustomization

// When the function on the TemplateCustomization runs that determines what has
// changed when the base template is re-published, it automatically sets the
// priorVersionedTemplateId to the currentVersionedTemplateId, and then updates
// the currentVersionedTemplateId to point to the new version of the base template
