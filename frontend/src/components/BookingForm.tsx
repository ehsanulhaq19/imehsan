"use client";

import { useEffect, useState } from "react";
import { submitAppointment } from "@/api/appointments";
import { validateBookingFiles } from "@/lib/uploads";

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

const fieldCls =
  "mt-2 w-full border border-brand-outline-soft/55 bg-brand-white px-3 py-2.5 font-brand text-[13px] font-normal normal-case tracking-normal text-brand-fg outline-none placeholder:text-brand-muted/50 focus:border-brand-tertiary/70";

const labelCls = "block font-brand text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-muted";

export function BookingForm() {
  const [timezone, setTimezone] = useState("UTC");
  const [clientReady, setClientReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setTimezone(browserTimezone());
    setClientReady(true);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("timezone", timezone);
    const files = (form.elements.namedItem("files") as HTMLInputElement)?.files;
    const err = validateBookingFiles(files);
    if (err) {
      setStatus(err);
      return;
    }
    const res = await submitAppointment(fd);
    if (res.ok) setStatus("Booked. Check email if SMTP is configured.");
    else setStatus("Booking failed. Check fields and try again.");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-sm border border-brand-outline-soft/45 bg-brand-white/98 p-6 shadow-[0_20px_50px_-32px_rgb(11_28_48_/0.35)] md:p-9"
    >
      <label className={labelCls}>
        Date (YYYY-MM-DD)
        <input name="appointmentDate" required type="date" className={fieldCls} />
      </label>
      <label className={labelCls}>
        Time
        <input name="appointmentTime" required type="time" className={fieldCls} />
      </label>
      <input type="hidden" name="timezone" value={timezone} />
      {clientReady ? <p className="font-brand text-[12px] text-brand-muted/80">Timezone: {timezone}</p> : null}
      <label className={labelCls}>
        Name
        <input name="contactName" required className={fieldCls} />
      </label>
      <label className={labelCls}>
        Email
        <input name="contactEmail" required type="email" className={fieldCls} />
      </label>
      <label className={labelCls}>
        Phone <span className="font-normal text-brand-muted/70">(optional)</span>
        <input name="contactPhone" className={fieldCls} />
      </label>
      <label className={labelCls}>
        Reason
        <textarea name="reason" rows={4} className={`${fieldCls} resize-y leading-relaxed`} />
      </label>
      <label className={labelCls}>
        Attachments{" "}
        <span className="font-normal text-brand-muted/70">(PDF / images / docs, max 5MB each, no video)</span>
        <input
          name="files"
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          className="mt-2 font-brand text-[12px] font-normal normal-case tracking-normal text-brand-secondary file:mr-3 file:border file:border-brand-outline-soft/55 file:bg-brand-surface-low file:px-3 file:py-2 file:text-[10px] file:font-semibold file:uppercase file:tracking-wider file:text-brand-fg hover:file:border-brand-tertiary/50"
        />
      </label>
      <button
        type="submit"
        className="rounded-sm bg-brand-secondary px-8 py-3 font-brand text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
      >
        Submit
      </button>
      {status ? <p className="font-brand text-[14px] font-light leading-relaxed text-brand-secondary">{status}</p> : null}
    </form>
  );
}
