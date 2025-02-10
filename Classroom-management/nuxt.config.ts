// nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  
  // Configuración de runtime para Supabase
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY
    }
  },
  
  // Plugins
  plugins: [
    '~/plugins/supabase.js'
  ],

  // Configuración de Vite
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  // Ignorar advertencia de punycode
  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          ignoreDeprecations: "5.0"
        }
      }
    }
  }
});