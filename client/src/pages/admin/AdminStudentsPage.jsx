import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { studentsApi } from '../../services/api.js';

const emptyForm = { name: '', email: '', password: '', rollNumber: '', class: '', department: '' };

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filterClass, setFilterClass] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const { data } = await studentsApi.list(filterClass ? { class: filterClass } : {});
      setStudents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, [filterClass]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await studentsApi.create(form);
      setForm(emptyForm);
      setMessage('Student created');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student?')) return;
    try {
      await studentsApi.remove(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage students</h2>
      <Alert type="success" message={message} onClose={() => setMessage('')} />
      <Alert message={error} onClose={() => setError('')} />

      <form onSubmit={handleCreate} className="grid gap-2 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-3">
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
          Add student
        </button>
      </form>

      <div className="flex gap-2">
        <input
          placeholder="Filter by class"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Roll</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.rollNumber}</td>
                <td className="px-4 py-3">{s.class}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => handleDelete(s._id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
