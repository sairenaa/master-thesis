-- This script was generated by the ERD tool in pgAdmin 4.
-- Please log an issue at https://github.com/pgadmin-org/pgadmin4/issues/new/choose if you find any bugs, including reproduction steps.
BEGIN;


CREATE TABLE IF NOT EXISTS public.elf
(
    id serial NOT NULL,
    elf text NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.softwarecomponent
(
    id serial NOT NULL,
    elf integer NOT NULL,
    name text NOT NULL,
    size integer NOT NULL,
    date timestamp without time zone NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.softwarecomponent
    ADD CONSTRAINT elf_id_fk FOREIGN KEY (elf)
    REFERENCES public.elf (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;