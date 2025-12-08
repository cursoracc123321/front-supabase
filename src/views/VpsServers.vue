<!-- src/views/VpsServers.vue -->
<template>
  <v-container>
    <h2 class="mb-4">VPS сервера</h2>

    <v-data-table
      :headers="headers"
      :items="servers"
      item-value="Id"
      class="elevation-1"
      :items-per-page-options="[10, 25, 50, 100]"
    >
      <!-- ВКЛ/ВЫКЛ сервера -->
      <template #item.IsEnabled="{ item }">
        <v-switch
          v-model="item.IsEnabled"
          :color="item.IsEnabled ? 'green' : 'grey'"
          hide-details
          inset
          @change="toggleEnabled(item)"
        />
      </template>

      <!-- ЛОГИН + копирование -->
      <template #item.User="{ item }">
        <div class="d-flex align-center">
          <span class="mr-2">{{ item.User }}</span>
          <v-btn
            icon="mdi-content-copy"
            size="x-small"
            variant="text"
            @click="copyToClipboard(item.User, 'Логин скопирован')"
          />
        </div>
      </template>

      <!-- ПАРОЛЬ + копирование -->
      <template #item.Password="{ item }">
        <div class="d-flex align-center">
          <!-- маска из звёздочек -->
          <span class="mr-2">
            {{ maskPassword(item.Password) }}
          </span>

          <!-- кнопка копирования -->
          <v-btn
            icon="mdi-content-copy"
            size="x-small"
            variant="text"
            @click="copyToClipboard(item.Password, 'Пароль скопирован')"
          />
        </div>
      </template>

      <!-- СТАТУС ЗДОРОВЬЯ -->
      <template #item.HealthStatus="{ item }">
        <div class="d-flex align-center">
          <v-icon
            size="small"
            :color="getHealthColor(item.HealthStatus)"
            class="mr-1"
          >
            mdi-circle
          </v-icon>
          <span>{{ item.HealthStatus || '—' }}</span>
        </div>
      </template>

      <!-- ДАТА последней проверки -->
      <template #item.LastHealthCheck="{ item }">
        {{ formatDate(item.LastHealthCheck) }}
      </template>
    </v-data-table>

    <!-- Snackbar для копирования -->
    <v-snackbar v-model="snackbar.show" timeout="2000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

const servers = ref([])

const headers = [
  { title: 'ID', value: 'Id' },
  { title: 'User (логин)', value: 'User' },
  { title: 'Password', value: 'Password' },
  { title: 'Hoster', value: 'Hoster' },
  { title: 'Region', value: 'Region' },
  { title: 'Health', value: 'HealthStatus' },
  { title: 'LastHealthCheck', value: 'LastHealthCheck' },
  { title: 'IsEnabled', value: 'IsEnabled' },
]

const snackbar = ref({
  show: false,
  text: '',
})

const fetchServers = async () => {
  const { data, error } = await supabase.from('VpsServers').select('*')
  if (error) {
    console.error('Ошибка загрузки VPS:', error)
  } else {
    servers.value = data
  }
}

onMounted(fetchServers)

// переключение IsEnabled
const toggleEnabled = async (item) => {
  const { error } = await supabase
    .from('VpsServers')
    .update({ IsEnabled: item.IsEnabled })
    .eq('Id', item.Id)

  if (error) {
    console.error('Ошибка обновления IsEnabled:', error)
    // откатываем локально, если не сохранилось
    item.IsEnabled = !item.IsEnabled
  }
}

// копирование в буфер
const copyToClipboard = async (value, message) => {
  try {
    await navigator.clipboard.writeText(value || '')
    snackbar.value.text = message
    snackbar.value.show = true
  } catch (e) {
    console.error('Не удалось скопировать:', e)
    snackbar.value.text = 'Не удалось скопировать'
    snackbar.value.show = true
  }
}

// цвет точки здоровья
const getHealthColor = (status) => {
  if (!status) return 'grey'
  const s = String(status).toLowerCase()

  if (s === 'healthy') return 'green'
  if (['warning', 'degraded', 'unstable'].includes(s)) return 'orange' // желтый
  return 'red'
}

const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toLocaleString()
}

const maskPassword = (password) => {
  if (!password) return '••••••'
  return '•'.repeat(password.length)
}

</script>
