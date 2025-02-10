//components/TestConnection.vue
<template>
  <div class="container mx-auto p-4">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">
        Test de Conexión Supabase
      </h2>
      
      <!-- Botones de prueba -->
      <div class="space-y-4">
        <!-- Botón de prueba de conexión -->
        <button 
          @click="testConnection"
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <span class="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></span>
            Conectando...
          </span>
          <span v-else>Probar Conexión</span>
        </button>

        <!-- Botón de Google -->
        <button 
          @click="signInWithGoogle"
          :disabled="loading"
          class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <!-- Icono de Google -->
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          Login con Google
        </button>
      </div>

      <!-- Mensaje de estado -->
      <div v-if="connectionStatus" class="mt-4 p-4 rounded-lg" :class="connectionStatus.error ? 'bg-red-100' : 'bg-green-100'">
        <p :class="connectionStatus.error ? 'text-red-700' : 'text-green-700'">
          {{ connectionStatus.message }}
        </p>
      </div>

      <!-- Información del usuario -->
      <div v-if="user" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold text-gray-800 mb-2">Usuario Conectado</h3>
        <div class="text-sm text-gray-600">
          <p><span class="font-medium">Email:</span> {{ user.email }}</p>
          <p v-if="user.user_metadata?.full_name">
            <span class="font-medium">Nombre:</span> {{ user.user_metadata.full_name }}
          </p>
        </div>
        <button 
          @click="handleSignOut"
          class="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $supabase } = useNuxtApp()
const loading = ref(false)
const connectionStatus = ref(null)
const user = ref(null)

// Probar conexión básica
const testConnection = async () => {
  loading.value = true
  connectionStatus.value = null
  
  try {
    const { data, error } = await $supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    connectionStatus.value = {
      error: false,
      message: '¡Conexión exitosa con Supabase!'
    }
    console.log('Datos de prueba:', data)
  } catch (error) {
    console.error('Error de conexión:', error)
    connectionStatus.value = {
      error: true,
      message: `Error de conexión: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

// Login con Google
const signInWithGoogle = async () => {
  try {
    loading.value = true
    const { data, error } = await $supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) throw error
    
    console.log('Login iniciado:', data)
  } catch (error) {
    console.error('Error de login:', error)
    connectionStatus.value = {
      error: true,
      message: `Error de login: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

// Cerrar sesión
const handleSignOut = async () => {
  try {
    loading.value = true
    const { error } = await $supabase.auth.signOut()
    if (error) throw error
    user.value = null
    connectionStatus.value = {
      error: false,
      message: 'Sesión cerrada correctamente'
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    connectionStatus.value = {
      error: true,
      message: `Error al cerrar sesión: ${error.message}`
    }
  } finally {
    loading.value = false
  }
}

// Obtener y mantener actualizado el estado de la sesión
onMounted(async () => {
  // Obtener sesión inicial
  const { data: { session } } = await $supabase.auth.getSession()
  user.value = session?.user || null

  // Suscribirse a cambios en la autenticación
  const { data: { subscription } } = $supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event)
    user.value = session?.user || null
  })

  // Limpiar suscripción al desmontar
  onUnmounted(() => {
    subscription?.unsubscribe()
  })
})
</script>