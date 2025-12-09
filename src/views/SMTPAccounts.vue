<template>
  <v-container>
    <!-- Фильтр + кнопка группировки -->
    <div class="d-flex flex-column mb-4">
      <v-switch
        v-model="filterEnabled"
        :color="filterEnabled ? 'green' : 'grey'"
        label="Show only enabled accounts"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="displayedAccounts"
      :row-props="rowProps"
      item-value="Id"
      class="elevation-1 fixed-table"
      :items-per-page-options="[
        { value: 10, title: '10' },
        { value: 25, title: '25' },
        { value: 50, title: '50' },
        { value: 100, title: '100' },]"
      v-model:sort-by="sortBy"
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
          Edit account #{{ editedAccount?.Id }}
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
              :color="editedAccount.IsEnabled ? 'green' : 'grey'"
              class="mb-2"
            />
            <v-switch
              label="OnWhiteSending"
              v-model="editedAccount.OnWhiteSending"
              :color="editedAccount.OnWhiteSending ? 'green' : 'grey'"
              class="mb-2"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="saveAccount">
            Save
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
  { title: 'ID', key: 'Id', maxWidth: "5vw" },
  { title: 'Name', key: 'Name', maxWidth: "5vw"  },
  { title: 'Host', key: 'Host', maxWidth: "5vw"  },
  { title: 'Username', key: 'Username', maxWidth: "5vw"  },
  { title: 'IsEnabled', key: 'IsEnabled' },
  { title: 'PausedToDate', key: 'PausedToDate', maxWidth: "5vw"  },
  { title: 'AllowedRegions', key: 'AllowedRegions' },
  { title: 'Actions', key: 'actions', sortable: false },
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

  if (error) console.error('Update error:', error)
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

const sortBy = ref([{ key: 'Id', order: 'asc' }])

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
    console.error('Update error:', error)
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
.fixed-table .v-data-table__th,
.fixed-table .v-data-table__td {
  white-space: nowrap;         /* всё в одну строку */
  text-overflow: ellipsis;     /* обрезаем ... */
  overflow: hidden;
}
.fixed-table .col-Name,
.fixed-table .col-Region,
.fixed-table .col-RecipientSource {
  width: 200px;
}

.fixed-table .col-BaseUrl {
  max-width: 250px;
}
</style>
