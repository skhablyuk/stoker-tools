<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import type { Ref } from "vue";
import axios from 'axios'

const search = ref('christmas')
const lines:Ref<string[]> = ref([])

const result = ref([])

const API_KEY = "0e95b1ba7f8647799f4e755b54bdca58"

const sortKey = ref('');
const sortOrder = ref('asc');

const sortedResult = computed(() => {
  if (!sortKey.value) return result.value;
  
  return [...result.value].sort((a, b) => {
    const aValue = parseFloat(a[sortKey.value].replace(/,/g, ''));
    const bValue = parseFloat(b[sortKey.value].replace(/,/g, ''));
    return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue;
  });
});

const sort = (key: string) => {
  if (key === sortKey.value) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

onMounted(() => {
    searchCount()
})

const searchCount = async () => {
    lines.value = search.value.split("\n")
    console.log(lines.value)
    result.value = []

    const promises = lines.value.map(async (key: string) => {
        console.log(key)
        return {
            key: key,
            ai: await searchAi(key),
            all: await searchAll(key)
        }
    })

    result.value = await Promise.all(promises)

    // Use the existing sort function to sort by 'all'
    sort('all')
    
    // Ensure it's in descending order
    if (sortOrder.value === 'asc') {
        sort('all')
    }
}

const searchAll = async (key: string) => {
    const response = await axios.get('https://stock.adobe.io/Rest/Media/1/Search/Files', {
        headers: {
            'x-api-key': API_KEY,
            'x-product': 'MySampleApp/1.0'
        },
        params: {
            'search_parameters[filters][content_type:photo]': 1,
            'search_parameters[filters][gentech]': 'all',
            'search_parameters[limit]': 1,
            'search_parameters[words]': key
        }
    })

    return new Intl.NumberFormat().format(response.data.nb_results)
}

const searchAi = async (key: string): Promise<string> => {
    const response = await axios.get('https://stock.adobe.io/Rest/Media/1/Search/Files', {
        headers: {
            'x-api-key': API_KEY,
            'x-product': 'MySampleApp/1.0'
        },
        params: {
            'search_parameters[filters][content_type:photo]': 1,
            'search_parameters[filters][gentech]': 'true',
            'search_parameters[limit]': 1,
            'search_parameters[words]': key
        }
    })

    return new Intl.NumberFormat().format(response.data.nb_results)
}

const copyTableData = () => {
  const tableData = sortedResult.value.map(item => `${item.key}\t${item.all}\t${item.ai}`).join('\n');
  navigator.clipboard.writeText(tableData)
    .then(() => {
      alert('Table data copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy table data: ', err);
      alert('Failed to copy table data. Please try again.');
    });
};

</script>

<template>

    <div class="w-full">
    <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" @submit.prevent="searchCount">
        <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="search">
                search
            </label>
            <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" v-model="search" ></textarea>

            <div class="flex justify-end">
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-2">search</button>
            </div>

<!--            <p class="text-black my-2">All: {{ dataAll }}</p>-->
<!--            <p class="text-black my-2">AI: {{ dataAi }}</p>-->

            <table class="table-auto text-black w-full ">
                <thead>
                <tr>
                    <th class="border">key</th>
                    <th class="border cursor-pointer" @click="sort('all')">
                        all
                        <span v-if="sortKey === 'all'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                    <th class="border cursor-pointer" @click="sort('ai')">
                        AI
                        <span v-if="sortKey === 'ai'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span>
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, key) in sortedResult" :key="key" class="border-b">
                    <td class="border text-center">{{item.key}}</td>
                    <td class="border text-center">{{ item.all }}</td>
                    <td class="border text-center">{{ item.ai }}</td>
                </tr>
                </tbody>
            </table>
        </div>
      
      <div class="flex justify-end mt-4">
        <button @click="copyTableData" type="button" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Copy Table Data
        </button>
      </div>

    </form>
    </div>
</template>

<style scoped>

</style>