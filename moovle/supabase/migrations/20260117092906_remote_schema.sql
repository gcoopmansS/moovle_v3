drop extension if exists "pg_net";


  create table "public"."activities" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "creator_id" uuid not null,
    "sport" text not null,
    "title" text not null,
    "description" text,
    "date_time" timestamp with time zone not null,
    "duration" integer,
    "location" text,
    "location_details" text,
    "max_participants" integer default 10,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "visibility" text default 'public'::text,
    "distance" integer,
    "location_lat" double precision,
    "location_lng" double precision
      );


alter table "public"."activities" enable row level security;


  create table "public"."activity_invites" (
    "id" uuid not null default gen_random_uuid(),
    "activity_id" uuid not null,
    "inviter_id" uuid not null,
    "invitee_id" uuid not null,
    "status" text not null default 'pending'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."activity_invites" enable row level security;


  create table "public"."activity_participants" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "activity_id" uuid not null,
    "user_id" uuid not null,
    "status" text default 'joined'::text,
    "joined_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."activity_participants" enable row level security;


  create table "public"."mates" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "requester_id" uuid not null,
    "receiver_id" uuid not null,
    "status" text default 'pending'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone
      );


alter table "public"."mates" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "user_id" uuid not null,
    "type" text not null,
    "title" text not null,
    "message" text,
    "related_user_id" uuid,
    "related_activity_id" uuid,
    "is_read" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."notifications" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "email" text,
    "full_name" text,
    "avatar_url" text,
    "city" text,
    "bio" text,
    "favorite_sports" text[],
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "city_lat" double precision,
    "city_lng" double precision,
    "country" text
      );


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX activities_pkey ON public.activities USING btree (id);

CREATE UNIQUE INDEX activity_invites_activity_id_invitee_id_key ON public.activity_invites USING btree (activity_id, invitee_id);

CREATE UNIQUE INDEX activity_invites_pkey ON public.activity_invites USING btree (id);

CREATE UNIQUE INDEX activity_participants_activity_id_user_id_key ON public.activity_participants USING btree (activity_id, user_id);

CREATE UNIQUE INDEX activity_participants_pkey ON public.activity_participants USING btree (id);

CREATE INDEX idx_activities_location ON public.activities USING btree (location_lat, location_lng) WHERE ((location_lat IS NOT NULL) AND (location_lng IS NOT NULL));

CREATE INDEX idx_activity_invites_activity_id ON public.activity_invites USING btree (activity_id);

CREATE INDEX idx_activity_invites_invitee_id ON public.activity_invites USING btree (invitee_id);

CREATE INDEX idx_activity_invites_inviter_id ON public.activity_invites USING btree (inviter_id);

CREATE INDEX idx_activity_invites_status ON public.activity_invites USING btree (status);

CREATE UNIQUE INDEX mates_pkey ON public.mates USING btree (id);

