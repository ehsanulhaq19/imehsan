"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitAppointment } from "@/api/appointments";
import { content } from "@/lib/content-registry";
import { validateBookingFiles } from "@/lib/uploads";

const B = content.booking;
const P = content.profile;
const SLOTS = B.timeSlots;

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatSlotRange(value: string, durationMinutes = 60) {
  const [h, m] = value.split(":").map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleTimeString(undefined, opts)} – ${end.toLocaleTimeString(undefined, opts)}`;
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function IconArrowForward({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconVideo({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export function ConsultationBooking() {
  const [timezone, setTimezone] = useState("UTC");
  const [clientReady, setClientReady] = useState(false);
  const today0 = useMemo(() => startOfToday(), []);

  useEffect(() => {
    setTimezone(browserTimezone());
    setClientReady(true);
  }, []);
  const [step, setStep] = useState(0);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstMondayIndex = (new Date(y, m, 1).getDay() + 6) % 7;

  const cells = useMemo(() => {
    const out: ({ type: "blank" } | { type: "day"; n: number; date: Date; disabled: boolean })[] = [];
    for (let i = 0; i < firstMondayIndex; i++) out.push({ type: "blank" });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d, 12, 0, 0, 0);
      const disabled = date < today0;
      out.push({ type: "day", n: d, date, disabled });
    }
    return out;
  }, [y, m, daysInMonth, firstMondayIndex, today0]);

  const bumpMonth = useCallback((delta: number) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1, 12, 0, 0, 0));
  }, []);

  const slotDayLabel = selectedDate
    ? selectedDate.toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric" })
    : B.calendar.selectDatePrompt;

  const selectedSlotLabel = selectedSlot ? formatSlotRange(selectedSlot) : B.preview.none;
  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : B.preview.none;

  function resetBooking() {
    setStep(0);
    setSelectedDate(null);
    setSelectedSlot(null);
    setReason("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setFiles([]);
    setBooked(false);
    setStatus(null);
  }

  function goToStep(next: number) {
    setStatus(null);
    setStep(next);
  }

  function fileListFromState() {
    return files.length ? createFileList(files) : null;
  }

  function continueFromDateStep() {
    if (!selectedDate || !selectedSlot) {
      setStatus(B.form.messages.needDateAndSlot);
      return;
    }
    setStatus(null);
    setStep(1);
  }

  function continueFromDetailsStep() {
    if (!reason.trim() || !contactName.trim() || !contactEmail.trim()) {
      setStatus(B.form.messages.needDetails);
      return;
    }
    const fileErr = validateBookingFiles(fileListFromState());
    if (fileErr) {
      setStatus(fileErr);
      return;
    }
    setStatus(null);
    setStep(2);
  }

  async function onSubmit() {
    if (!selectedDate || !selectedSlot) {
      setStep(0);
      setStatus(B.form.messages.needDateAndSlot);
      return;
    }
    if (!reason.trim() || !contactName.trim() || !contactEmail.trim()) {
      setStep(1);
      setStatus(B.form.messages.needDetails);
      return;
    }
    const err = validateBookingFiles(fileListFromState());
    if (err) {
      setStep(1);
      setStatus(err);
      return;
    }
    setStatus(null);
    const fd = new FormData();
    fd.set("appointmentDate", toYmd(selectedDate));
    fd.set("appointmentTime", selectedSlot);
    fd.set("timezone", timezone);
    fd.set("contactName", contactName.trim());
    fd.set("contactEmail", contactEmail.trim());
    if (contactPhone.trim()) fd.set("contactPhone", contactPhone.trim());
    fd.set("reason", reason.trim());
    for (const file of files) fd.append("files", file);
    setSubmitting(true);
    try {
      const res = await submitAppointment(fd);
      if (res.ok) {
        setBooked(true);
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => resetBooking(), 5000);
      } else setStatus(B.form.messages.failure);
    } finally {
      setSubmitting(false);
    }
  }

  const prep = B.preparation;
  const nav = B.navigation;
  const preview = B.preview;

  return (
    <>
      <section className="mb-16 md:mb-20">
        <span className="mb-4 block font-brand text-fp-small font-medium uppercase text-brand-tertiary">{B.hero.eyebrow}</span>
        <h1 className="font-brand-display text-fp-hero mb-6 max-w-3xl font-bold text-brand-fg">{B.hero.title}</h1>
        <p className="max-w-2xl font-brand text-fp-hero-sub font-medium leading-[1.75] text-brand-secondary">
          {B.hero.leadBeforeName}
          {P.name}
          {B.hero.leadAfterName}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-4">
          <div className="flex flex-col gap-6 rounded-xl border border-brand-outline/10 bg-brand-white p-8">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-brand-surface">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote stitch asset */}
              <img alt={B.profileCard.imageAlt} className="h-full w-full object-cover" src={B.profileCard.imageUrl} />
            </div>
            <div>
              <h2 className="font-brand-display text-fp-sub mb-2 font-semibold text-brand-fg">{B.profileCard.roleTitle}</h2>
              <p className="mb-4 font-brand text-fp-body text-brand-secondary">{B.profileCard.sessionSubtitle}</p>
              <div className="flex items-center gap-2 text-brand-tertiary">
                <IconVideo className="h-5 w-5 shrink-0" />
                <span className="font-brand text-fp-small font-medium">{B.profileCard.videoChannels}</span>
              </div>
            </div>
            <hr className="border-brand-outline/10" />
            <div className="space-y-4">
              <p className="font-brand-accent text-fp-caption italic leading-relaxed text-brand-secondary">{B.profileCard.feeNote}</p>
            </div>
          </div>

          <div className="rounded-xl border border-brand-outline/10 bg-brand-surface/80 p-8">
            <h3 className="font-brand mb-4 text-fp-small font-bold uppercase text-brand-secondary">{prep.heading}</h3>
            <ul className="space-y-3 font-brand text-fp-body text-brand-secondary">
              {prep.items.map((t) => (
                <li key={t} className="flex gap-3">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-tertiary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-brand-outline/10 bg-brand-white">
            <div className="flex border-b border-brand-outline/[0.06]">
              {B.steps.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  disabled={booked || i > step}
                  onClick={() => {
                    if (!booked && i < step) goToStep(i);
                  }}
                  className={`flex-1 py-5 text-center transition-colors ${i < B.steps.length - 1 ? "border-r border-brand-outline/[0.06]" : ""} ${
                    i === step ? "bg-brand-surface-low" : i < step ? "cursor-pointer bg-brand-surface-low/60 hover:bg-brand-surface-low" : "opacity-40"
                  }`}
                >
                  <span className={`font-brand text-fp-small font-medium ${i <= step ? "text-brand-fg" : "text-brand-secondary"}`}>{label}</span>
                </button>
              ))}
            </div>

            {booked ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center p-12 text-center">
                <IconCheck className="h-16 w-16 text-brand-tertiary" />
                <p className="mt-6 max-w-md font-brand-display text-fp-sub font-semibold text-brand-fg">{B.form.messages.confirmed}</p>
              </div>
            ) : null}

            {!booked && step === 0 ? (
              <>
                <div className="grid grid-cols-1 gap-12 p-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-brand text-fp-small font-bold text-brand-fg">{monthLabel}</h4>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-brand-secondary transition-colors hover:bg-brand-surface-low hover:text-brand-fg"
                          aria-label={B.calendar.prevMonth}
                          onClick={() => bumpMonth(-1)}
                        >
                          <IconChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-brand-secondary transition-colors hover:bg-brand-surface-low hover:text-brand-fg"
                          aria-label={B.calendar.nextMonth}
                          onClick={() => bumpMonth(1)}
                        >
                          <IconChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-y-3 text-center">
                      {B.calendar.weekdayLabels.map((d) => (
                        <span key={d} className="font-brand text-fp-caption font-semibold text-brand-outline">
                          {d}
                        </span>
                      ))}
                      {cells.map((c, i) =>
                        c.type === "blank" ? (
                          <span key={`b-${i}`} />
                        ) : (
                          <button
                            key={c.n}
                            type="button"
                            disabled={c.disabled}
                        onClick={() => {
                          if (c.disabled) return;
                          setSelectedDate(c.date);
                          setSelectedSlot(null);
                          setStatus(null);
                        }}
                            className={`rounded-lg p-2 font-brand text-fp-body transition-colors ${
                              c.disabled
                                ? "cursor-not-allowed text-brand-outline/35"
                                : selectedDate && sameDay(selectedDate, c.date)
                                  ? "bg-brand-secondary font-semibold text-white"
                                  : "text-brand-fg hover:bg-brand-surface"
                            }`}
                          >
                            {c.n}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-brand text-fp-small font-bold text-brand-fg">{slotDayLabel}</h4>
                      {clientReady ? (
                        <p className="mt-2 font-brand text-fp-caption text-brand-muted/80">{B.timezoneNote.replace("{tz}", timezone)}</p>
                      ) : null}
                    </div>
                    <div className="scrollbar-hide max-h-[300px] space-y-3 overflow-y-auto pr-1">
                      {SLOTS.map((s) => {
                        const active = selectedSlot === s.value;
                        return (
                          <button
                            key={s.value}
                            type="button"
                            disabled={!selectedDate}
                            onClick={() => {
                          setSelectedSlot(s.value);
                          setStatus(null);
                        }}
                            className={`w-full rounded-lg py-4 font-brand text-fp-body transition-all ${
                              !selectedDate
                                ? "cursor-not-allowed border border-brand-outline/10 text-brand-outline/50"
                                : active
                                  ? "border-2 border-brand-tertiary bg-[#f7faff] font-medium text-brand-fg"
                                  : "border border-brand-outline/10 text-brand-secondary hover:border-brand-tertiary/60"
                            }`}
                          >
                            {clientReady ? formatSlotRange(s.value) : s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-outline/[0.06] bg-brand-surface-low/65 p-8">
                  <div className="mx-auto flex max-w-xl flex-col gap-4">
                    <button
                      type="button"
                      onClick={continueFromDateStep}
                      className="flex w-full items-center justify-center gap-3 rounded-lg bg-brand-secondary py-5 font-brand-display text-fp-button font-semibold text-white transition-all hover:opacity-90"
                    >
                      {nav.continue}
                      <IconArrowForward className="h-5 w-5" />
                    </button>
                    {status ? <p className="font-brand text-fp-small text-center text-red-600">{status}</p> : null}
                  </div>
                </div>
              </>
            ) : null}

            {!booked && step === 1 ? (
              <div className="border-t border-brand-outline/[0.06] bg-brand-surface-low/65 p-8">
                <div className="mx-auto max-w-xl space-y-8">
                  <div className="space-y-2">
                    <label htmlFor="reason" className="font-brand text-fp-small font-medium uppercase text-brand-secondary">
                      {B.form.reasonLabel}
                    </label>
                    <textarea
                      id="reason"
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full rounded-lg border border-brand-outline/10 bg-brand-white p-4 font-brand text-fp-body text-brand-fg outline-none transition-all placeholder:text-brand-muted/45 focus:border-brand-tertiary focus:ring-1 focus:ring-brand-tertiary"
                      placeholder={B.form.reasonPlaceholder}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="contactName" className="font-brand text-fp-small font-medium uppercase text-brand-secondary">
                        {B.form.organizationLabel}
                      </label>
                      <input
                        id="contactName"
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full rounded-lg border border-brand-outline/10 bg-brand-white p-4 font-brand text-fp-body text-brand-fg outline-none transition-all placeholder:text-brand-muted/45 focus:border-brand-tertiary focus:ring-1 focus:ring-brand-tertiary"
                        placeholder={B.form.organizationPlaceholder}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contactEmail" className="font-brand text-fp-small font-medium uppercase text-brand-secondary">
                        {B.form.emailLabel}
                      </label>
                      <input
                        id="contactEmail"
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-lg border border-brand-outline/10 bg-brand-white p-4 font-brand text-fp-body text-brand-fg outline-none transition-all placeholder:text-brand-muted/45 focus:border-brand-tertiary focus:ring-1 focus:ring-brand-tertiary"
                        placeholder={B.form.emailPlaceholder}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contactPhone" className="font-brand text-fp-small font-medium uppercase text-brand-secondary">
                      {B.form.phoneLabel}{" "}
                      <span className="font-normal normal-case text-brand-muted/80">{B.form.phoneOptional}</span>
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full rounded-lg border border-brand-outline/10 bg-brand-white p-4 font-brand text-fp-body text-brand-fg outline-none transition-all placeholder:text-brand-muted/45 focus:border-brand-tertiary focus:ring-1 focus:ring-brand-tertiary"
                      placeholder={B.form.phonePlaceholder}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="files" className="font-brand text-fp-small font-medium uppercase text-brand-secondary">
                      {B.form.attachmentsLabel}{" "}
                      <span className="font-normal normal-case text-brand-muted/80">{B.form.attachmentsOptional}</span>
                    </label>
                    <input
                      id="files"
                      type="file"
                      multiple
                      accept="application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                      onChange={(e) => {
                        setFiles(Array.from(e.target.files ?? []));
                        setStatus(null);
                      }}
                      className="w-full font-brand text-fp-small text-brand-secondary file:mr-3 file:rounded-md file:border file:border-brand-outline/20 file:bg-brand-surface-low file:px-3 file:py-2 file:font-semibold file:uppercase file:text-fp-caption file:text-brand-fg hover:file:border-brand-tertiary/40"
                    />
                    <p className="font-brand text-fp-caption text-brand-muted/80">{B.form.attachmentsHint}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => goToStep(0)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-outline/20 py-5 font-brand-display text-fp-button font-semibold text-brand-fg transition-all hover:bg-brand-surface"
                    >
                      <IconChevronLeft className="h-5 w-5" />
                      {nav.back}
                    </button>
                    <button
                      type="button"
                      onClick={continueFromDetailsStep}
                      className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-brand-secondary py-5 font-brand-display text-fp-button font-semibold text-white transition-all hover:opacity-90"
                    >
                      {nav.continue}
                      <IconArrowForward className="h-5 w-5" />
                    </button>
                  </div>
                  {status ? <p className="font-brand text-fp-small text-center text-red-600">{status}</p> : null}
                </div>
              </div>
            ) : null}

            {!booked && step === 2 ? (
              <div className="border-t border-brand-outline/[0.06] bg-brand-surface-low/65 p-8">
                <div className="mx-auto max-w-xl space-y-8">
                  <h4 className="font-brand text-fp-small font-bold uppercase text-brand-secondary">{preview.heading}</h4>
                  <dl className="space-y-4 rounded-lg border border-brand-outline/10 bg-brand-white p-6 font-brand text-fp-body">
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.date}</dt>
                      <dd className="text-brand-fg">{selectedDateLabel}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.time}</dt>
                      <dd className="text-brand-fg">{selectedSlotLabel}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.timezone}</dt>
                      <dd className="text-brand-fg">{timezone}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.name}</dt>
                      <dd className="text-brand-fg">{contactName.trim() || preview.none}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.email}</dt>
                      <dd className="text-brand-fg">{contactEmail.trim() || preview.none}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.phone}</dt>
                      <dd className="text-brand-fg">{contactPhone.trim() || preview.none}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.reason}</dt>
                      <dd className="whitespace-pre-wrap text-brand-fg">{reason.trim() || preview.none}</dd>
                    </div>
                    <div className="grid grid-cols-[minmax(0,8rem)_1fr] gap-3">
                      <dt className="font-medium uppercase text-brand-secondary">{preview.attachments}</dt>
                      <dd className="text-brand-fg">{files.length ? files.map((f) => f.name).join(", ") : preview.none}</dd>
                    </div>
                  </dl>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-brand-outline/20 py-5 font-brand-display text-fp-button font-semibold text-brand-fg transition-all hover:bg-brand-surface"
                    >
                      <IconChevronLeft className="h-5 w-5" />
                      {nav.back}
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void onSubmit()}
                      className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-brand-secondary py-5 font-brand-display text-fp-button font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting ? B.form.submitting : nav.confirm}
                      <IconArrowForward className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="font-brand text-fp-caption text-center text-brand-outline">{B.form.legalNote}</p>
                  {status ? <p className="font-brand text-fp-small text-center text-red-600">{status}</p> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function createFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  for (const file of files) dt.items.add(file);
  return dt.files;
}
