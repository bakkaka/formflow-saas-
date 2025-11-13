export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1>Test Variables Environnement</h1>
      <p>OPENAI_API_KEY: {process.env.OPENAI_API_KEY ? '✅ DÉFINIE' : '❌ NON DÉFINIE'}</p>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ DÉFINIE' : '❌ NON DÉFINIE'}</p>
    </div>
  );
}