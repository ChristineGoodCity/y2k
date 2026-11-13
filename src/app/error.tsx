"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="custom-grid py-12">
      <div className="col-span-full">
        <h1 className="typo-heading">We couldn’t load this page.</h1>
        <p className="mt-4">Check that WordPress is running, then try again.</p>
        <button className="mt-4 border-frame p-3" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
