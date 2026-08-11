import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createSubject } from '../../services/subject.service';

const initialFormState = {
  subjectCode: '',
  subjectName: '',
  department: '',
  semester: '',
  roomType: '',
  classesPerWeek: '',
  duration: '',
};

function Field({ label, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-mono uppercase tracking-wide text-slate">
        {label}
      </label>
      <input
        {...inputProps}
        className="bg-paper border border-line rounded-md px-3 py-2 text-ink outline-none transition focus:border-indigo focus:ring-2 focus:ring-indigo-soft"
      />
    </div>
  );
}

function SubjectForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      await createSubject({
        ...formData,
        semester: Number(formData.semester),
        classesPerWeek: Number(formData.classesPerWeek),
        duration: Number(formData.duration),
      });
      navigate('/subjects');
    } catch (error) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-xl mx-auto">
        <Link
          to="/subjects"
          className="text-xs font-mono uppercase tracking-wide text-slate hover:text-indigo"
        >
          ← Back to Subjects
        </Link>

        <h1 className="font-display text-3xl text-ink mt-2 mb-1">Add Subject</h1>
        <p className="text-slate text-sm mb-6">
          Create a new subject for the department curriculum.
        </p>

        <div className="bg-paper-raised border border-line rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field
              label="Subject Code"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              placeholder="e.g. CS501"
              required
            />
            <Field
              label="Subject Name"
              name="subjectName"
              value={formData.subjectName}
              onChange={handleChange}
              placeholder="e.g. Database Management Systems"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />
              <Field
                label="Semester"
                name="semester"
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={handleChange}
                placeholder="1–8"
                required
              />
            </div>

            <Field
              label="Room Type"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
              placeholder="e.g. CLASSROOM"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Classes Per Week"
                name="classesPerWeek"
                type="number"
                min="1"
                value={formData.classesPerWeek}
                onChange={handleChange}
                placeholder="e.g. 3"
                required
              />
              <Field
                label="Duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Time-slot units"
                required
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-absent bg-absent-soft border border-absent/20 rounded-md px-3 py-2">
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <Link to="/subjects" className="text-sm text-slate hover:text-ink px-4 py-2">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-indigo hover:bg-indigo-dark text-white text-sm font-medium rounded-md px-5 py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Saving…' : 'Save Subject'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SubjectForm;