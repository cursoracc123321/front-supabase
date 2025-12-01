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
            item-title="title"
            item-value="value"
            multiple
            chips
            clearable
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-select
            v-model="filters.status"
            :items="statuses"
            label="Фильтр по Status"
            multiple
            chips
            clearable
            item-title="title"
            item-value="value"
          />
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyDeliverable"
            :color="filters.onlyDeliverable ? 'green' : 'grey'"
            label="OnlyDeliverable"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyClicked"
            :color="filters.onlyClicked ? 'green' : 'grey'"
            label="OnlyClicked"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyNotClicked"
            :color="filters.onlyNotClicked ? 'green' : 'grey'"
            label="OnlyNotClicked"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-switch
            v-model="filters.onlyNotSend"
            :color="filters.onlyNotSend ? 'green' : 'grey'"
            label="OnlyNotSend"
          />
        </v-col>
      </v-row>

    </v-card>
    <v-btn color="primary" class="mb-4" @click="dialogCreate = true">
      Создать кампанию
    </v-btn>

    <v-data-table
      :headers="headers"
      :items="filteredCampaigns"
      item-value="Id"
      class="elevation-1"
      :items-per-page-options="[
        { value: 10, title: '10' },
        { value: 25, title: '25' },
        { value: 50, title: '50' },
        { value: 100, title: '100' },]"
    >
      <template #item.Status="{ item }">
        {{ statusLabels[item.Status] ?? item.Status }}
      </template>

      <template #item.CreatedAt="{ item }">
        {{ formatDate(item.CreatedAt) }}
      </template>

      <template #item.StartDate="{ item }">
        {{ formatDate(item.StartDate) }}
      </template>

      <template #item.EndDate="{ item }">
        {{ formatDate(item.EndDate) }}
      </template>
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-eye"
          variant="text"
          color="primary"
          @click="openDetails(item)"
        />
      </template>
    </v-data-table>
    <v-dialog v-model="dialogCreate" max-width="95%">
      <v-card>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="grey"
          class="position-absolute"
          style="top: 8px; right: 8px; z-index: 10;"
          @click="dialogCreate = false"
        />
        <v-card-title class="text-h6">
          Создать новую кампанию
        </v-card-title>

        <v-card-text>
          <v-form v-model="valid" @submit.prevent="createCampaign">

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
                    label="Start date"
                    v-model="form.StartDate"
                    type="datetime-local"
                  />

                  <v-text-field
                    label="End date"
                    v-model="form.EndDate"
                    type="datetime-local"
                  />

                  <v-text-field
                    label="Status (например: 0 - delete, 1 - OK)"
                    v-model.number="form.Status"
                    type="number"
                    :rules="[rules.requiredNumber]"
                    required
                  />

                  <v-text-field
                    label="BaseUrl (опционально)"
                    v-model="form.BaseUrl"
                  />

                  <div class="mt-4">
                  <span class="text-subtitle-2">Subjects</span>

                  <v-row
                    v-for="(subj, index) in form.Subjects"
                    :key="'subj-' + index"
                    class="mb-2"
                  >
                    <v-col cols="12" class="d-flex align-center">

                      <v-textarea
                        :label="`Subject #${index + 1}`"
                        v-model="form.Subjects[index]"
                        auto-grow
                        rows="2"
                        variant="outlined"
                        density="comfortable"
                        class="flex-grow-1"
                      >
                        <!-- Кнопка '+' внутри textarea -->
                        <template #append-inner>
                          <v-btn
                            size="small"
                            icon="mdi-plus"
                            variant="text"
                            @click.stop="addSubject(index)"
                            title="Добавить Subject"
                          />
                        </template>

                        <!-- Кнопка удаления -->
                        <template #append>
                          <v-btn
                            v-if="form.Subjects.length > 1"
                            size="small"
                            icon="mdi-delete"
                            variant="text"
                            color="red"
                            @click.stop="removeSubject(index)"
                            title="Удалить Subject"
                          />
                        </template>
                      </v-textarea>

                    </v-col>
                  </v-row>
                </div>

                  <!-- Bodies: динамический список полей -->
                  <!-- Bodies: динамические инпуты с кнопкой внутри -->
                  <div class="mt-4">
                    <span class="text-subtitle-2">Bodies</span>

                    <v-row
                      v-for="(body, index) in form.Bodies"
                      :key="index"
                      class="mb-2"
                    >
                      <v-col cols="12" class="d-flex align-center">

                        <v-textarea
                          :label="`Body #${index + 1}`"
                          v-model="form.Bodies[index]"
                          auto-grow
                          rows="3"
                          variant="outlined"
                          density="comfortable"
                          class="flex-grow-1"
                        >
                          <!-- Кнопка "+" внутри -->
                          <template #append-inner>
                            <v-btn
                              size="small"
                              icon="mdi-plus"
                              variant="text"
                              @click.stop="addBody(index)"
                              title="Добавить ещё Body"
                            />
                          </template>

                          <!-- Кнопка удаления -->
                          <template #append>
                            <v-btn
                              v-if="form.Bodies.length > 1"
                              size="small"
                              icon="mdi-delete"
                              variant="text"
                              color="red"
                              @click.stop="removeBody(index)"
                              title="Удалить Body"
                            />
                          </template>
                        </v-textarea>

                      </v-col>
                    </v-row>
                  </div>

                  <div class="d-flex flex-wrap mt-2">
                    <v-switch
                      v-model="form.OnlyDeliverable"
                      :color="form.OnlyDeliverable ? 'green' : 'grey'"
                      label="OnlyDeliverable"
                      class="mr-4"
                    />
                    <v-switch
                      v-model="form.OnlyNotSend"
                      :color="form.OnlyNotSend ? 'green' : 'grey'"
                      label="OnlyNotSend"
                      class="mr-4"
                    />
                    <v-switch
                      v-model="form.OnlyNotClicked"
                      :color="form.OnlyNotClicked ? 'green' : 'grey'"
                      label="OnlyNotClicked"
                      class="mr-4"
                    />
                    <v-switch
                      v-model="form.OnlyClicked"
                      :color="form.OnlyClicked ? 'green' : 'grey'"
                      label="OnlyClicked"
                      class="mr-4"
                    />
                    <v-switch
                      v-model="form.DoubleOptIn"
                      :color="form.DoubleOptIn ? 'green' : 'grey'"
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
          </v-form>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogCreate = false">Отмена</v-btn>

          <v-btn color="primary" :disabled="!valid" @click="createCampaign">
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogView" max-width="900px" scrollable>
      <v-card>
        
        <v-btn
          icon="mdi-close"
          variant="text"
          class="position-absolute"
          style="top: 8px; right: 8px; z-index: 10;"
          @click="dialogView = false"
        />

        <v-card-title class="text-h6 pr-12">
          Детали кампании
        </v-card-title>

        <v-card-text v-if="selectedCampaign">
          <v-list density="comfortable">

            <v-list-item>
              <v-list-item-title><strong>ID:</strong> {{ selectedCampaign.Id }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>Name:</strong> {{ selectedCampaign.Name }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>Region:</strong> {{ selectedCampaign.Region }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>RecipientSource:</strong> {{ selectedCampaign.RecipientSource }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>TotalToSend:</strong> {{ selectedCampaign.TotalToSend }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>DailyLimit:</strong> {{ selectedCampaign.DailyLimit }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>Status:</strong> {{ statusLabels[selectedCampaign.Status] }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>StartDate:</strong> {{ formatDate(selectedCampaign.StartDate) }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>EndDate:</strong> {{ formatDate(selectedCampaign.EndDate) }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>CreatedAt:</strong> {{ formatDate(selectedCampaign.CreatedAt) }}</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                <strong>Bodies:</strong>
                <div class="mt-2">
                  <div
                    v-for="(b,i) in selectedCampaign.Bodies"
                    :key="i"
                    class="pa-2 mb-2 rounded bg-grey-lighten-4"
                    style="white-space: pre-wrap; line-height: 1.4;"
                  >
                    {{ b }}
                  </div>
                </div>
              </v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title><strong>Flags:</strong></v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>
                OnlyDeliverable: <strong>{{ selectedCampaign.OnlyDeliverable }}</strong><br />
                OnlyNotSend: <strong>{{ selectedCampaign.OnlyNotSend }}</strong><br />
                OnlyNotClicked: <strong>{{ selectedCampaign.OnlyNotClicked }}</strong><br />
                OnlyClicked: <strong>{{ selectedCampaign.OnlyClicked }}</strong><br />
                DoubleOptIn: <strong>{{ selectedCampaign.DoubleOptIn }}</strong>
              </v-list-item-title>
            </v-list-item>

          </v-list>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogView = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
  </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'

const campaigns = ref([])
const dialogCreate = ref(false)

const filters = ref({
  name: '',
  region: [],
  status: [],
  onlyDeliverable: false,
  onlyClicked: false,
  onlyNotClicked: false,
  onlyNotSend: false,
})

const regions = ['ua', 'ro', 'en'] // при необходимости дополни
const statuses = [
  { title: "Удалён", value: 0 },
  { title: "ОК", value: 1 },
  { title: "2", value: 2 },
  { title: "3", value: 3 },
  { title: "Черновик?", value: 4 },
]
const statusLabels = {
  0: "Удалён",
  1: "ОК",
  2: "2",
  3: "3",
  4: "Черновик?",
}

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
  { title: 'Действия', value: 'actions', sortable: false },
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
  Subjects: [''],
  Bodies: [''],
  OnlyDeliverable: false,
  OnlyNotSend: false,
  OnlyNotClicked: false,
  OnlyClicked: false,
  DoubleOptIn: false,
})

const dialogView = ref(false)
const selectedCampaign = ref(null)

const openDetails = (item) => {
  selectedCampaign.value = item
  dialogView.value = true
}

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

const addBody = (index) => {
  form.value.Bodies.splice(index + 1, 0, '')
}

const removeBody = (index) => {
  form.value.Bodies.splice(index, 1)

  if (form.value.Bodies.length === 0) {
    form.value.Bodies.push('')
  }
}
const addSubject = (index) => {
  form.value.Subjects.splice(index + 1, 0, '')
}

const removeSubject = (index) => {
  form.value.Subjects.splice(index, 1)

  if (form.value.Subjects.length === 0) {
    form.value.Subjects.push('')
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
    if (filters.value.region.length > 0) {
      if (!filters.value.region.includes(c.Region)) {
        return false
      }
    }

    // Status (one of selected)
    if (filters.value.status.length > 0) {
      if (!filters.value.status.includes(c.Status)) {
        return false
      }
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

  payload.Subjects = form.value.Subjects
    .map(s => s.trim())
    .filter(Boolean)

  if (!payload.Subjects.length) {
    delete payload.Subjects
  }

  // Bodies берём из массива input-ов
  payload.Bodies = form.value.Bodies
    .map(s => s.trim())
    .filter(Boolean)

  // если массив пустой, можно либо не отправлять поле, либо null
  if (!payload.Bodies.length) {
    delete payload.Bodies
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
    Subjects: [''],
    Bodies: [''],
    OnlyDeliverable: false,
    OnlyNotSend: false,
    OnlyNotClicked: false,
    OnlyClicked: false,
    DoubleOptIn: false,
  }

  fetchCampaigns()
  dialogCreate.value = false
}


</script>

<style scoped>
/* пока без спец-стилей, можно добавить при необходимости */
</style>

