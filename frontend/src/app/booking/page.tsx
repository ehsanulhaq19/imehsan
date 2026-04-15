import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-hcode-muted md:py-20">
      <Link href="/" className="hcode-link text-[11px] font-semibold uppercase tracking-[0.2em]">
        ← Home
      </Link>
      <h1 className="font-display mt-8 text-2xl uppercase text-black md:text-3xl">Book an appointment</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed">
        Files are validated in the browser and again on the server. Allowed types: PDF, common images, Word documents.
      </p>
      <div className="mt-10">
        <BookingForm />
      </div>
    </div>
  );
}

