import { Loader2 } from 'lucide-react';
import React from 'react'

const loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin rounded-full h-12 w-12 text-green-700" />
    </div>
  );
}

export default loading
