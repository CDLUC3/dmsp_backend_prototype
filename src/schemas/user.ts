import gql from "graphql-tag";

export const typeDefs = gql`
  extend type Query {
    "Returns the currently logged in user's information"
    me: User
    "Returns all of the users associated with the current user's affiliation (Admin only)"
    users: [User]
    "Returns the specified user (Admin only)"
    user(userId: Int!): User
  }

  extend type Mutation {
    "Update the current user's information"
    updateUserProfile(input: updateUserProfileInput!): User
    "Update the current user's email notifications"
    updateUserNotifications(input: updateUserNotificationsInput!): User
    "Set the user's ORCID"
    setUserOrcid(orcid: String!): User
    "Anonymize the current user's account (essentially deletes their account without orphaning things)"
    removeUser: User

    "Add an email address for the current user"
    addUserEmail(email: String!, isPrimary: Boolean!): UserEmail
    "Remove an email address from the current user"
    removeUserEmail(email: String!): UserEmail
    "Designate the email as the current user's primary email address"
    setPrimaryUserEmail(email: String!): [UserEmail]

    "Change the current user's password"
    updatePassword(oldPassword: String!, newPassword: String!): User

    "Deactivate the specified user Account (Admin only)"
    deactivateUser(userId: Int!): User
    "Reactivate the specified user Account (Admin only)"
    activateUser(userId: Int!): User
    "Merge the 2 user accounts (Admin only)"
    mergeUsers(userIdToBeMerged: Int!, userIdToKeep: Int!): User
  }

  "The types of roles supported by the DMPTool"
  enum UserRole {
    RESEARCHER
    ADMIN
    SUPERADMIN
  }

  "The types of object a User can be invited to Collaborate on"
  enum InvitedToType {
    PLAN
    TEMPLATE
  }

  "A user of the DMPTool"
  type User {
    "The unique identifer for the Object"
    id: Int
    "The user who created the Object"
    createdById: Int
    "The timestamp when the Object was created"
    created: String
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modifed"
    modified: String
    "Errors associated with the Object"
    errors: [String!]

    "The user's first/given name"
    givenName: String
    "The user's last/family name"
    surName: String
    "The user's primary email address"
    email: EmailAddress!
    "The user's role within the DMPTool"
    role: UserRole!
    "The user's organizational affiliation"
    affiliation: Affiliation
    "Whether the user has accepted the terms and conditions of having an account"
    acceptedTerms: Boolean
    "The user's ORCID"
    orcid: Orcid
    "The user's SSO ID"
    ssoId: String
    "The user's preferred language"
    languageId: String!

    "Whether or not email notifications are on for when a Plan has a new comment"
    notify_on_comment_added: Boolean
    "Whether or not email notifications are on for when a Template is shared with the User (Admin only)"
    notify_on_template_shared: Boolean
    "Whether or not email notifications are on for when feedback on a Plan is completed"
    notify_on_feedback_complete: Boolean
    "Whether or not email notifications are on for when a Plan is shared with the user"
    notify_on_plan_shared: Boolean
    "Whether or not email notifications are on for Plan visibility changes"
    notify_on_plan_visibility_change: Boolean

    "Whether or not the account is locked from failed login attempts"
    locked: Boolean
    "Whether or not account is active"
    active: Boolean

    "The timestamp of the last login"
    last_sign_in: String
    "The method user for the last login: PASSWORD or SSO"
    last_sign_in_via: String
    "The number of failed login attempts"
    failed_sign_in_attemps: Int

    "The user's email addresses"
    emails: [UserEmail]
  }

  type UserEmail {
    "The unique identifer for the Object"
    id: Int
    "The user who created the Object"
    createdById: Int
    "The timestamp when the Object was created"
    created: String
    "The user who last modified the Object"
    modifiedById: Int
    "The timestamp when the Object was last modifed"
    modified: String
    "Errors associated with the Object"
    errors: [String!]

    "The user the email belongs to"
    userId: Int!
    "The email address"
    email: String!
    "Whether or not the email address has been confirmed"
    confirmed: Boolean!
    "Whether or not this is the primary email address"
    primary: Boolean!
  }

  input updateUserProfileInput {
    "The user's first/given name"
    givenName: String!
    "The user's last/family name"
    surName: String!
    "The user's organizational affiliation id"
    affiliationId: String!
    "The user's preferred language"
    languageId: String
  }

  input updateUserNotificationsInput {
    "Whether or not email notifications are on for when a Plan has a new comment"
    notify_on_comment_added: Boolean!
    "Whether or not email notifications are on for when a Template is shared with the User (Admin only)"
    notify_on_template_shared: Boolean!
    "Whether or not email notifications are on for when feedback on a Plan is completed"
    notify_on_feedback_complete: Boolean!
    "Whether or not email notifications are on for when a Plan is shared with the user"
    notify_on_plan_shared: Boolean!
    "Whether or not email notifications are on for Plan visibility changes"
    notify_on_plan_visibility_change: Boolean!
  }
`;