<template>
  <v-container>
    <!-- Фильтр + кнопка группировки -->
    <div class="d-flex flex-column mb-4">
      <v-switch
        v-model="filterEnabled"
        label="Показать только включённые аккаунты"
      />

      <v-btn
        class="mt-2"
        variant="outlined"
        @click="groupByHost = !groupByHost"
      >
        {{ groupByHost ? 'Убрать группировку по Host' : 'Группировать по Host' }}
      </v-btn>
    </div>

    <v-data-table
      :headers="headers"
      :items="displayedAccounts"
      :row-props="rowProps"
      item-value="Id"
      class="elevation-1"
    >
      <!-- переключатель IsEnabled -->
      <template #item.IsEnabled="{ item }">
        <v-switch
          v-model="item.IsEnabled"
          :color="item.IsEnabled ? 'green' : 'grey'"
          :base-color="item.IsEnabled ? 'green' : 'grey'"
          @change="toggleEnabled(item)"
          hide-details
          inset
        />
      </template>

      <!-- колонка с карандашиком -->
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          @click="openEdit(item)"
        />
      </template>
    </v-data-table>

    <!-- Модалка редактирования аккаунта -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>
          Редактирование аккаунта #{{ editedAccount?.Id }}
        </v-card-title>

        <v-card-text>
          <v-form v-if="editedAccount" @submit.prevent="saveAccount">
            <v-text-field
              label="Name"
              v-model="editedAccount.Name"
              class="mb-2"
            />
            <v-text-field
              label="Host"
              v-model="editedAccount.Host"
              class="mb-2"
            />
            <v-text-field
              label="Port"
              v-model.number="editedAccount.Port"
              type="number"
              class="mb-2"
            />
            <v-text-field
              label="Username"
              v-model="editedAccount.Username"
              class="mb-2"
            />
            <v-text-field
              label="Password"
              v-model="editedAccount.Password"
              class="mb-2"
              type="password"
            />
            <v-text-field
              label="BaseUrl"
              v-model="editedAccount.BaseUrl"
              class="mb-2"
            />
            <v-text-field
              label="Provider"
              v-model="editedAccount.Provider"
              class="mb-2"
            />
            <v-text-field
              label="AllowedRegions (через запятую)"
              v-model="editedAccount.AllowedRegionsString"
              class="mb-2"
            />
            <v-text-field
              label="LimitPerDay"
              v-model.number="editedAccount.LimitPerDay"
              type="number"
              class="mb-2"
            />

            <v-text-field
              label="PausedToDate"
              v-model="editedAccount.PausedToDate"
              type="datetime-local"
              class="mb-2"
            />

            <v-switch
              label="IsEnabled"
              v-model="editedAccount.IsEnabled"
              class="mb-2"
            />
            <v-switch
              label="OnWhiteSending"
              v-model="editedAccount.OnWhiteSending"
              class="mb-2"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">
            Отмена
          </v-btn>
          <v-btn color="primary" @click="saveAccount">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

const accounts = ref([])
const filterEnabled = ref(false)
const groupByHost = ref(false)

const editDialog = ref(false)
const editedAccount = ref(null)

const headers = [
  { title: 'ID', value: 'Id' },
  { title: 'Name', value: 'Name' },
  { title: 'Host', value: 'Host' },
  { title: 'Username', value: 'Username' },
  { title: 'IsEnabled', value: 'IsEnabled' },
  { title: 'PausedToDate', value: 'PausedToDate' },
  { title: 'AllowedRegions', value: 'AllowedRegions' },
  { title: 'Действия', value: 'actions', sortable: false },
]

const fetchAccounts = async () => {
  const { data, error } = await supabase.from('SmtpAccounts').select('*')
  if (!error) accounts.value = data
  else console.error(error)
}

onMounted(fetchAccounts)

// фильтрация + «группировка» сортировкой по Host
const displayedAccounts = computed(() => {
  let list = filterEnabled.value
    ? accounts.value.filter(acc => acc.IsEnabled)
    : [...accounts.value]

  if (groupByHost.value) {
    list.sort((a, b) => {
      const ah = a.Host || ''
      const bh = b.Host || ''
      return ah.localeCompare(bh)
    })
  }

  return list
})

// подсветка строки, если аккаунт сейчас на паузе
const rowProps = ({ item }) => {
  if (!item.PausedToDate) return {}
  const pauseEnd = new Date(item.PausedToDate)
  const now = new Date()
  const isPaused = pauseEnd > now
  return {
    class: isPaused ? 'paused-row' : '',
  }
}

// переключатель IsEnabled в таблице
const toggleEnabled = async (item) => {
  const { error } = await supabase
    .from('SmtpAccounts')
    .update({ IsEnabled: item.IsEnabled })
    .eq('Id', item.Id)

  if (error) console.error('Ошибка обновления:', error)
}

// открыть модалку редактирования
const openEdit = (item) => {
  // делаем копию, чтобы не ломать строку, пока не нажали "Сохранить"
  editedAccount.value = {
    ...item,
    AllowedRegionsString: Array.isArray(item.AllowedRegions)
      ? item.AllowedRegions.join(', ')
      : item.AllowedRegions || '',
  }
  editDialog.value = true
}

// сохранить изменения в базу
const saveAccount = async () => {
  if (!editedAccount.value) return

  const payload = { ...editedAccount.value }

  // преобразуем строку AllowedRegionsString обратно в массив _text
  if (typeof payload.AllowedRegionsString === 'string') {
    const arr = payload.AllowedRegionsString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    payload.AllowedRegions = arr.length ? arr : null
  }
  delete payload.AllowedRegionsString

  const { error } = await supabase
    .from('SmtpAccounts')
    .update(payload)
    .eq('Id', payload.Id)

  if (error) {
    console.error('Ошибка обновления:', error)
    return
  }

  // обновляем локальный список
  const index = accounts.value.findIndex(acc => acc.Id === payload.Id)
  if (index !== -1) {
    accounts.value[index] = payload
  }

  editDialog.value = false
}
</script>

<style>
.paused-row {
  background-color: #fff3cd !important; /* подсветка паузы */
}
</style>
