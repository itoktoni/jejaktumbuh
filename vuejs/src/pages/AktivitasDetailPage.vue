<template>
  <div class="fade-in-up">
    <button @click="$emit('back')"
      class="flex items-center gap-2 text-primary font-label-lg mb-stack-md hover:opacity-80 transition-opacity bg-success-soft px-4 py-2 rounded-full border-2 border-[#B7D9BC]">
      <span class="material-symbols-outlined text-xl">arrow_back</span>
      Kembali
    </button>

    <section class="mb-stack-lg">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 border-white shadow-sm" :style="{ background: item.bg }">{{ item.emoji }}</div>
        <div>
          <h2 class="font-headline-lg-mobile text-headline-lg-mobile text-text-main leading-tight">{{ item.title }}</h2>
          <p class="font-body-md text-body-md text-on-surface-variant">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <StorySection v-if="item.feature === 'story'" :stories="item.stories" :color="item.color" @open-story="openStory" />
    <RoleplaySection v-if="item.feature === 'roleplay'" :roles="item.roles" :color="item.color" @open-roleplay="openRoleplay" />
    <GameSection v-if="item.feature === 'game'" :games="item.games" :color="item.color" />
    <MonologSection v-if="item.feature === 'monolog'" :scripts="item.scripts" :color="item.color" />
    <ProjectSection v-if="item.feature === 'project'" :projects="item.projects" :color="item.color" @open-project="openProject" />
    <MusicSection v-if="item.feature === 'music'" :songs="item.songs" :color="item.color" />
    <PuzzleSection v-if="item.feature === 'puzzle'" :puzzles="item.puzzles" :color="item.color" :bg="item.bg" @open-puzzle="openPuzzle" />
    <MindfulnessSection v-if="item.feature === 'mindfulness'" :exercises="item.exercises" :color="item.color" />
    <OutdoorSection v-if="item.feature === 'outdoor'" :activities="item.activities" :color="item.color" />

    <StoryReader v-if="activeStory" :story="activeStory" :color="item.color" :bg="item.bg" @close="activeStory = null" />
    <RoleplayReader v-if="activeRoleplay" :roleplay="activeRoleplay" :color="item.color" :bg="item.bg" @close="activeRoleplay = null" />
    <ProjectReader v-if="activeProject" :project="activeProject" :color="item.color" :bg="item.bg" @close="activeProject = null" />
    <PuzzleReader v-if="activePuzzle" :puzzle="activePuzzle" :color="item.color" :bg="item.bg" @close="activePuzzle = null" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import StorySection from './aktivitas/StorySection.vue'
import RoleplaySection from './aktivitas/RoleplaySection.vue'
import GameSection from './aktivitas/GameSection.vue'
import MonologSection from './aktivitas/MonologSection.vue'
import ProjectSection from './aktivitas/ProjectSection.vue'
import MusicSection from './aktivitas/MusicSection.vue'
import PuzzleSection from './aktivitas/PuzzleSection.vue'
import MindfulnessSection from './aktivitas/MindfulnessSection.vue'
import OutdoorSection from './aktivitas/OutdoorSection.vue'
import StoryReader from './StoryReader.vue'
import RoleplayReader from './RoleplayReader.vue'
import ProjectReader from './ProjectReader.vue'
import PuzzleReader from './PuzzleReader.vue'

defineProps({
  item: { type: Object, required: true }
})

defineEmits(['back'])

const activeStory = ref(null)
const activeRoleplay = ref(null)
const activeProject = ref(null)
const activePuzzle = ref(null)

function openStory(story) {
  activeStory.value = story
  history.pushState({ action: 'reader' }, '')
}

function openRoleplay(rp) {
  activeRoleplay.value = rp
  history.pushState({ action: 'reader' }, '')
}

function openProject(proj) {
  activeProject.value = proj
  history.pushState({ action: 'reader' }, '')
}

function openPuzzle(pz) {
  activePuzzle.value = pz
  history.pushState({ action: 'reader' }, '')
}

function goBack() {
  if (activeStory.value) { activeStory.value = null; return true }
  if (activeRoleplay.value) { activeRoleplay.value = null; return true }
  if (activeProject.value) { activeProject.value = null; return true }
  if (activePuzzle.value) { activePuzzle.value = null; return true }
  return false
}

defineExpose({ goBack })
</script>
