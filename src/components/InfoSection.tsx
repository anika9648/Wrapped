export default function InfoSection({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-500">{label}</h2>
      <p className="text-[#1f2430]">{value}</p>
    </div>
  );
}
