'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CalculatorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/?${query}` : '/');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-[#71717a]">
      REDIRECTING TO ACCURATE SYNASTRY CALCULATOR...
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-[#71717a]">
          LOADING...
        </div>
      }
    >
      <CalculatorRedirect />
    </Suspense>
  );
}
