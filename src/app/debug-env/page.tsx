// src/app/debug-env/page.tsx
export default function DebugEnvPage() {
  return (
    <div className="p-8">
      <h1>Debug Environment Variables</h1>
      <p>OPENAI_API_KEY: {process.env.OPENAI_API_KEY ? '✅ SET' : '❌ NOT SET'}</p>
      <p>Key starts with: {process.env.OPENAI_API_KEY?.substring(0, 10)}...</p>
      <p>Key length: {process.env.OPENAI_API_KEY?.length}</p>
    </div>
  );
}