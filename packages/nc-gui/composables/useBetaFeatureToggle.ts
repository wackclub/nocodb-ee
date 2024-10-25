import { onMounted, ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'

const FEATURES = [
  {
    id: 'infinite_scrolling',
    title: 'Infinite scrolling',
    description: 'Effortlessly browse large datasets with infinite scrolling.',
    enabled: true,
  },
  {
    id: 'geodata_column',
    title: 'Geodata column',
    description: 'Enable the geodata column.',
    enabled: false,
    isEngineering: true,
  },
  {
    id: 'form_support_column_scanning',
    title: 'Scanner for filling data in forms',
    description: 'Enable scanner to fill data in forms.',
    enabled: false,
    isEngineering: true,
  },
  {
    id: 'extensions',
    title: 'Enable extensions',
    description: 'Extensions allows you to add new features or functionalities to the platform.',
    enabled: false,
    isEngineering: true,
  },
]

export const FEATURE_FLAG = Object.fromEntries(FEATURES.map((feature) => [feature.id.toUpperCase(), feature.id])) as Record<
  Uppercase<(typeof FEATURES)[number]['id']>,
  (typeof FEATURES)[number]['id']
>

type FeatureId = (typeof FEATURES)[number]['id']
type Feature = (typeof FEATURES)[number]

const STORAGE_KEY = 'featureToggleStates'

export const useBetaFeatureToggle = createSharedComposable(() => {
  const features = ref<Feature[]>(structuredClone(FEATURES))

  const isEngineeringModeOn = ref(false)

  const saveFeatures = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(features.value))
    } catch (error) {
      console.error('Failed to save features:', error)
    }
  }

  const toggleFeature = (id: FeatureId) => {
    const feature = features.value.find((f) => f.id === id)
    if (feature) {
      feature.enabled = !feature.enabled
      saveFeatures()
    } else {
      console.error(`Feature ${id} not found`)
    }
  }

  const isFeatureEnabled = (id: FeatureId) => features.value.find((f) => f.id === id)?.enabled ?? false

  const initializeFeatures = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedFeatures = JSON.parse(stored) as Partial<Feature>[]
        features.value = FEATURES.map((defaultFeature) => ({
          ...defaultFeature,
          enabled: parsedFeatures.find((f) => f.id === defaultFeature.id)?.enabled ?? defaultFeature.enabled,
        }))
      }
    } catch (error) {
      console.error('Failed to initialize features:', error)
    }
    saveFeatures()
  }

  onMounted(initializeFeatures)

  return {
    features,
    toggleFeature,
    isFeatureEnabled,
    isEngineeringModeOn,
  }
})
