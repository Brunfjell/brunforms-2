export default function Mailsend({ template, onClose }) {
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");

  return (
    <div className="p-4 border rounded bg-base-100">
      <h3 className="font-bold mb-2">Send Mail: {template?.name}</h3>
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="input input-bordered w-full mb-2"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="textarea textarea-bordered w-full mb-2"
        rows={6}
      />
      <div className="flex gap-2">
        <button className="btn btn-primary text-white">Send</button>
        <button className="btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
