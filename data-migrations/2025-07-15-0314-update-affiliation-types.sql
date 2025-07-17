# The CamelCase affiliation types are breaking the enum on the Affiliation mode
# so set them all to upper case
UPDATE affiliations SET types = UPPER(types);
