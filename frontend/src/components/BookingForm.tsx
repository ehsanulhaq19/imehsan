"use client";

import { useState } from "react";
import { submitAppointment } from "@/api/appointments";
import { validateBookingFiles } from "@/lib/uploads";

export function BookingForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const files = (form.elements.namedItem("files") as HTMLInputElement)?.files;
    const err = validateBookingFiles(files);
    if (err) {
      setStatus(err);
      return;
    }
    const res = await submitAppointment(fd);
    if (res.ok) setStatus("Booked — check email if SMTP is configured.");
    else setStatus("Booking failed — check fields and try again.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 border border-hcode-border bg-white p-6 md:p-8">
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Date (YYYY-MM-DD)
        <input name="appointmentDate" required type="date" className="hcode-input normal-case tracking-normal" />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Time
        <input name="appointmentTime" required type="time" className="hcode-input normal-case tracking-normal" />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Name
        <input name="contactName" required className="hcode-input normal-case tracking-normal" />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Email
        <input name="contactEmail" required type="email" className="hcode-input normal-case tracking-normal" />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Phone (optional)
        <input name="contactPhone" className="hcode-input normal-case tracking-normal" />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Reason
        <textarea name="reason" rows={4} className="hcode-input normal-case tracking-normal" />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-black">
        Attachments (PDF/images/docs, max 10MB each)
        <input name="files" type="file" multiple className="mt-2 text-xs normal-case tracking-normal" />
      </label>
      <button type="submit" className="hcode-btn">
        Submit
      </button>
      {status ? <p className="text-sm leading-relaxed">{status}</p> : null}
    </form>
  );
}

