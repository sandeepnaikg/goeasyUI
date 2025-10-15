export default function Careers() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Careers</h1>
        <p className="text-gray-700">We’re growing! Join our remote-friendly team across Product, Engineering, and Design.</p>
        <ul className="list-disc pl-6 mt-4 text-gray-700 space-y-2">
          <li>Frontend Engineer (React/TypeScript)</li>
          <li>Mobile Engineer (React Native)</li>
          <li>Product Designer</li>
        </ul>
        <p className="text-gray-700 mt-4">Send your profile to <a className="text-blue-600 hover:underline" href="mailto:careers@gozy.com">careers@gozy.com</a>.</p>
      </div>
    </div>
  );
}
