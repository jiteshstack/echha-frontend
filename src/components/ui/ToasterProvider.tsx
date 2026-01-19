"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        },
        success: {
          iconTheme: {
            primary: '#10B981', // Emerald Green
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444', // Red
            secondary: 'white',
          },
        },
      }}
    />
  );
}