// Represents a versioned/published custom section
// This is a snapshot of a CustomSection at the time it was published
// It contains the same data as CustomSection, but is mostly immutable
// It also contains pointers to the TemplateCustomization and CustomSection it
// was created from

// The only fields that can change are the pointers to the current/prior versions
// of the versionedSection it follows (was pinned to).

// When the priorPinnedVersionedSectionId is NULL, it indicates that this is the first
// version of this CustomSection

// When the function on the TemplateCustomization runs that determines what has
// changed when the base template is re-published, it automatically sets the
// priorPinnedVersionedSectionId to the currentPinnedVersionedSectionId, and then updates
// the currentPinnedVersionedSectionId to point to the new version of the base template section
