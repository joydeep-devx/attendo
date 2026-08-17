import Reveal from '../../components/Reveal'
import SectionHeading from '../../components/SectionHeading'

const CHECKS = [
  {
    name: 'Teacher clash',
    detail: 'A teacher cannot be scheduled in two places in the same slot.',
  },
  {
    name: 'Classroom clash',
    detail: 'A room cannot host two classes at once, across any department or section.',
  },
  {
    name: 'Section clash',
    detail: 'A section cannot have two subjects scheduled in the same period.',
  },
  {
    name: 'Time-slot overlap',
    detail: 'Multi-period classes are checked against every slot they occupy, not just the first.',
  },
  {
    name: 'Assignment validity',
    detail: 'A subject can only be scheduled with a teacher actually assigned to teach it.',
  },
  {
    name: 'Room type match',
    detail: 'Lab subjects are placed in labs, not ordinary classrooms.',
  },
]

function ConflictChecks() {
  return (
    <section className="border-y border-line bg-paper-raised">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Reveal>
          <SectionHeading eyebrow="Validation" title="Six checks on every entry">
            Conflict detection runs server-side, so a timetable cannot be saved in an
            invalid state — whether it was built by hand or generated automatically.
          </SectionHeading>
        </Reveal>

        <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKS.map((check, index) => (
            <Reveal key={check.name} delay={index * 0.06}>
              <div className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-present" />
                <div>
                  <h3 className="text-sm font-medium text-ink">{check.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{check.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ConflictChecks