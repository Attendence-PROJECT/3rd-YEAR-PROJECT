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
      <h2 className="text-2xl font-bold text-white">Reports</h2>
      <Alert message={error} onClose={() => setError('')} />

      <section className="rounded-xl border border-white/15 bg-white/8 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <h3 className="font-semibold text-white">Class report</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            placeholder="Class ID e.g. CSE-A"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40"
          />
          <button type="button" onClick={loadClass} className="rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-[#03131a]">
            Load
          </button>
        </div>
        {classReport && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm text-white/80">
              <thead>
                <tr className="text-left text-white/70">
                  <th className="py-2">Student</th>
                  <th>Present</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {classReport.students.map((row) => (
                  <tr key={row.student._id} className="border-t border-white/10">
                    <td className="py-2">{row.student.name}</td>
                    <td>
                      {row.present}/{row.totalSessions}
                    </td>
                    <td className={row.belowThreshold ? 'font-semibold text-red-400' : ''}>
                      {row.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-white/15 bg-white/8 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <h3 className="font-semibold text-white">Subject report</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="" className="text-slate-900">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id} className="text-slate-900">
                {s.code} — {s.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={loadSubject} className="rounded-lg bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-[#03131a]">
            Load
          </button>
        </div>
        {subjectReport && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm text-white/80">
              <thead>
                <tr className="text-left text-white/70">
                  <th className="py-2">Student</th>
                  <th>Present</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {subjectReport.students.map((row) => (
                  <tr key={row.student._id} className="border-t border-white/10">
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
