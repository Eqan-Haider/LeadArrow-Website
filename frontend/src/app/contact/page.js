export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-400 mb-8">We'd love to hear from you.</p>
        <div className="grid gap-6 sm:grid-cols-2 text-left max-w-xl mx-auto">
          <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
            <h2 className="font-semibold text-white mb-1">Email</h2>
            <p className="text-gray-300">hello@leadarrow.com</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
            <h2 className="font-semibold text-white mb-1">Phone</h2>
            <p className="text-gray-300">+1 (800) 123-4567</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
            <h2 className="font-semibold text-white mb-1">Support Hours</h2>
            <p className="text-gray-300">Mon-Fri, 9am-6pm EST</p>
          </div>
        </div>
        <a href="/" className="mt-8 inline-block text-blue-400 hover:underline">← Back to Home</a>
      </div>
    </div>
  );
}