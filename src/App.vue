<template>
  <div class="main-bg">
    <!-- NAVBAR -->
    <div class="custom-navbar">
      <div class="navbar-content">
        <!-- Logo section (book icon + brand name) -->
        <div class="logo">
          <i class="book icon"></i>
          <span class="brand-name">Vocab<span style="color:#ffb300;">Builder</span></span>
        </div>
        <!-- Navigation links -->
        <div class="navbar-links">
          <router-link to="/words" class="nav-link" active-class="active-link">
            <i class="list icon"></i> Words
          </router-link>
          <router-link to="/words/new" class="nav-link" active-class="active-link">
            <i class="plus icon"></i> New
          </router-link>
          <router-link to="/test" class="nav-link" active-class="active-link">
            <i class="bolt icon"></i> Test
          </router-link>
          <router-link to="/quiz-choice" class="nav-link" active-class="active-link">
            <i class="question circle icon"></i> Trắc nghiệm
          </router-link>
          <router-link to="/flashcards" class="nav-link" active-class="active-link">
            <i class="clone icon"></i> Flashcards
          </router-link>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT (renders router-view) -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
// This is the main app shell. No logic required here.
export default {
  name: 'App'
}
</script>

<style scoped>
/* Main background for entire app */
.main-bg {
  min-height: 100vh;
  width: 100vw;
  background: #f5f7fa;
}

/* Navbar: sticky, shadow, gradient background */
.custom-navbar {
  width: 100%;
  background: linear-gradient(90deg,#343d4b 50%,#3e4a5b 100%);
  box-shadow: 0 2px 12px #0002;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Navbar layout: centered content, spacing */
.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1020px;
  margin: 0 auto;
  padding: 0 30px;
  height: 58px;
}

/* Logo: icon and brand name, styled */
.logo {
  font-size: 1.43rem;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 2px;
  user-select: none;
}
.brand-name {
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
  font-weight: 700;
  color: #fff;
}

/* Navigation links: horizontal, styled, highlight on hover/active */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 20px;
}
.nav-link {
  color: #cfd8ff;
  font-size: 1.08rem;
  padding: 7px 19px 7px 13px;
  border-radius: 24px;
  transition: all 0.16s cubic-bezier(.4,0,.2,1);
  font-weight: 500;
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 7px;
  background: none;
}
/* Highlight nav link when active or hovered */
.nav-link:hover, .active-link {
  background: linear-gradient(90deg,#ffecb3,#ffb30038);
  color: #302c6e !important;
  box-shadow: 0 2px 12px #ffecb333;
}

/* Main content: center page, max width, padding */
.main-content {
  max-width: 1050px;
  margin: 36px auto 0 auto;
  background: none;
  min-height: 80vh;
  padding-bottom: 36px;
}

/* Responsive: stack navbar on small screens */
@media (max-width: 750px) {
  .navbar-content {
    flex-direction: column;
    height: auto;
    padding: 0 12px;
    gap: 10px;
    align-items: flex-start;
  }
  .main-content {
    padding: 8px;
    margin-top: 18px;
  }
}
</style>
