export default function StatusSelect({ value, onChange }) {
  return (
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="accepted">Accepted</option>
      <option value="in_progress">In Progress</option>
      <option value="rescued">Rescued</option>
      <option value="cancelled">Cancelled</option>
    </select>
  )
}
