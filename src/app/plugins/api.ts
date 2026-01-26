export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    async onResponseError({ response }) {
      if (response.status === 401) {
        // Example code
      }
    },
  });

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api,
    },
  };
});
