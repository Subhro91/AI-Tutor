/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fix for e.target.value
declare module 'react' {
  interface InputHTMLAttributes<T> {
    onChange?: React.ChangeEventHandler<T>;
  }
  
  interface FormEvent<T = Element> {
    preventDefault(): void;
  }

  interface ChangeEvent<T = Element> {
    target: T;
  }
}

// Add Firebase typing
declare module 'firebase/app';
declare module 'firebase/auth';
declare module 'firebase/firestore'; 