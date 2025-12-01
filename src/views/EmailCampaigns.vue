<template>
  <v-container>
    <!-- БЛОК ФИЛЬТРОВ -->
    <v-card class="mb-4 pa-4">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.name"
            label="Фильтр по Name"
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filters.region"
            :items="regions"
            label="Фильтр по Region"
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filters.status"
            :items="statuses"
            label="Фильтр по Status"
            clearable
          />
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyDeliverable"
            label="OnlyDeliverable = true"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyClicked"
            label="OnlyClicked = true"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyNotClicked"
            label="OnlyNotClicked = true"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyNotSend"
            label="OnlyNotSend = true"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- ТАБЛИЦА КАМПАНИЙ -->
    <v-data-table
      :headers="headers"
      :items="filteredCampaigns"
      item-value="Id"
      class="elevation-1"
    >
      <template #item.CreatedAt="{ item }">
        {{ formatDate(item.CreatedAt) }}
      </template>

      <template #item.StartDate="{ item }">
        {{ formatDate(item.StartDate) }}
      </template>

      <template #item.EndDate="{ item }">
        {{ formatDate(item.EndDate) }}
      </template>
    </v-data-table>

    <!-- ФОРМА СОЗДАНИЯ КАМПАНИИ -->
    <v-card class="mt-6 pa-4">
      <v-card-title class="text-h6">
        Создать новую кампанию
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" @submit.prevent="createCampaign">
          <v-text-field
            label="Название кампании (Name)"
            v-model="form.Name"
            :rules="[rules.required]"
            required
          />

          <v-text-field
            label="Источник получателей (RecipientSource)"
            v-model="form.RecipientSource"
            :rules="[rules.required]"
            required
          />

          <v-select
            label="Регион (Region)"
            :items="regions"
            v-model="form.Region"
            :rules="[rules.required]"
            required
          />

          <v-text-field
            label="TotalToSend (общее кол-во писем)"
            v-model.number="form.TotalToSend"
            type="number"
            :rules="[rules.requiredNumber]"
            required
          />

          <v-text-field
            label="DailyLimit (лимит в день)"
            v-model.number="form.DailyLimit"
            type="number"
            :rules="[rules.requiredNumber]"
            required
          />
          <v-text-field
            label="StartDate"
            v-model="form.StartDate"
            type="datetime-local"
          />

          <v-text-field
            label="EndDate"
            v-model="form.EndDate"
            type="datetime-local"
          />

          <v-text-field
            label="Status (например: 0 - черновик, 1 - активна)"
            v-model.number="form.Status"
            type="number"
            :rules="[rules.requiredNumber]"
            required
          />

          <v-text-field
            label="BaseUrl (опционально)"
            v-model="form.BaseUrl"
          />

          <v-textarea
            label="Subjects (каждый с новой строки)"
            v-model="form.SubjectsString"
            rows="3"
          />

          <v-textarea
            label="Bodies (каждый с новой строки)"
            v-model="form.BodiesString"
            rows="3"
          />

          <div class="d-flex flex-wrap mt-2">
            <v-switch
              v-model="form.OnlyDeliverable"
              label="OnlyDeliverable"
              class="mr-4"
            />
            <v-switch
              v-model="form.OnlyNotSend"
              label="OnlyNotSend"
              class="mr-4"
            />
            <v-switch
              v-model="form.OnlyNotClicked"
              label="OnlyNotClicked"
              class="mr-4"
            />
            <v-switch
              v-model="form.OnlyClicked"
              label="OnlyClicked"
              class="mr-4"
            />
            <v-switch
              v-model="form.DoubleOptIn"
              label="DoubleOptIn"
              class="mr-4"
            />
          </div>

          <v-btn
            type="submit"
            :disabled="!valid"
            color="primary"
            class="mt-4"
          >
            Создать кампанию
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'

const campaigns = ref([])

const filters = ref({
  name: '',
  region: null,
  status: null,
  onlyDeliverable: false,
  onlyClicked: false,
  onlyNotClicked: false,
  onlyNotSend: false,
})

const regions = ['ua', 'ro', 'en'] // при необходимости дополни
const statuses = [0, 1, 2, 3, 4]        // какие статусы реально используются

