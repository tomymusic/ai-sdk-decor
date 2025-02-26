"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  customClass?: string; // Agregamos una propiedad para evitar una interfaz vacía
}

export default function Input({ customClass, ...props }: InputProps) {
  return <input {...props} className={`border p-2 rounded ${customClass || ""}`} />;
}
