"use client";

import { useActionState } from "react";
import { saveEventAction, type EventFormState } from "./actions";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export interface EventInitial {
  id?: string;
  title?: string;
  type?: string;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
}

const initial: EventFormState = { status: "idle" };

export function EventForm({ event, defaultDate }: { event?: EventInitial; defaultDate?: string }) {
  const [state, action, pending] = useActionState(saveEventAction, initial);
  const e = event ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      {e.id && <input type="hidden" name="id" value={e.id} />}
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {state.message}
        </p>
      )}
      <Field label="Title" required>
        {({ id }) => <Input id={id} name="title" defaultValue={e.title} required maxLength={160} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type" required>
          {({ id }) => (
            <Select id={id} name="type" defaultValue={e.type ?? "class"}>
              <option value="class">Class</option>
              <option value="assessment">Assessment</option>
              <option value="submission">Submission deadline</option>
              <option value="other">Other</option>
            </Select>
          )}
        </Field>
        <Field label="Date" required>
          {({ id }) => <Input id={id} name="date" type="date" defaultValue={e.date ?? defaultDate} required />}
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start time (optional)">
          {({ id }) => <Input id={id} name="startTime" type="time" defaultValue={e.startTime?.slice(0, 5)} />}
        </Field>
        <Field label="End time (optional)">
          {({ id }) => <Input id={id} name="endTime" type="time" defaultValue={e.endTime?.slice(0, 5)} />}
        </Field>
      </div>
      <Field label="Details (optional)">
        {({ id }) => <Textarea id={id} name="description" defaultValue={e.description ?? ""} maxLength={2000} />}
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : e.id ? "Save changes" : "Add to calendar"}
        </Button>
        {e.id && (
          <a
            href="/app/mentoring/calendar"
            className="inline-flex h-11 items-center rounded-[var(--radius)] border border-cream-200 px-5 text-sm font-medium text-ink hover:bg-cream-100"
          >
            Cancel
          </a>
        )}
      </div>
    </form>
  );
}