const headers = [
  { title: 'ID', value: 'Id' },
  { title: 'Name', value: 'Name' },
  { title: 'Region', value: 'Region' },
  { title: 'RecipientSource', value: 'RecipientSource' },
  { title: 'TotalToSend', value: 'TotalToSend' },
  { title: 'DailyLimit', value: 'DailyLimit' },
  { title: 'Status', value: 'Status' },
  { title: 'StartDate', value: 'StartDate' },
  { title: 'EndDate', value: 'EndDate' },
  { title: 'CreatedAt', value: 'CreatedAt' },
]

const valid = ref(false)

const form = ref({
  Name: '',
  Region: '',
  RecipientSource: '',
  TotalToSend: null,
  DailyLimit: null,
  Status: 0,
  BaseUrl: '',
  StartDate: '',
  EndDate: '',
  SubjectsString: '',
  BodiesString: '',
  OnlyDeliverable: false,
  OnlyNotSend: false,
  OnlyNotClicked: false,
  OnlyClicked: false,
  DoubleOptIn: false,
})

const rules = {
  required: v => !!v || 'Обязательное поле',
  requiredNumber: v => (v !== null && v !== '' && !isNaN(v)) || 'Укажите число',
}

const toIsoOrNull = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

const fetchCampaigns = async () => {
  const { data, error } = await supabase.from('EmailCampaigns').select('*')
  if (error) {
    console.error('Ошибка загрузки кампаний:', error)
  } else {
    campaigns.value = data
  }
}

onMounted(fetchCampaigns)

const filteredCampaigns = computed(() => {
  return campaigns.value.filter(c => {
    // Name (contains)
    if (filters.value.name) {
      const q = filters.value.name.toLowerCase()
      if (!String(c.Name || '').toLowerCase().includes(q)) return false
    }

    // Region (equals)
    if (filters.value.region && c.Region !== filters.value.region) {
      return false
    }

    // Status (equals)
    if (filters.value.status !== null && filters.value.status !== undefined) {
      if (c.Status !== filters.value.status) return false
    }

    // флаги
    if (filters.value.onlyDeliverable && !c.OnlyDeliverable) return false
    if (filters.value.onlyClicked && !c.OnlyClicked) return false
    if (filters.value.onlyNotClicked && !c.OnlyNotClicked) return false
    if (filters.value.onlyNotSend && !c.OnlyNotSend) return false

    return true
  })
})

const formatDate = (val) => {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toLocaleString()
}

const createCampaign = async () => {
  const startIso = toIsoOrNull(form.value.StartDate)
  const endIso = toIsoOrNull(form.value.EndDate)

  if (!startIso) { alert('Укажите корректную StartDate'); return }
  if (!endIso)  { alert('Укажите корректную EndDate');  return }

  const payload = {
    Name: form.value.Name,
    Region: form.value.Region,
    RecipientSource: form.value.RecipientSource,
    TotalToSend: form.value.TotalToSend,
    DailyLimit: form.value.DailyLimit,
    Status: form.value.Status,
    BaseUrl: form.value.BaseUrl || null,
    OnlyDeliverable: form.value.OnlyDeliverable,
    OnlyNotSend: form.value.OnlyNotSend,
    OnlyNotClicked: form.value.OnlyNotClicked,
    OnlyClicked: form.value.OnlyClicked,
    DoubleOptIn: form.value.DoubleOptIn,
    StartDate: startIso,
    EndDate: endIso,
    CreatedAt: new Date().toISOString(),
  }

  if (form.value.SubjectsString) {
    payload.Subjects = form.value.SubjectsString
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  }

  if (form.value.BodiesString) {
    payload.Bodies = form.value.BodiesString
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  }

  const { error } = await supabase.from('EmailCampaigns').insert(payload)

  if (error) {
    console.error('Ошибка создания кампании:', error)
    return
  }

  form.value = {
    Name: '',
    Region: '',
    RecipientSource: '',
    TotalToSend: null,
    DailyLimit: null,
    Status: 0,
    BaseUrl: '',
    StartDate: '',
    EndDate: '',
    SubjectsString: '',
    BodiesString: '',
    OnlyDeliverable: false,
    OnlyNotSend: false,
    OnlyNotClicked: false,
    OnlyClicked: false,
    DoubleOptIn: false,
  }

  fetchCampaigns()
}


</script>

<style scoped>
/* пока без спец-стилей, можно добавить при необходимости */
</style>

