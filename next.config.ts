import type { NextConfig } from "next";

// Configuración de Next.js. `: NextConfig` hace que el editor autocomplete y valide las opciones.
const nextConfig: NextConfig = {
  // /api/chat lee la base de conocimiento con fs en tiempo de ejecución: hay que incluirla en el deploy.
  outputFileTracingIncludes: {
    "/api/chat": ["./backend/knowledge/**/*"],
  },
};

export default nextConfig;
