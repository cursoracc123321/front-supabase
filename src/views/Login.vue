<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card width="380" elevation="8">
      <v-card-title class="text-h6 text-center">
        Вход в админ-панель
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" @submit.prevent="login">

          <v-text-field
            label="Email"
            v-model="email"
            :rules="[rules.required, rules.email]"
            prepend-inner-icon="mdi-email"
            required
          />

          <v-text-field
            label="Пароль"
            v-model="password"
            :rules="[rules.required]"
            type="password"
            prepend-inner-icon="mdi-lock"
            required
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :disabled="!valid"
            class="mt-4"
          >
            Войти
          </v-btn>

        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const valid = ref(false)
const router = useRouter()

const rules = {
  required: v => !!v || 'Обязательное поле',
  email: v => /.+@.+\..+/.test(v) || 'Некорректный email',
}

const login = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    alert('Ошибка входа: ' + error.message)
    return
  }

  router.push('/accounts')
}
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
