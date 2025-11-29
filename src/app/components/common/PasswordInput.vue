<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes["class"];
  placeholder?: string;
  autocomplete?: string;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="relative">
    <Input
      v-model="modelValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :class="cn('pr-10', props.class)"
    />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      :aria-label="
        showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
      "
      @click="togglePasswordVisibility"
    >
      <Icon
        :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
        class="h-4 w-4 text-muted-foreground"
      />
    </Button>
  </div>
</template>
