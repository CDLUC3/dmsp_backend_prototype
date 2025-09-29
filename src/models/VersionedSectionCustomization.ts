// Represents a versioned/published customization to a template section
// This is a snapshot of a SectionCustomization at the time it was published
// It contains the same data as SectionCustomization, but is mostly immutable
// It also contains a pointer to the TemplateCustomization

// The only fields that can change are the pointers to the current/prior versions
// of the versionedSection it is customizing.

// When the priorVersionedSectionId is NULL, it indicates that this is the first
// version of this SectionCustomization

// When the function on the SectionCustomization runs that determines what has
// changed when the base template is re-published, it automatically sets the
// priorVersionedSectionId to the currentVersionedSectionId, and then updates
// the currentVersionedSectionId to point to the new version of the base template section
