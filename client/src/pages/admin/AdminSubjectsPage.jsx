import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { subjectsApi, teachersApi } from '../../services/api.js';

const emptyForm = { code: '', name: '', class: '', department: '', teacherId: '' };

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [subRes, teachRes] = await Promise.all([subjectsApi.list(), teachersApi.list()]);
      setSubjects(subRes.data);
      setTeachers(teachRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await subjectsApi.create({
        ...form,
        teacherId: form.teacherId || undefined,
      });
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage subjects & classes</h2>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleCreate} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        <input
          placeholder="code"
          required
          value={form.code}
          onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="class"
          required
          value={form.class}
          onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          placeholder="department"
          value={form.department}
          onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={form.teacherId}
          onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Assign teacher (optional)</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 py-2 text-sm text-white">
          Add subject
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">Teacher</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="px-4 py-3">{s.code}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.class}</td>
                <td className="px-4 py-3">{s.teacher?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
