import Link from "next/link";
import { ConsultationBooking } from "@/components/booking/ConsultationBooking";
import { content } from "@/lib/content-registry";

export default function BookingPage() {
  return (
    <div className="mx-auto w-full max-w-content px-page-x pb-20 pt-2 md:px-page-x-md md:pb-28 md:pt-4">
      <Link href="/" className="inline-block font-brand-mono text-fp-tag uppercase text-brand-secondary transition-colors hover:text-brand-fg">
        {content.booking.backLink}
      </Link>
      <div className="mt-6 md:mt-8">
        <ConsultationBooking />
      </div>
    </div>
  );
}
