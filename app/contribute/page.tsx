import type { Metadata } from 'next';
import { Breadcrumb } from '../components/breadcrumb';
import { ContributeForm } from './contribute-form';

export const metadata: Metadata = {
  title: 'Contribute Bus Timetable — enbus.in',
  description:
    'Help improve Tamil Nadu bus data by uploading a photo of a timetable board at your local bus stand.',
  alternates: {
    canonical: '/contribute',
  },
  robots: { index: true, follow: true },
};

const TAMIL_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Villupuram', 'Virudhunagar',
];

const breadcrumbItems = [
  { name: 'Home', href: '/' },
  { name: 'Contribute' },
];

export default function ContributePage() {
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <section className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Contribute a timetable photo
            </h1>
            <p className="text-base leading-7 text-neutral-600">
              Bus stands across Tamil Nadu have timetable boards listing routes and
              departure times. A single photo helps us add hundreds of routes to
              enbus.in — routes that no government dataset currently covers.
            </p>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800 space-y-1">
            <p className="font-medium">What to photograph</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Timetable boards inside or outside the bus stand</li>
              <li>Route lists painted on walls or mounted on boards</li>
              <li>Departure time boards near bus bays</li>
            </ul>
          </section>

          <ContributeForm districts={TAMIL_DISTRICTS} />

          <section className="space-y-2 text-sm leading-6 text-neutral-500">
            <p>
              Your photo will be reviewed by our team, parsed for route and timing
              information, and added to the enbus.in database. We do not share
              personal information publicly.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
