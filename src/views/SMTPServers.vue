<template>
  <v-container>
    <div class="d-flex flex-column mb-4">
      <v-switch
        v-model="filterEnabled"
        :color="filterEnabled ? 'green' : 'grey'"
        label="Show only enabled accounts"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="filteredSMTPServers"
      item-value="Id"
      
      :items-per-page-options="[10, 25, 50]"
      v-model:sort-by="sortBy"
    >

      <!-- ВКЛ/ВЫКЛ -->
      <template #item.Enabled="{ item }">
        <v-switch
          v-model="item.Enabled"
          :color="item.Enabled ? 'green' : 'grey'"
          inset
          hide-details
          @change="toggleEnabled(item)"
        />
      </template>

      <!-- API KEY + копирование -->
      <template #item.Apikey="{ item }">
        <div class="d-flex align-center">
          <span class="mr-2">{{ maskKey(item.Apikey) }}</span>

          <v-btn
            icon="mdi-content-copy"
            size="x-small"
            variant="text"
            @click="copyToClipboard(item.Apikey, 'API key скопирован')"
          />
        </div>
      </template>

      <!-- TYPE отображаем badge -->
      <template #item.Type="{ item }">
        <v-chip
          :color="typeColor(item.Type)"
          size="small"
          label
        >
          {{ item.Type }}
        </v-chip>
      </template>

    </v-data-table>

    <v-snackbar v-model="snackbar.show" timeout="2000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

const servers = ref([])

const headers = [
  { title: "ID", key: "Id", maxWidth: "5vw"},
  { title: "HostName", key: "HostName", maxWidth: "5vw" },
  { title: "ApiKey", key: "Apikey", maxWidth: "20vw" },
  { title: "Region", key: "Region", maxWidth: "5vw" },
  { title: "Type", key: "Type", maxWidth: "10vw" },
  { title: "Base URL", key: "BaseUrl", maxWidth: "5vw"  },
  { title: "Limit / min", key: "LimitPerMinute", maxWidth: "5vw"  },
  { title: "Enabled", key: "Enabled", maxWidth: "10vw"  },
  { title: "Address", key: "Address", maxWidth: "20vw"  },
  
]

const snackbar = ref({ show: false, text: "" })

const fetchServers = async () => {
  const { data, error } = await supabase.from("SMTPServers").select("*")
  if (error) {
    console.error("Ошибка загрузки:", error)
  } else {
    servers.value = data
  }
}

onMounted(fetchServers)



const toggleEnabled = async (item) => {
  const { error } = await supabase
    .from("SMTPServers")
    .update({ Enabled: item.Enabled })
    .eq("Id", item.Id)

  if (error) {
    console.error("Ошибка обновления Enabled:", error)
    item.Enabled = !item.Enabled
  }
}

const copyToClipboard = async (value, msg) => {
  try {
    await navigator.clipboard.writeText(value || "")
    snackbar.value = { show: true, text: msg }
  } catch {
    snackbar.value = { show: true, text: "Ошибка копирования" }
  }
}

// маска ключа — только последние 4 символа показываем
const maskKey = (key) => {
  if (!key) return "••••••••"
  if (key.length <= 4) return "••••"
  return "••••••••••••••" + key.slice(-4)
}


const sortBy = ref([{ key: 'Id', order: 'asc' }])
const filterEnabled = ref(true)
const filteredSMTPServers = computed(() => {
  if (!filterEnabled.value) return servers.value
  return servers.value.filter(s => s.Enabled)
})

// цвет типа сервера (можно менять по желанию)
const typeColor = (type) => {
  if (!type) return "grey"
  const t = type.toLowerCase()
  if (t.includes("smtp")) return "blue"
  if (t.includes("api")) return "green"
  return "grey"
}
</script>
<style scoped>
::v-deep(.v-data-table__th[data-column="HostName"]) {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ячейки HostName */
::v-deep(.v-data-table__td[data-column="HostName"]) {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>