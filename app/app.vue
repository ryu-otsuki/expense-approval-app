<template>
  <div>
    <header>
      <h1>経費申請アプリ</h1>
      <p>申請者が経費を登録し、承認者が確認するアプリです</p>

      <nav style="display:flex; gap: 12px;">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/requests">申請一覧</NuxtLink>
      </nav>
    </header>

    <main style="margin-top: 16px;">
      <NuxtPage />
    </main>
  </div>
</template>
