import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    // En móvil solo se pasan las pruebas de pantalla pequeña: el resto ya se prueba en escritorio
    // y repetirlas aquí duplicaba los inicios de sesión (Supabase limita unos 30 cada 5 minutos).
    { name: "movil", use: { ...devices["Pixel 7"] }, grep: /móvil|375 px|portada/ },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
