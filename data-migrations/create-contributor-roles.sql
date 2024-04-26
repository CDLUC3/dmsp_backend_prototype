
CREATE TABLE contributor_roles (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    label       varchar UNIQUE NOT NULL,
    url         varchar UNIQUE NOT NULL,
    description text,
    created     timestamp DEFAULT current_timestamp NOT NULL,
    modified    timestamp DEFAULT current_timestamp NOT NULL,
);
