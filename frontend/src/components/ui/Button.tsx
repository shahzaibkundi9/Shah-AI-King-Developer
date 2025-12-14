export default function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-3 py-1 bg-blue-600 text-white rounded">
      {children}
    </button>
  );
}
