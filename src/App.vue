<template>
  <v-app>

    <!-- Показывать панель только если пользователь вошёл -->
    <v-app-bar
      v-if="isLoggedIn && !isLoginPage"
      app
      color="primary"
      dark
    >

      <v-spacer />

      <!-- Центр -->
      <div class="d-flex justify-center" style="flex: 1">
        <v-btn to="/accounts" variant="text" class="mx-2">SMTP accounts</v-btn>
        <v-btn to="/smtp-servers" variant="text">SMTP servers</v-btn>
        <v-btn to="/campaigns" variant="text" class="mx-2">Campaigns</v-btn>
        <v-btn to="/vps" variant="text">VPS</v-btn>
  
      </div>

      <v-spacer />

      <!-- Справа -->
      <v-btn @click="logout" variant="text">Log out</v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="mt-6">
        <router-view />
      </v-container>
    </v-main>

  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isLoggedIn = ref(false)

const isLoginPage = computed(() => route.path === '/login')

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    isLoggedIn.value = !!data.session
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session
  })
})

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>
