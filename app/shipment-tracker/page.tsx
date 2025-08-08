import { useRouter } from 'next/router';

const ShipmentTrackerPage = () => {
  const router = useRouter();

  const handleBack = () => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        router.back();
      } else {
        // No history, go to landing page
        router.push('/');
      }
    } else {
      // Fallback for server-side rendering
      router.push('/');
    }
  };

  // ** rest of code here **

  return (
    <div>
      {/* Page content here */}
      <button onClick={handleBack}>Back</button>
    </div>
  );
};

export default ShipmentTrackerPage;
