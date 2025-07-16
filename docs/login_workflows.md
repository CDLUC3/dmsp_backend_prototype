How do the login workflows work?

## Signup workflow

1. User navigates to the `Register` page
2. User fills in their email address and clicks `Continue`.
3. If the email address is already registered, they are redirected to the login page with a message indicating that the email is already in use.
4. If the email domain name is one of domains in the affiliations table for single
   sign-on then they receive a message that shows that their domain is eligible
   for single sign-on and lists benefits of using single sign-on, but gives them two choices:
  - Sign up with single sign-on
  - Sign up without 
