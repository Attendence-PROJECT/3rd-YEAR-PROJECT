import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { reportsApi, subjectsApi } from '../../services/api.js';

export default function TeacherReportsPage() {
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classReport, setClassReport] = useState(null);
  const [subjectReport, setSubjectReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    subjectsApi.list().then((res) => setSubjects(res.data)).catch((err) => setError(err.message));
  }, []);

  const loadClass = async () => {
    if (!className) return;
    setError('');
    try {
      const { data } = await reportsApi.class(className);
      setClassReport(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSubject = async () => {
    if (!subjectId) return;
    setError('');
    try {
      const { data } = await reportsApi.subject(subjectId);
      setSubjectReport(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports</h2>
      <Alert message={error} onClose={() => setError('')} />

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Class report</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            placeholder="Class ID e.g. CSE-A"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button type="button" onClick={loadClass} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
            Load
          </button>
        </div>
        {classReport && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Student</th>
                  <th>Present</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {classReport.students.map((row) => (
                  <tr key={row.student._id} className="border-t">
                    <td className="py-2">{row.student.name}</td>
                    <td>
                      {row.present}/{row.totalSessions}
                    </td>
                    <td className={row.belowThreshold ? 'text-red-600 font-semibold' : ''}>
                      {row.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Subject report</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={loadSubject} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
            Load
          </button>
        </div>
        {subjectReport && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Student</th>
                  <th>Present</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {subjectReport.students.map((row) => (
                  <tr key={row.student._id} className="border-t">
                    <td className="py-2">{row.student.name}</td>
                    <td>
                      {row.present}/{row.totalSessions}
                    </td>
                    <td>{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
