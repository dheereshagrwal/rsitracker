<script setup lang="ts">
const client = useSupabaseAuthClient();
const router = useRouter();
const user = useSupabaseUser();
const avatarUrl = ref("");

// Login method using providers
const login = async (
  provider: "github" | "google" | "gitlab" | "bitbucket"
) => {
  const response = await client.auth.signInWithOAuth({ provider });
  if (response.error) {
    return alert("Something went wrong!");
  } else {
    console.log("success");
  }
};

watch(user, (newUser) => {
  if (newUser) {
    avatarUrl.value = newUser.user_metadata.avatar_url;
  } else {
    // Handle the case when user is null
    avatarUrl.value = user.value?.user_metadata.avatar_url;
  }
});
// Logout method
const logout = () => {
  client.auth.signOut();
  router.push("/");
};
</script>

<template>
  <div class="flex justify-between items-center">
    <p v-if="user?.email">{{ user.email }}</p>
    <div v-if="user">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Avatar"
        class="w-8 h-8 rounded-full"
      />
      <img
        v-else
        src="https://avatars.dicebear.com/api/avataaars/{{ user.email }}.svg"
        alt="Avatar"
        class="w-8 h-8 rounded-full"
      />
    </div>
    <button
      v-else
      @click="login('google')"
      class="flex items-center gap-1 bg-violet-800 px-3 py-1 rounded-xl font-poppins"
    >
      <span>Login</span> <i class="ci ci-google"></i>
    </button>
    <button class="ml-10" @click="logout">Logout</button>
  </div>
  <!-- Display the email of the user -->
</template>
