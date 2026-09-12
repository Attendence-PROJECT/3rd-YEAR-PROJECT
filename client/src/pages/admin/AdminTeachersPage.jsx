import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { teachersApi } from '../../services/api.js';

const emptyForm = { name: '', email: '', password: '', employeeId: '', department: '' };

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await teachersApi.list();
      setTeachers(data);
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
      await teachersApi.create(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage teachers</h2>
      <Alert message={error} onClose={() => setError('')} />
      <form onSubmit={handleCreate} className="grid gap-2 rounded-xl border bg-white p-4 md:grid-cols-3">
        {Object.keys(emptyForm).map((key) => (
          <input
            key={key}
            placeholder={key}
            required={key !== 'department'}
            type={key === 'password' ? 'password' : 'text'}
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        ))}
        <button type="submit" className="rounded-lg bg-brand-600 py-2 text-sm text-white md:col-span-3">
          Add teacher
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Employee ID</th>
              <th className="px-4 py-3 text-left">Department</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="px-4 py-3">{t.name}</td>
                <td className="px-4 py-3">{t.employeeId}</td>
                <td className="px-4 py-3">{t.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