CREATE UNIQUE INDEX mates_requester_id_receiver_id_key ON public.mates USING btree (requester_id, receiver_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

alter table "public"."activities" add constraint "activities_pkey" PRIMARY KEY using index "activities_pkey";

alter table "public"."activity_invites" add constraint "activity_invites_pkey" PRIMARY KEY using index "activity_invites_pkey";

alter table "public"."activity_participants" add constraint "activity_participants_pkey" PRIMARY KEY using index "activity_participants_pkey";

alter table "public"."mates" add constraint "mates_pkey" PRIMARY KEY using index "mates_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."activities" add constraint "activities_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."activities" validate constraint "activities_creator_id_fkey";

alter table "public"."activities" add constraint "activities_visibility_check" CHECK ((visibility = ANY (ARRAY['invite_only'::text, 'mates'::text, 'public'::text]))) not valid;

alter table "public"."activities" validate constraint "activities_visibility_check";

alter table "public"."activity_invites" add constraint "activity_invites_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE not valid;

alter table "public"."activity_invites" validate constraint "activity_invites_activity_id_fkey";

alter table "public"."activity_invites" add constraint "activity_invites_activity_id_invitee_id_key" UNIQUE using index "activity_invites_activity_id_invitee_id_key";

alter table "public"."activity_invites" add constraint "activity_invites_invitee_id_fkey" FOREIGN KEY (invitee_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."activity_invites" validate constraint "activity_invites_invitee_id_fkey";

alter table "public"."activity_invites" add constraint "activity_invites_inviter_id_fkey" FOREIGN KEY (inviter_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."activity_invites" validate constraint "activity_invites_inviter_id_fkey";

alter table "public"."activity_invites" add constraint "activity_invites_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text]))) not valid;

alter table "public"."activity_invites" validate constraint "activity_invites_status_check";

alter table "public"."activity_participants" add constraint "activity_participants_activity_id_fkey" FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE not valid;

alter table "public"."activity_participants" validate constraint "activity_participants_activity_id_fkey";

alter table "public"."activity_participants" add constraint "activity_participants_activity_id_user_id_key" UNIQUE using index "activity_participants_activity_id_user_id_key";

alter table "public"."activity_participants" add constraint "activity_participants_status_check" CHECK ((status = ANY (ARRAY['joined'::text, 'pending'::text, 'declined'::text]))) not valid;

alter table "public"."activity_participants" validate constraint "activity_participants_status_check";

alter table "public"."activity_participants" add constraint "activity_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."activity_participants" validate constraint "activity_participants_user_id_fkey";

alter table "public"."mates" add constraint "mates_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mates" validate constraint "mates_receiver_id_fkey";

alter table "public"."mates" add constraint "mates_requester_id_fkey" FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."mates" validate constraint "mates_requester_id_fkey";

alter table "public"."mates" add constraint "mates_requester_id_receiver_id_key" UNIQUE using index "mates_requester_id_receiver_id_key";

alter table "public"."mates" add constraint "mates_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text]))) not valid;

alter table "public"."mates" validate constraint "mates_status_check";

alter table "public"."notifications" add constraint "notifications_related_activity_id_fkey" FOREIGN KEY (related_activity_id) REFERENCES public.activities(id) not valid;

alter table "public"."notifications" validate constraint "notifications_related_activity_id_fkey";

alter table "public"."notifications" add constraint "notifications_related_user_id_fkey" FOREIGN KEY (related_user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."notifications" validate constraint "notifications_related_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK ((type = ANY (ARRAY['mate_request'::text, 'mate_accepted'::text, 'activity_invite'::text, 'activity_joined'::text, 'activity_left'::text, 'activity_reminder'::text]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$function$
;

grant delete on table "public"."activities" to "anon";

grant insert on table "public"."activities" to "anon";

grant references on table "public"."activities" to "anon";

grant select on table "public"."activities" to "anon";

grant trigger on table "public"."activities" to "anon";

grant truncate on table "public"."activities" to "anon";

grant update on table "public"."activities" to "anon";

grant delete on table "public"."activities" to "authenticated";

grant insert on table "public"."activities" to "authenticated";

grant references on table "public"."activities" to "authenticated";

grant select on table "public"."activities" to "authenticated";

grant trigger on table "public"."activities" to "authenticated";

grant truncate on table "public"."activities" to "authenticated";

grant update on table "public"."activities" to "authenticated";

grant delete on table "public"."activities" to "service_role";

grant insert on table "public"."activities" to "service_role";

grant references on table "public"."activities" to "service_role";

grant select on table "public"."activities" to "service_role";

grant trigger on table "public"."activities" to "service_role";

grant truncate on table "public"."activities" to "service_role";

grant update on table "public"."activities" to "service_role";

grant delete on table "public"."activity_invites" to "anon";

grant insert on table "public"."activity_invites" to "anon";

grant references on table "public"."activity_invites" to "anon";

grant select on table "public"."activity_invites" to "anon";

grant trigger on table "public"."activity_invites" to "anon";

grant truncate on table "public"."activity_invites" to "anon";

grant update on table "public"."activity_invites" to "anon";

grant delete on table "public"."activity_invites" to "authenticated";

grant insert on table "public"."activity_invites" to "authenticated";

grant references on table "public"."activity_invites" to "authenticated";

grant select on table "public"."activity_invites" to "authenticated";

grant trigger on table "public"."activity_invites" to "authenticated";

grant truncate on table "public"."activity_invites" to "authenticated";

grant update on table "public"."activity_invites" to "authenticated";

grant delete on table "public"."activity_invites" to "service_role";

grant insert on table "public"."activity_invites" to "service_role";

grant references on table "public"."activity_invites" to "service_role";

grant select on table "public"."activity_invites" to "service_role";

grant trigger on table "public"."activity_invites" to "service_role";

grant truncate on table "public"."activity_invites" to "service_role";

grant update on table "public"."activity_invites" to "service_role";

grant delete on table "public"."activity_participants" to "anon";

grant insert on table "public"."activity_participants" to "anon";

grant references on table "public"."activity_participants" to "anon";

grant select on table "public"."activity_participants" to "anon";

grant trigger on table "public"."activity_participants" to "anon";

grant truncate on table "public"."activity_participants" to "anon";

grant update on table "public"."activity_participants" to "anon";

grant delete on table "public"."activity_participants" to "authenticated";

grant insert on table "public"."activity_participants" to "authenticated";

grant references on table "public"."activity_participants" to "authenticated";

grant select on table "public"."activity_participants" to "authenticated";

grant trigger on table "public"."activity_participants" to "authenticated";

grant truncate on table "public"."activity_participants" to "authenticated";

grant update on table "public"."activity_participants" to "authenticated";

grant delete on table "public"."activity_participants" to "service_role";

grant insert on table "public"."activity_participants" to "service_role";

grant references on table "public"."activity_participants" to "service_role";

grant select on table "public"."activity_participants" to "service_role";

grant trigger on table "public"."activity_participants" to "service_role";

grant truncate on table "public"."activity_participants" to "service_role";

grant update on table "public"."activity_participants" to "service_role";

grant delete on table "public"."mates" to "anon";

grant insert on table "public"."mates" to "anon";

grant references on table "public"."mates" to "anon";

grant select on table "public"."mates" to "anon";

grant trigger on table "public"."mates" to "anon";

grant truncate on table "public"."mates" to "anon";

grant update on table "public"."mates" to "anon";

grant delete on table "public"."mates" to "authenticated";

grant insert on table "public"."mates" to "authenticated";

grant references on table "public"."mates" to "authenticated";

grant select on table "public"."mates" to "authenticated";

grant trigger on table "public"."mates" to "authenticated";

grant truncate on table "public"."mates" to "authenticated";

grant update on table "public"."mates" to "authenticated";

grant delete on table "public"."mates" to "service_role";

grant insert on table "public"."mates" to "service_role";

grant references on table "public"."mates" to "service_role";

grant select on table "public"."mates" to "service_role";

grant trigger on table "public"."mates" to "service_role";

grant truncate on table "public"."mates" to "service_role";

grant update on table "public"."mates" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


  create policy "Activities are viewable by everyone"
  on "public"."activities"
  as permissive
  for select
  to public
using (true);



  create policy "Authenticated users can create activities"
  on "public"."activities"
  as permissive
  for insert
  to public
with check ((auth.uid() = creator_id));



  create policy "Creators can delete own activities"
  on "public"."activities"
  as permissive
  for delete
  to public
using ((auth.uid() = creator_id));



  create policy "Creators can update own activities"
  on "public"."activities"
  as permissive
  for update
  to public
using ((auth.uid() = creator_id));



  create policy "Invitees can update invite status"
  on "public"."activity_invites"
  as permissive
  for update
  to public
using ((auth.uid() = invitee_id))
with check ((auth.uid() = invitee_id));



  create policy "Inviters can create invites"
  on "public"."activity_invites"
  as permissive
  for insert
  to public
with check ((auth.uid() = inviter_id));



  create policy "Inviters can delete invites"
  on "public"."activity_invites"
  as permissive
  for delete
  to public
using ((auth.uid() = inviter_id));



  create policy "Users can view their own invites"
  on "public"."activity_invites"
  as permissive
  for select
  to public
using (((auth.uid() = inviter_id) OR (auth.uid() = invitee_id)));



  create policy "Participants are viewable by everyone"
  on "public"."activity_participants"
  as permissive
  for select
  to public
using (true);



  create policy "Users can join activities"
  on "public"."activity_participants"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can leave activities"
  on "public"."activity_participants"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Allow users to delete their own mate connections"
  on "public"."mates"
  as permissive
  for delete
  to public
using (((requester_id = auth.uid()) OR (receiver_id = auth.uid())));



  create policy "Users can send mate requests"
  on "public"."mates"
  as permissive
  for insert
  to public
with check ((auth.uid() = requester_id));



  create policy "Users can update mate requests they received"
  on "public"."mates"
  as permissive
  for update
  to public
using ((auth.uid() = receiver_id));



  create policy "Users can view their mates"
  on "public"."mates"
  as permissive
  for select
  to public
using (((auth.uid() = requester_id) OR (auth.uid() = receiver_id)));



  create policy "System can create notifications"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (true);



  create policy "Users can update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


